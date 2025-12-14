/*
  reportService.ts
  Client helper to send base64 PDF(s) to a processing proxy which
  performs OCR/extraction and calls Gemini 2.5 Flash.

  The proxy URL can be configured by setting `OPENAI_PROXY_URL` in
  your app's environment or by editing the default below.
*/

// Try the medical-specific endpoint first, then fall back to the older /process
const DEFAULT_PROXY = 'http://localhost:3000/process-medical';
const FALLBACK_PROXY = 'http://localhost:3000/process';

type UploadFile = {
  name: string;
  content_base64: string;
};

export async function uploadAndProcess(files: UploadFile[]) {
  const proxyEnv = typeof process !== 'undefined' && (process.env as any)?.OPENAI_PROXY_URL
    ? (process.env as any).OPENAI_PROXY_URL
    : null;

  const endpoints = proxyEnv ? [proxyEnv] : [DEFAULT_PROXY, FALLBACK_PROXY];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });

      const text = await resp.text();

      if (!resp.ok) {
        // include body text for debugging
        throw new Error(`Server ${endpoint} returned ${resp.status}: ${text}`);
      }

      // parse response body
      try {
        const json = JSON.parse(text);
        // prefer `reports` (old) or `results`/`merged` (new)
        if (json.reports) return json.reports;
        if (json.results || json.merged) return json.results && json.merged ? [json.merged] : (json.results || []);
        // if it's an array return it
        if (Array.isArray(json)) return json;
        // otherwise return raw object in array
        return [json];
      } catch (err) {
        throw new Error(`Failed to parse JSON from ${endpoint}: ${err?.message || err} — body: ${text}`);
      }
    } catch (err) {
      lastError = err;
      console.warn('uploadAndProcess attempt failed for', endpoint, err && err.message);
      // try next endpoint
    }
  }

  throw new Error('All processing endpoints failed. Last error: ' + (lastError && (lastError.message || String(lastError))));
}

export default { uploadAndProcess };
