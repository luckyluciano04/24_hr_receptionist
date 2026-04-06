import { google } from 'googleapis';

const HEADERS = [
  'Timestamp',
  'Business Name',
  'Contact',
  'Phone',
  'Email',
  'Tier',
  'Call Count',
  'Status',
  'Last Call',
  'Notes',
];

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
  }

  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(raw) as Record<string, string>;
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON');
  }

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing required service account fields');
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function ensureHeaders(
  sheets: ReturnType<typeof google.sheets>,
  sheetId: string,
): Promise<void> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Sheet1!A1:J1',
  });
  const firstRow = res.data.values?.[0];
  if (!firstRow || firstRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:J1',
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendRow(sheetId: string, values: string[]): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await ensureHeaders(sheets, sheetId);
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:J',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

export async function updateRow(
  sheetId: string,
  rowIndex: number,
  values: string[],
): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Sheet1!A${rowIndex}:J${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}
