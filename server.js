'use strict';

/**
 * Custom Next.js server that adds WebSocket support for Twilio Media Streams.
 * Handles the /api/twilio/stream upgrade so the AI voice pipeline can operate
 * in real-time, as standard serverless functions do not support WebSocket.
 */

const http = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer, WebSocket } = require('ws');
const { createClient: createSupabase } = require('@supabase/supabase-js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// OpenAI Realtime API WebSocket endpoint
const OPENAI_REALTIME_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';

// ---------------------------------------------------------------------------
// Supabase helper (server-side, service role)
// ---------------------------------------------------------------------------
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabase(url, key);
}

// ---------------------------------------------------------------------------
// Persist a call event (transcript / AI response) asynchronously
// ---------------------------------------------------------------------------
async function persistCallEvent(callSid, transcript, aiResponse, intent) {
  if (!callSid) return;
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from('call_events').insert({
      call_sid: callSid,
      transcript: transcript || null,
      ai_response: aiResponse || null,
      intent: intent || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[stream] Failed to persist call event:', err);
  }
}

// ---------------------------------------------------------------------------
// Upsert a lead when intent is detected as "lead" or "book"
// ---------------------------------------------------------------------------
async function upsertLead(callSid, intent, callerName) {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('call_sid', callSid)
      .maybeSingle();
    if (!existing) {
      await supabase.from('leads').insert({
        call_sid: callSid,
        name: callerName || null,
        intent_score: intent === 'book' ? 90 : 70,
        status: 'new',
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[stream] Failed to upsert lead:', err);
  }
}

// ---------------------------------------------------------------------------
// Mark call completed
// ---------------------------------------------------------------------------
async function finalizeCall(callSid, duration) {
  if (!callSid) return;
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase
      .from('calls')
      .update({ status: 'completed', call_duration_seconds: duration })
      .eq('twilio_call_sid', callSid);
  } catch (err) {
    console.error('[stream] Failed to finalize call:', err);
  }
}

// ---------------------------------------------------------------------------
// Core: handle one Twilio Media Stream WebSocket connection
// ---------------------------------------------------------------------------
function handleTwilioMediaStream(twilioWs) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error('[stream] OPENAI_API_KEY not set – closing connection');
    twilioWs.close();
    return;
  }

  // Per-session state
  let streamSid = null;
  let callSid = null;
  let systemPrompt = null;
  let openAiReady = false;
  let responseInProgress = false;
  /** @type {string[]} */
  const transcriptParts = [];
  let detectedIntent = null;
  let callerName = null;
  const sessionStartTime = Date.now();

  // Connect to OpenAI Realtime API
  const openAiWs = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });

  // ------------------------------------------------------------------
  // Configure the Realtime session once the connection is established
  // ------------------------------------------------------------------
  openAiWs.on('open', () => {
    const sessionConfig = {
      type: 'session.update',
      session: {
        // server_vad gives us automatic turn detection (barge-in)
        turn_detection: { type: 'server_vad', silence_duration_ms: 700 },
        input_audio_format: 'g711_ulaw',
        output_audio_format: 'g711_ulaw',
        voice: 'alloy',
        instructions:
          systemPrompt ||
          'You are a professional receptionist. Greet the caller warmly and ask how you can help.',
        modalities: ['text', 'audio'],
        temperature: 0.8,
        input_audio_transcription: { model: 'whisper-1' },
        tools: [
          {
            type: 'function',
            name: 'classify_intent',
            description:
              'Classify the caller\'s intent once you have gathered enough information.',
            parameters: {
              type: 'object',
              properties: {
                intent: {
                  type: 'string',
                  enum: ['book', 'lead', 'faq', 'escalate'],
                  description: 'Detected caller intent',
                },
                confidence: {
                  type: 'number',
                  description: 'Confidence score between 0 and 1',
                },
                caller_name: {
                  type: 'string',
                  description: "Caller's name if provided",
                },
              },
              required: ['intent', 'confidence'],
            },
          },
        ],
        tool_choice: 'auto',
      },
    };
    openAiWs.send(JSON.stringify(sessionConfig));
  });

  // ------------------------------------------------------------------
  // Handle incoming OpenAI Realtime events
  // ------------------------------------------------------------------
  openAiWs.on('message', (raw) => {
    let event;
    try {
      event = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (event.type) {
      // Session ready – trigger initial greeting
      case 'session.updated':
        openAiReady = true;
        openAiWs.send(JSON.stringify({ type: 'response.create' }));
        break;

      // Stream audio delta back to Twilio
      case 'response.audio.delta':
        if (event.delta && streamSid && twilioWs.readyState === WebSocket.OPEN) {
          twilioWs.send(
            JSON.stringify({
              event: 'media',
              streamSid,
              media: { payload: event.delta },
            }),
          );
        }
        responseInProgress = true;
        break;

      // AI audio finished – clear Twilio playback buffer
      case 'response.audio.done':
        responseInProgress = false;
        if (streamSid && twilioWs.readyState === WebSocket.OPEN) {
          twilioWs.send(JSON.stringify({ event: 'clear', streamSid }));
        }
        break;

      // Accumulate assistant transcript
      case 'response.audio_transcript.delta':
        if (event.delta) transcriptParts.push(event.delta);
        break;

      // Caller speech transcript available
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          void persistCallEvent(callSid, event.transcript, null, null);
        }
        break;

      // Full response completed – persist to DB
      case 'response.done': {
        const fullResponse = transcriptParts.splice(0).join('');
        if (fullResponse && callSid) {
          void persistCallEvent(callSid, null, fullResponse, detectedIntent);
        }
        break;
      }

      // Tool call – intent classification
      case 'response.function_call_arguments.done':
        if (event.name === 'classify_intent') {
          try {
            const args = JSON.parse(event.arguments || '{}');
            detectedIntent = args.intent || null;
            if (args.caller_name) callerName = args.caller_name;
            if (
              callSid &&
              (detectedIntent === 'lead' || detectedIntent === 'book')
            ) {
              void upsertLead(callSid, detectedIntent, callerName);
            }
            // Acknowledge the tool call so the model continues
            openAiWs.send(
              JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: event.call_id,
                  output: JSON.stringify({ received: true }),
                },
              }),
            );
            openAiWs.send(JSON.stringify({ type: 'response.create' }));
          } catch (err) {
            console.error('[stream] Error parsing intent args:', err);
          }
        }
        break;

      // Barge-in: caller started speaking while AI is responding
      case 'input_audio_buffer.speech_started':
        if (responseInProgress) {
          openAiWs.send(JSON.stringify({ type: 'response.cancel' }));
          if (streamSid && twilioWs.readyState === WebSocket.OPEN) {
            twilioWs.send(JSON.stringify({ event: 'clear', streamSid }));
          }
          responseInProgress = false;
        }
        break;

      case 'error':
        console.error('[stream] OpenAI error:', event.error?.message || event.error);
        break;

      default:
        break;
    }
  });

  openAiWs.on('error', (err) => console.error('[stream] OpenAI WS error:', err));
  openAiWs.on('close', () => console.log('[stream] OpenAI connection closed'));

  // ------------------------------------------------------------------
  // Handle incoming Twilio Media Stream events
  // ------------------------------------------------------------------
  twilioWs.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.event) {
      case 'connected':
        console.log('[stream] Twilio Media Stream connected');
        break;

      case 'start': {
        streamSid = msg.start?.streamSid || null;
        callSid = msg.start?.callSid || null;
        const params = msg.start?.customParameters || {};
        const encodedPrompt = params.systemPrompt || '';
        try {
          systemPrompt = decodeURIComponent(encodedPrompt);
        } catch {
          systemPrompt = encodedPrompt;
        }
        console.log(`[stream] Stream started sid=${streamSid} call=${callSid}`);

        // Update session with real system prompt once ready
        if (openAiWs.readyState === WebSocket.OPEN && openAiReady && systemPrompt) {
          openAiWs.send(
            JSON.stringify({
              type: 'session.update',
              session: { instructions: systemPrompt },
            }),
          );
        }
        break;
      }

      case 'media':
        // Forward µ-law audio to OpenAI (g711_ulaw format, no conversion needed)
        if (openAiWs.readyState === WebSocket.OPEN && openAiReady) {
          openAiWs.send(
            JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: msg.media?.payload,
            }),
          );
        }
        break;

      case 'stop':
        console.log(`[stream] Stream stopped sid=${streamSid}`);
        if (openAiWs.readyState !== WebSocket.CLOSED) openAiWs.close();
        void finalizeCall(callSid, Math.round((Date.now() - sessionStartTime) / 1000));
        break;

      default:
        break;
    }
  });

  twilioWs.on('close', () => {
    console.log('[stream] Twilio WS closed');
    if (openAiWs.readyState !== WebSocket.CLOSED) openAiWs.close();
  });

  twilioWs.on('error', (err) => console.error('[stream] Twilio WS error:', err));
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = http.createServer((req, res) => {
      const parsedUrl = parse(req.url || '/', true);
      handle(req, res, parsedUrl).catch((err) => {
        console.error('[server] Request handler error:', err);
        res.statusCode = 500;
        res.end('Internal server error');
      });
    });

    const wss = new WebSocketServer({ noServer: true });

    // Upgrade HTTP connections to WebSocket only for the stream path
    httpServer.on('upgrade', (request, socket, head) => {
      const { pathname } = parse(request.url || '/', true);
      if (pathname === '/api/twilio/stream') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on('connection', (ws) => {
      handleTwilioMediaStream(ws);
    });

    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  });
