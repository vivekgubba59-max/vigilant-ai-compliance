import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { fileName, fileBase64, fileMimeType, clientApiKey } = payload;

    // Server-side Log: File Received
    console.log("=== [SERVER DEBUGLOG] 1. File Received ===");
    console.log(`File Name: ${fileName}, MIME Type: ${fileMimeType}, Size: ${fileBase64 ? Math.round(fileBase64.length * 0.75) : 0} bytes`);

    // Prioritize user's client-configured API key, fallback to server process env
    const key = clientApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    
    // Server-side Log: Gemini Request Payload (Redacting key)
    console.log("=== [SERVER DEBUGLOG] 2. Gemini Request Payload ===");
    console.log({
      model: 'gemini-1.5-flash',
      fileName,
      fileMimeType,
      apiKeyExists: !!key,
      apiKeySource: clientApiKey ? 'client_local_storage' : 'server_env'
    });

    if (!key || key === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: "Gemini API Key is missing. Please configure your environment variables or profile settings." }, { status: 400 });
    }

    const aiClient = new GoogleGenerativeAI(key);
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional document intelligence AI. Analyze the uploaded document file.
Extract all details from the document into a structured JSON object according to the following schema.

Required JSON schema:
{
  "documentType": "GST Invoice" | "GST Notice" | "GST Challan" | "E-Way Bill" | "Commercial Invoice" | "Purchase Invoice" | "Factory Inspection Notice" | "Lease Agreement" | "MSME Certificate" | "Other Compliance Documents",
  "sellerName": "string or null",
  "sellerGSTIN": "string or null",
  "buyerName": "string or null",
  "buyerGSTIN": "string or null",
  "invoiceNumber": "string or null",
  "invoiceDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "placeOfSupply": "string or null",
  "taxableAmount": "string or number or null",
  "cgst": "string or number or null",
  "sgst": "string or number or null",
  "igst": "string or number or null",
  "totalTax": "string or number or null",
  "grandTotal": "string or number or null",
  "hsnCodes": ["string"]
}

Rules:
1. Return ONLY valid raw JSON matching the schema above.
2. Do not write any markdown code blocks, backticks, explanation, or notes.
3. If a field is missing or cannot be extracted, set its value to null. Never write placeholder values like "N/A", "Not Detected", "Unknown", or "0" unless explicitly visible on the document.`;

    const parts = [
      { text: prompt },
      {
        inlineData: {
          data: fileBase64,
          mimeType: fileMimeType || 'image/png'
        }
      }
    ];

    // Server-side Log (Step 6 requirement)
    console.log(`Gemini key present: ${!!key}, length: ${key.length}`);

    const response = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const responseText = response.response?.text?.()?.trim() || "";
    const cleaned = responseText.replace(/^```json\s*|```$/g, '');

    // Server-side Log: Raw Gemini Response
    console.log("=== [SERVER DEBUGLOG] 3. Raw Gemini Response ===");
    console.log(responseText);

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON parsing of Gemini response failed:", parseError);
      return NextResponse.json({ error: "Invalid JSON format returned by AI." }, { status: 500 });
    }

    // Server-side Log: Parsed JSON
    console.log("=== [SERVER DEBUGLOG] 4. Parsed JSON ===");
    console.log(parsedResult);

    parsedResult.raw_response = responseText;

    // Server-side Log: Final Object Handed to UI (client will get this)
    console.log("=== [SERVER DEBUGLOG] 5. Final Object Handed to UI ===");
    console.log(parsedResult);

    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("Error during server-side Gemini execution:", error);
    const msg = error.message || '';
    const status = error.status || error.statusCode || 500;
    
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || status === 400 || status === 401 || status === 403) {
      return NextResponse.json({ error: "The configured Gemini API key is invalid. Please generate a new API key from Google AI Studio." }, { status: 401 });
    }
    return NextResponse.json({ error: msg || "Internal server error" }, { status });
  }
}
