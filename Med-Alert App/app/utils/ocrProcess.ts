const GOOGLE_API_KEY = 'KeyFromYourEnvironmentOrConfig';

type UploadFile = { name: string; content_base64: string; mimeType?: string };


if (!GOOGLE_API_KEY) {
  console.warn("❗ No Google API key set in ocrProcess.ts!");
}

// Load Gemini SDK
let GoogleGenerativeAI: any = null;
try {
  const g = require("@google/generative-ai");
  GoogleGenerativeAI = g?.GoogleGenerativeAI ?? null;
} catch {
  console.warn("⚠️ Install using: npm i @google/generative-ai");
}

function medicalPrompt(filename: string) {
  return `
You are an OCR and medical report extraction assistant. Extract and return ONLY this JSON:

{
 "id":"(unique)",
 "title":"(short title)",
 "report_date":"(date or empty)",
 "patient": { "name":"","id":"","dob":"","gender":"","address":"" },
 "hospital":"","department":"","doctor":"",
 "clinical_history":"","findings":"","impression":"",
 "diagnoses":[], "medications":[], "vitals":{}, "labs":{}, "procedures":[],
 "allergies":[], "recommendations":"",
 "full_text":"(full extracted text)"
}

If a field is missing, leave it empty. Do not add explanation. File: ${filename}.
`;
}

export async function processFilesInline(files: UploadFile[]) {
  if (!GOOGLE_API_KEY) throw new Error("Google Gemini API key missing!");

  if (!GoogleGenerativeAI)
    throw new Error("Gemini library not installed! npm i @google/generative-ai");

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const results: any[] = [];

  for (const f of files) {
    // 🛑 Skip unreadable base64 (fix “no pages” error)
    if (!f.content_base64 || f.content_base64.length < 1000) {
      results.push({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title: f.name,
        date: new Date().toISOString(),
        summary: "⚠️ File unreadable (empty or corrupted).",
        fields: { error: "Empty/Invalid Base64 file" },
      });
      continue;
    }

    const prompt = medicalPrompt(f.name);

    try {
      const response = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: f.content_base64,
            mimeType: f.mimeType || "application/pdf",
          },
        },
      ]);

      const text = response?.response?.text?.() ?? "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = {
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
          title: f.name,
          full_text: cleaned,
        };
      }

      const summary =
        parsed.summary ||
        parsed.impression ||
        parsed.findings ||
        parsed.recommendations ||
        parsed.full_text?.slice(0, 500) ||
        "No summary extracted.";

      results.push({
        id: parsed.id || Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title: parsed.title || f.name,
        date: parsed.report_date || new Date().toISOString(),
        summary,
        fields: parsed,
      });
    } catch (err: any) {
      console.error("Gemini OCR failed:", err?.message);

      results.push({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        title: f.name,
        date: new Date().toISOString(),
        summary: "❌ OCR failed.",
        fields: { error: err?.message || "Unknown Gemini error" },
      });
    }
  }

  return results;
}

export default { processFilesInline };
