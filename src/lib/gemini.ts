import { GoogleGenerativeAI } from '@google/generative-ai';

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vigilant_gemini_api_key') || '';
  }
  return '';
};

export async function callGeminiAgent(
  action: 'recommend' | 'chat',
  payload: any
): Promise<any> {

  const key = getApiKey();
  
  // Log existence of local storage key
  console.log("=== GEMINI AUTHENTICATION CHECK ===");
  console.log("Local Storage key exists:", typeof window !== 'undefined' ? !!localStorage.getItem('vigilant_gemini_api_key') : false);
  console.log("Model being used: gemini-1.5-flash");

  if (!key) {
    console.error("Gemini API Key is missing. Model: gemini-1.5-flash");
    throw new Error("Gemini API Key is missing. Please configure your environment variables.");
  }

  let aiClient: any;
  try {
    aiClient = new GoogleGenerativeAI(key);
  } catch (e: any) {
    console.error("Failed to initialize GoogleGenerativeAI client. Model: gemini-1.5-flash");
    console.error("Error details:", e);
    throw new Error("The configured Gemini API key is invalid. Please generate a new API key from Google AI Studio.");
  }

  try {
    if (action === 'recommend') {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a compliance agent. For an Indian SME in the industry "${payload.industry}", located in State "${payload.state}", with ${payload.employeeCount} employees, and active licenses: ${JSON.stringify(payload.licenses)}.
Return a list of compliance requirements. Return ONLY a JSON array matching this format (no markdown code blocks, just raw JSON text):
[
  {
    "id": "comp-gen-1",
    "title": "Short title",
    "description": "Details",
    "category": "GST" | "PF" | "ESI" | "Labour Law" | "Tax" | "General",
    "status": "pending",
    "priority": "high" | "medium" | "low",
    "due_date": "YYYY-MM-DD",
    "penalty_amount": 100,
    "risk_level": "critical" | "high" | "medium" | "low"
  }
]`;
      const response = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      const text = response.text.trim();
      const cleaned = text.replace(/^```json\s*|```$/g, '');
      console.log("Gemini Request Status Code: 200");
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        throw new Error("Invalid JSON");
      }
    }

    if (action === 'chat') {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const context = `You are Vigilant AI, a friendly compliance assistant for Indian business owners. Keep answers extremely simple, easy to understand for beginners, brief, and highly actionable. Avoid complex legal jargon, and use clear lists. If the user says hi/hello, give a warm greeting offering help with GST, EPF/ESIC, or labour laws. Company: ${payload.company.name}, Industry: ${payload.company.industry}, State: ${payload.company.state}, Employees: ${payload.company.employee_count}, GSTIN: ${payload.company.gst_number}. If user asks in Hindi or Telugu, answer in the respective language.`;
      
      const chat = model.startChat({
        history: payload.history.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.message }]
        })),
        systemInstruction: context,
      });

      const response = await chat.sendMessage(payload.query);
      console.log("Gemini Request Status Code: 200");
      return response.text;
    }


  } catch (error: any) {
    console.error('Error during Live Gemini API execution. Model: gemini-1.5-flash');
    console.error("Request status code:", error.status || error.statusCode || "Error");
    console.error("Full error response:", error);
    
    const msg = error.message || '';
    const errStatus = error.status || error.statusCode;
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || errStatus === 400 || errStatus === 401 || errStatus === 403) {
      throw new Error("The configured Gemini API key is invalid. Please generate a new API key from Google AI Studio.");
    }
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("429 Rate Limit");
    }
    if (msg.includes('500') || msg.includes('Internal error')) {
      throw new Error("500 Internal Error");
    }
    if (msg.includes('fetch failed') || msg.includes('timeout') || msg.includes('NetworkError')) {
      throw new Error("Network Timeout");
    }
    
    throw error;
  }
}
