'use client';

import { useEffect } from 'react';

interface TallyEmbedProps {
  formId?: string;
  height?: number;
}

const defaultFormId = process.env.NEXT_PUBLIC_TALLY_FORM_ID ?? '';

export function TallyEmbed({ formId = defaultFormId, height = 600 }: TallyEmbedProps) {
  useEffect(() => {
    if (!formId) {
      console.warn('[TallyEmbed] No formId provided and NEXT_PUBLIC_TALLY_FORM_ID is not set. The form will not load.');
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [formId]);

  return (
    <iframe
      data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=0&transparentBackground=1&dynamicHeight=1`}
      loading="lazy"
      width="100%"
      height={height}
      frameBorder={0}
      marginHeight={0}
      marginWidth={0}
      title="Contact form"
      style={{ border: 'none', background: 'transparent' }}
    />
  );
}
