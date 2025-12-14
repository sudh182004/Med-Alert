#!/usr/bin/env node
/**
 * Simple example Express server to accept base64 PDFs, extract text,
 * call OpenAI Gemini 2.5 Flash (Responses API) to extract medical report
 * data and return JSON.
 *
 * Usage:
 *   - set environment variable OPENAI_API_KEY
 *   - `node scripts/openai-server.js`
 *
 * Note: This is a minimal example. For production you should add auth,
 * validation, rate limiting and robust error handling.
 */

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');
const fs = require('fs');
// Optional: the official Google Generative AI client if installed
let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  console.warn('Optional package @google/generative-ai not installed. /process-medical will require it.');
}

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

const OPENAI_KEY = "AIzaSyAhSYNmjY2nilxSHIEK52uFErNI1T6y9F0";
if (!OPENAI_KEY) {
  console.warn('WARNING: OPENAI_API_KEY not set. Server will fail to call OpenAI.');
}

function makePromptForText(text) {
  return `You are a medical report data extractor. Given the text of a medical/health PDF, extract structured information and a short patient-facing summary. Respond with ONLY a JSON object with the following fields:\n- id: a short unique id string\n- title: short title (e.g., "Discharge Summary" or filename)\n- date: best-guess date of report\n- summary: 3-6 sentence plain-language summary of important findings, medications, and next steps\n- fields: an object containing extracted fields (patient_name, dob, diagnoses (array), medications (array), vitals, labs (object))\n\nHere is the PDF text:\n\n${text}\n\nReturn valid JSON only.`;
}

async function callGemini(prompt) {
  const url = 'https://api.openai.com/v1/responses';
  const body = {
    model: 'gemini-2.5-flash',
    input: prompt,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error('OpenAI API error: ' + txt);
  }

  const json = await res.json();

  // Try to extract text content in a few common locations
  let textOut = '';
  if (json.output_text) textOut = json.output_text;
  else if (Array.isArray(json.output) && json.output.length > 0) {
    // try to join content pieces
    textOut = json.output
      .map((o) => {
        if (!o.content) return '';
        return o.content.map((c) => c.text || c.text_description || '').join('');
      })
      .join('\n');
  }

  return { raw: json, text: textOut };
}

app.post('/process', async (req, res) => {
  try {
    const { files } = req.body || {};
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const reports = [];

    for (const f of files) {
      const { name, content_base64 } = f;
      const buffer = Buffer.from(content_base64, 'base64');

      // Try PDF text extraction
      let text = '';
      try {
        const data = await pdf(buffer);
        text = (data && data.text) || '';
      } catch (err) {
        console.warn('pdf-parse failed, falling back to raw buffer to string', err && err.message);
        text = buffer.toString('utf8');
      }

      // Build prompt and call Gemini
      const prompt = makePromptForText(text || `File: ${name} (no text extracted)`);
      const g = await callGemini(prompt);

      // Try parse JSON from model text
      let parsed = null;
      try {
        parsed = JSON.parse(g.text.trim());
      } catch (err) {
        // If model didn't return strict JSON, include raw text in summary
        parsed = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: name,
          date: new Date().toISOString(),
          summary: g.text || 'Could not parse model output',
          fields: {},
        };
      }

      reports.push(parsed);
    }

    return res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
});

// New route: /process-medical
// Accepts JSON body { uploads: [{ docType? }], files: multipart/form-data handled by middleware }
// For simplicity this endpoint expects a JSON POST with `files` array where each item has
// { originalname, mimetype, buffer (base64 string) } or accepts the same structure as /process.
app.post('/process-medical', async (req, res) => {
  try {
    if (!GoogleGenerativeAI) {
      return res.status(500).json({ error: '@google/generative-ai package not available on the server.' });
    }

    const API_KEY = process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY or GOOGLE_API_KEY not set in environment.' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Accept either body.files (array) or body.uploads/files structure similar to client
    const incomingFiles = req.body && req.body.files ? req.body.files : req.body.files || req.body;

    // Normalize files array: each file should have { originalname, mimetype, buffer/base64 }
    const files = Array.isArray(incomingFiles) ? incomingFiles : [];
    if (files.length === 0) return res.status(400).json({ error: 'No files provided' });

    const results = [];
    const mergedData = {};

    // Helper: merge parsed object into mergedData (simple merge with array concat)
    function mergeInto(target, src) {
      for (const key of Object.keys(src || {})) {
        const val = src[key];
        if (Array.isArray(val)) {
          target[key] = Array.isArray(target[key]) ? [...target[key], ...val] : [...val];
          // dedupe simple primitives
          target[key] = Array.from(new Set(target[key].map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))))
            .map((v) => {
              try { return JSON.parse(v); } catch { return v; }
            });
        } else if (val && typeof val === 'object') {
          target[key] = target[key] && typeof target[key] === 'object' ? { ...target[key], ...val } : { ...val };
        } else if (val !== null && val !== undefined && val !== '') {
          target[key] = target[key] || val;
        }
      }
    }

    // Prompt for medical extraction (instruct model to OCR + extract JSON)
    function makeMedicalPrompt(filename) {
      return `You are an OCR and medical report extraction assistant. You will be given a medical report document (PDF or image) as inline data. 1) Extract all visible textual content from the document (perform OCR if needed). 2) Parse and return ONLY valid JSON (no explanation) with the following schema:\n{\n  "id": "(unique id)",\n  "title": "(short title or filename)",\n  "report_date": "(date if available)",\n  "patient": {\n    "name": "",\n    "id": "",\n    "dob": "",\n    "gender": "",\n    "address": ""\n  },\n  "hospital": "",\n  "department": "",\n  "doctor": "",\n  "clinical_history": "",\n  "findings": "",\n  "impression": "",\n  "diagnoses": [],\n  "medications": [],\n  "vitals": {},\n  "labs": {},\n  "procedures": [],\n  "allergies": [],\n  "recommendations": "",\n  "full_text": "(full extracted text)"\n}\nIf any field is not present, keep it empty (""), empty array, or empty object. Provide concise, accurate extraction. The input document filename is: ${filename}.`;
    }

    for (const f of files) {
      const name = f.originalname || f.name || 'uploaded_file';
      const mimeType = f.mimetype || f.type || 'application/pdf';
      const base64 = f.buffer ? (typeof f.buffer === 'string' ? f.buffer : Buffer.from(f.buffer).toString('base64')) : (f.content_base64 || '');

      // call Gemini with prompt + inlineData
      const prompt = makeMedicalPrompt(name);
      const generateInputs = [
        prompt,
        { inlineData: { data: base64, mimeType } },
      ];

      let parsedData = null;
      try {
        const result = await model.generateContent(generateInputs);
        // Attempt to extract text output
        let textOut = '';
        try {
          const resp = result.response || result;
          if (resp && typeof resp.text === 'function') {
            textOut = resp.text();
          } else if (resp && resp.output_text) {
            textOut = resp.output_text;
          } else if (result && typeof result === 'string') {
            textOut = result;
          } else if (result && result.output && Array.isArray(result.output)) {
            // join any text fields
            textOut = result.output.map((o) => (o.content || []).map((c) => c.text || '').join('')).join('\n');
          }
        } catch (e) {
          textOut = '';
        }

        // Remove markdown JSON fences if present
        textOut = (textOut || '').replace(/```json/g, '').replace(/```/g, '').trim();

        try {
          parsedData = JSON.parse(textOut || '{}');
        } catch (e) {
          parsedData = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: name, full_text: textOut };
        }
      } catch (err) {
        console.error('Gemini call failed for file', name, err && err.message);
        parsedData = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: name, error: String(err && err.message) };
      }

      results.push({ fileName: name, mimetype: mimeType, extractedData: parsedData });
      mergeInto(mergedData, parsedData);
    }

    // Build final normalized schema for medical report
    const finalSchema = {
      id: mergedData.id || `merged-${Date.now()}`,
      title: mergedData.title || mergedData.patient?.name || 'Merged Medical Report',
      report_date: mergedData.report_date || '',
      patient: mergedData.patient || {
        name: mergedData.name || '',
        id: mergedData.patientId || mergedData.patient_id || '',
        dob: mergedData.dob || '',
        gender: mergedData.gender || '',
        address: mergedData.patient?.address || '',
      },
      hospital: mergedData.hospital || '',
      department: mergedData.department || '',
      doctor: mergedData.doctor || '',
      clinical_history: mergedData.clinical_history || mergedData.history || '',
      findings: mergedData.findings || '',
      impression: mergedData.impression || '',
      diagnoses: mergedData.diagnoses || mergedData.diagnosis || [],
      medications: mergedData.medications || [],
      vitals: mergedData.vitals || {},
      labs: mergedData.labs || {},
      procedures: mergedData.procedures || [],
      allergies: mergedData.allergies || [],
      recommendations: mergedData.recommendations || '',
      full_text: mergedData.full_text || '',
      source_files: results.map((r) => r.fileName),
    };

    return res.json({ results, merged: finalSchema });
  } catch (err) {
    console.error('process-medical failed', err);
    return res.status(500).json({ error: String(err && err.message ? err.message : err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OpenAI processing proxy listening on http://localhost:${PORT}`));
