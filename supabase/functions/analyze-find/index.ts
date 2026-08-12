// Supabase Edge Function: analyze-find
//
// Takes a pasted caption (+ optional source URL) and returns candidate
// products extracted by an AI model. Deliberately does NOT try to fetch
// and scrape the source URL server-side — Instagram/TikTok/etc actively
// block naive server-side fetches, so that would silently produce poor
// results for most real posts. The caption is supplied directly by the
// user (copy-pasted from the post), which is a reliable, always-available
// signal per the extraction-order priority (creator-supplied text ranks
// above scraped metadata).
//
// This function ONLY extracts candidate products and returns them to the
// caller — it does not write to the database. The client shows a draft
// review screen (the user can edit/remove results) before anything is
// saved as a real Find/Products, matching the project's "never store
// unvalidated AI output as trusted data" rule.
//
// Secrets required (set via `supabase secrets set` or the dashboard):
//   OPENAI_API_KEY  - required
//   OPENAI_MODEL    - optional, defaults to a low-cost model below.
//                     Override this to change models without a redeploy.
// SUPABASE_URL / SUPABASE_ANON_KEY are auto-injected by the platform.

import { createClient } from 'npm:@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const MAX_CAPTION_LENGTH = 4000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ExtractedProduct = {
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error('[analyze-find] OPENAI_API_KEY is not set');
      return json({ error: 'Server is not configured with an AI provider.' }, 500);
    }

    // This endpoint costs real money per call — it must never be usable
    // anonymously. Require a real signed-in user, not just a valid anon key.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header.' }, 401);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'Invalid or expired session.' }, 401);
    }

    const body = await req.json().catch(() => null);
    const caption = typeof body?.caption === 'string' ? body.caption.trim() : '';
    const sourceUrl = typeof body?.sourceUrl === 'string' ? body.sourceUrl.trim() : '';

    if (!caption) {
      return json({ error: 'caption is required.' }, 400);
    }
    if (caption.length > MAX_CAPTION_LENGTH) {
      return json({ error: `caption is too long (${MAX_CAPTION_LENGTH} characters max).` }, 400);
    }

    const products = await extractProducts(caption, sourceUrl);
    return json({ products });
  } catch (error) {
    console.error('[analyze-find]', error);
    return json({ error: 'Something went wrong analysing this content.' }, 500);
  }
});

async function extractProducts(caption: string, sourceUrl: string): Promise<ExtractedProduct[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You extract real, concrete products explicitly named or clearly described in a social ' +
            "media post caption. Only list products that are actually mentioned — never invent items " +
            'that are not there. If no products are mentioned, return an empty products array. Keep ' +
            'each description to one short phrase.',
        },
        {
          role: 'user',
          content: sourceUrl ? `Source: ${sourceUrl}\n\nCaption:\n${caption}` : `Caption:\n${caption}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'product_extraction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    brand: { type: ['string', 'null'] },
                    category: { type: ['string', 'null'] },
                    description: { type: ['string', 'null'] },
                  },
                  required: ['name', 'brand', 'category', 'description'],
                  additionalProperties: false,
                },
              },
            },
            required: ['products'],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${detail}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('OpenAI returned an unexpected response shape.');
  }

  const parsed = JSON.parse(content) as { products?: ExtractedProduct[] };
  return parsed.products ?? [];
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
