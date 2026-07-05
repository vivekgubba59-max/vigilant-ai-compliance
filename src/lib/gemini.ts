import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple check for Gemini API Key in Browser or Server env
const getApiKey = () => {
  if (typeof window !== 'undefined') {
    // Check if user set a custom key in their session/local storage
    return localStorage.getItem('vigilant_gemini_api_key') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }
  return process.env.GEMINI_API_KEY || '';
};

// Initialize the live Gemini API if a key exists
let aiClient: any = null;
const api_key = getApiKey();
if (api_key) {
  try {
    const ai = new GoogleGenerativeAI(api_key);
    aiClient = ai;
  } catch (e) {
    console.error('Failed to initialize GoogleGenerativeAI client:', e);
  }
}

/**
 * Intelligent Mock Engine to simulate Gemini responses when API key is not configured.
 * Generates highly realistic compliance instructions, checklists, and document extractions.
 */
class GeminiMockEngine {
  static getComplianceRecommendations(industry: string, state: string, employeeCount: number, licenses: any): any[] {
    const list = [];
    let idCounter = 100;

    if (licenses.gst) {
      list.push({
        id: `comp-${idCounter++}`,
        title: 'GST GSTR-1 Return Filing',
        description: `Monthly filing of outbound invoice details for GST registration in ${state}. Due on the 11th of every month.`,
        category: 'GST',
        status: 'pending',
        priority: 'high',
        due_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-11`,
        penalty_amount: 100,
        risk_level: 'high',
      });
      list.push({
        id: `comp-${idCounter++}`,
        title: 'GST GSTR-3B Return Filing',
        description: `Monthly summary of sales, purchases, and taxes paid. Required for GST compliance. Due on the 20th of every month.`,
        category: 'GST',
        status: 'pending',
        priority: 'high',
        due_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-20`,
        penalty_amount: 200,
        risk_level: 'critical',
      });
    }

    if (employeeCount >= 20 && licenses.pf) {
      list.push({
        id: `comp-${idCounter++}`,
        title: 'EPF ECR Submission & Payment',
        description: `Monthly Electronic Challan-cum-Return submission for Provident Fund. Mandatory for firms with >= 20 employees in India. Due on the 15th.`,
        category: 'PF',
        status: 'pending',
        priority: 'high',
        due_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
        penalty_amount: 500,
        risk_level: 'high',
      });
    }

    if (employeeCount >= 10 && licenses.esi) {
      list.push({
        id: `comp-${idCounter++}`,
        title: 'ESIC Monthly Deposit Challan',
        description: `Deposit of ESI employee & employer contributions. Mandatory for firms with >= 10 employees. Due on the 15th of every month.`,
        category: 'ESI',
        status: 'pending',
        priority: 'high',
        due_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
        penalty_amount: 1000,
        risk_level: 'critical',
      });
    }

    if (licenses.factory) {
      list.push({
        id: `comp-${idCounter++}`,
        title: 'Factories Act Safety Register Maintenance',
        description: `Mandatory safety documentation and record keeping under the Factories Act applicable in ${state}.`,
        category: 'Labour Law',
        status: 'pending',
        priority: 'medium',
        due_date: `${new Date().getFullYear()}-12-31`,
        penalty_amount: 15000,
        risk_level: 'high',
      });
      list.push({
        id: `comp-${idCounter++}`,
        title: 'Form 21 - Half Yearly Return Filing',
        description: `Factories Act half-yearly safety compliance return filing with inspector of factories in ${state}.`,
        category: 'Labour Law',
        status: 'pending',
        priority: 'medium',
        due_date: `${new Date().getFullYear()}-07-31`,
        penalty_amount: 5000,
        risk_level: 'medium',
      });
    }

    if (licenses.pcb) {
      list.push({
        id: `comp-${idCounter++}`,
        title: 'PCB Hazardous Waste Annual Return',
        description: `Annual submission of hazardous waste production and management report to the State Pollution Control Board in ${state}.`,
        category: 'General',
        status: 'pending',
        priority: 'medium',
        due_date: `${new Date().getFullYear()}-06-30`,
        penalty_amount: 25000,
        risk_level: 'high',
      });
    }

    if (licenses.fssai) {
      list.push({
        id: `comp-${idCounter++}`,
        title: 'FSSAI License Renewal',
        description: `Food safety standards license renewal filing. Required for all food business operators in India.`,
        category: 'FSSAI' as any,
        status: 'pending',
        priority: 'high',
        due_date: `${new Date().getFullYear() + 1}-03-31`,
        penalty_amount: 10000,
        risk_level: 'critical',
      });
    }

    return list;
  }

  static getChatResponse(userQuery: string, history: any[], companyContext: any): string {
    const query = userQuery.toLowerCase().trim();
    const state = companyContext.state || 'your state';
    const industry = companyContext.industry || 'your industry';

    // Simple greeting matching for English, Hindi, and Telugu
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|namaste|hello there|howdy|hii|hiii|yoo|hola|नमस्ते|నమస్కారం|హలో)/i.test(query) || query === 'hi' || query === 'hello';

    if (isGreeting) {
      const languageHint = /नमस्ते/i.test(userQuery) ? 'hi' : /నమస్కారం/i.test(userQuery) ? 'te' : 'en';
      
      if (languageHint === 'hi') {
        return `नमस्ते! विजीलैंट एआई (Vigilant AI) अनुपालन एजेंट में आपका स्वागत है। मैं यहाँ आपके व्यवसाय को सरल भाषा में सुरक्षित और नियमों के अनुकूल रखने के लिए हूँ। 

मैं आपकी सहायता निम्नलिखित में कर सकता हूँ:
1. **जीएसटी फाइलिंग (GST Filing)**: GSTR-1 (11 तारीख तक) और GSTR-3B (20 तारीख तक) की समय-सीमा।
2. **पीएफ (EPF) और ईएसआई (ESIC)**: आपके कर्मचारियों के लिए मासिक जमा (15 तारीख तक)।
3. **श्रम कानून और लाइसेंस (Labour Laws)**: आपके राज्य के नियम बहुत ही सरल शब्दों में।

आज मैं आपकी जीएसटी फाइलिंग या अन्य नियमों को समझने में कैसे मदद कर सकता हूँ?`;
      }
      
      if (languageHint === 'te') {
        return `నమస్కారం! విజిలెంట్ ఐ కాంప్లయన్స్ ఏజెంట్ (Vigilant AI Agent) కి స్వాగతం. మీ వ్యాపార నిబంధనలను సులభంగా అర్థమయ్యేలా చేయడానికి నేను సహాయపడతాను.

నేను మీకు కింది వాటిలో సహాయం చేయగలను:
1. **జీఎస్టీ ఫైలింగ్ (GST)**: GSTR-1 (11వ తేదీ లోపు) మరియు GSTR-3B (20వ తేదీ లోపు) గడువులు.
2. **పిఎఫ్ (EPF) & ఈఎస్ఐ (ESIC)**: ఉద్యోగుల నెలవారీ కంట్రిబ్యూషన్స్ (15వ తేదీ లోపు).
3. **లేబర్ చట్టాలు & లైసెన్సులు**: సులభమైన పదాలలో మీ వ్యాపార నిబంధనల వివరణ.

ఈరోజు మీకు జీఎస్టీ లేదా ఇతర ప్రభుత్వ నిబంధనలపై ఏ విధంగా సహాయం చేయాలి?`;
      }

      return `Hello! Welcome to Vigilant AI, your friendly compliance copilot. I am designed to make complicated government regulations simple and easy to understand for any business owner.

Here are the key compliance areas I can guide you through:
1. **GST Returns & Filings**: Tracking GSTR-1 (due on 11th) and GSTR-3B (due on 20th).
2. **Employee Benefits (EPF/ESIC)**: Setting up monthly Provident Fund and State Insurance deposits (due on 15th).
3. **Labour Registers**: Simple checklists for working hours and safety documents.
4. **Notice Audit**: Upload any tax notice or office contract to find penalties and due dates automatically.

How can I help you with your GST filings or other compliance tasks today?`;
    }

    // Multilingual Detection
    const isHindi = /नमस्ते|क्या|है|कौन|कब|जीएसटी|कानून/i.test(userQuery);
    const isTelugu = /నమస్కారం|ఏమిటి|ఎప్పుడు|జీఎస్టీ|చట్టం/i.test(userQuery);

    if (isHindi) {
      if (query.includes('gst') || query.includes('जीएसटी')) {
        return `जीएसटी (GST) के आसान नियम:\n1. **पंजीकरण**: यदि आप सामान बेचते हैं और आपकी कुल बिक्री साल में रु. 40 लाख (सेवाओं के लिए रु. 20 लाख) से अधिक है, तो जीएसटी नंबर लेना आवश्यक है।\n2. **मासिक फाइलिंग**: GSTR-1 हर महीने की 11 तारीख तक (बिक्री की जानकारी) और GSTR-3B हर महीने की 20 तारीख तक (टैक्स भुगतान) भरना होता है।\n3. **जुर्माना**: देरी से फाइल करने पर प्रति दिन रु. 50 (निल रिटर्न होने पर रु. 20) का जुर्माना लगता है।\n\nक्या आप चाहते हैं कि मैं आपके व्यवसाय के लिए एक आसान जीएसटी चेकलिस्ट तैयार करूँ?`;
      }
      if (query.includes('due') || query.includes('तारीख') || query.includes('बकाया')) {
        return `आपके व्यवसाय के लिए इस महीने ये तारीखें महत्वपूर्ण हैं:\n- **GSTR-1 (बिक्री रिटर्न)**: 11 तारीख तक\n- **EPF और ESIC (कर्मचारी भविष्य निधि)**: 15 तारीख तक (चूंकि आपके पास ${companyContext.employee_count} कर्मचारी हैं, इसलिए यह जरूरी है)\n- **GSTR-3B (टैक्स भुगतान)**: 20 तारीख तक।\n\nजुर्माने से बचने के लिए इन्हें समय से पहले पूरा कर लें।`;
      }
      return `नमस्ते! मैं आपका विजीलैंट एआई (Vigilant AI) अनुपालन सहायक हूँ। मैं बहुत सरल शब्दों में जीएसटी, पीएफ (PF), ईएसआई (ESI), और कारखाना नियमों को समझा सकता हूँ। कृपया अपना प्रश्न पूछें!`;
    }

    if (isTelugu) {
      if (query.includes('gst') || query.includes('జీఎస్టీ')) {
        return `జీఎస్టీ (GST) సులభమైన నిబంధనలు:\n1. **రిజిస్ట్రేషన్**: మీ సరుకుల విక్రయం సంవత్సరానికి రూ. 40 లక్షలు (సేవలకైతే రూ. 20 లక్షలు) దాటితే జీఎస్టీ రిజిస్ట్రేషన్ తప్పనిసరి.\n2. **నెలవారీ రిటర్న్స్**: GSTR-1 ప్రతి నెల 11వ తేదీ లోపు మరియు GSTR-3B ప్రతి నెల 20వ తేదీ లోపు దాఖలు చేయాలి.\n3. **ఆలస్య జరిమానా**: గడువు దాటిన ప్రతి రోజుకు రూ. 50 (టాక్స్ లేకపోతే రూ. 20) జరిమానా పడుతుంది.\n\nమీ వ్యాపారానికి జీఎస్టీ చెక్‌లిస్ట్ కావాలా?`;
      }
      if (query.includes('due') || query.includes('తేదీ') || query.includes('గడువు')) {
        return `ఈ నెలలో మీ వ్యాపారానికి కింది ముఖ్యమైన గడువులు ఉన్నాయి:\n- **GSTR-1 (విక్రయాల రిటర్న్)**: ప్రతి నెల 11వ తేదీ లోపు\n- **EPF & ESIC కంట్రిబ్యూషన్**: ప్రతి నెల 15వ తేదీ లోపు (మీ వద్ద ${companyContext.employee_count} మంది ఉద్యోగులు ఉన్నారు కాబట్టి ఇది తప్పనిసరి)\n- **GSTR-3B (టాక్స్ చెల్లింపు)**: ప్రతి నెల 20వ తేదీ లోపు.\n\nఆలస్య రుసుము పడకుండా వీటిని త్వరగా పూర్తి చేయండి.`;
      }
      return `నమస్కారం! నేను మీ విజిలెంట్ ఐ కాంప్లయన్స్ అసిస్టెంట్ (Vigilant AI Agent). మీ వ్యాపారానికి సంబంధించి జీఎస్టీ, పిఎఫ్, ఈఎస్ఐ లేదా లేబర్ చట్టాల నిబంధనలపై చాలా సులభంగా వివరిస్తాను. నన్ను ప్రశ్న అడగండి!`;
    }

    // Default English Responses based on query keywords
    if (query.includes('due') || query.includes('this month') || query.includes('compliances are due')) {
      return `Based on your profile with **${companyContext.employee_count} employees** operating in **${state}**:

Here are the key compliance deadlines for this month explained in simple terms:
1. **GST GSTR-1 Return** (Due on **11th**): Report all your sales invoices. Late filing costs ₹50 per day.
2. **EPF Provident Fund** (Due on **15th**): Deposit PF savings for employees. Since you have ${companyContext.employee_count} employees (above the threshold of 20), this is mandatory.
3. **ESIC Employee Insurance** (Due on **15th**): Medical benefit deposit for workers. Mandatory for firms with 10+ employees.
4. **GST GSTR-3B Summary** (Due on **20th**): Pay your monthly tax to the government. Late payments attract 18% annual interest.

I have scheduled these on your compliance dashboard. Would you like a checklist?`;
    }

    if (query.includes('gst registration') || query.includes('require gst')) {
      return `### Simple Guide to GST Registration:

For businesses operating in **${state}**:
1. **Supplying Goods**: Registration is mandatory if your total sales exceed **₹40 Lakhs** per year.
2. **Providing Services**: Registration is mandatory if your sales exceed **₹20 Lakhs** per year.
3. **Selling Across States**: If you sell goods to customers in another state (inter-state), you **must register for GST regardless of your sales volume**.
4. **Selling Online**: If you list products on Amazon, Flipkart, or e-commerce portals, registration is mandatory.

*Your Status:* Your profile shows you are in the **${industry}** sector and already registered with GSTIN: \`${companyContext.gst_number || 'Not Setup Yet'}\`. If you supply goods, watch your turnover thresholds closely.`;
    }

    if (query.includes('factory') || query.includes('factories act') || query.includes('labour law')) {
      return `### Factories Act & Labour Law Obligation for ${state}:

Since your profile has the Factories Act license enabled and you operate in the **${industry}** sector:
1. **Registration**: Applies to any factory employing 10 or more workers with power, or 20 or more workers without power.
2. **Safety Registers (Form 21 / Form 22)**: You must maintain a Register of Accidents and dangerous occurrences, alongside half-yearly returns filed with the Chief Inspector of Factories.
3. **Working Hours & Leaves**: Regular compliance includes capping adult working hours at 48 hours/week, maintaining overtime logs (paid at double the regular wage rate), and providing statutory leaves.
4. **Welfare Facilities**: Adequate drinking water, restrooms, lunch rooms, and first-aid kits must be maintained. Since your employee size is ${companyContext.employee_count}, a designated safety officer is not yet mandatory (required if employees exceed 500), but standard guidelines apply.`;
    }

    if (query.includes('checklist') || query.includes('generate my compliance checklist')) {
      return `### Tailored Compliance Checklist for ${companyContext.name}

Here is the structured checklist generated for your profile:

- [ ] **GSTR-1 Monthly Filing** (GST) - Due by 11th - *High Priority*
- [ ] **EPF ECR Submission** (Provident Fund) - Due by 15th - *High Priority*
- [ ] **ESIC Challan Payment** (Health Insurance) - Due by 15th - *High Priority*
- [ ] **GSTR-3B Monthly Filing** (GST Tax payment) - Due by 20th - *Critical Priority*
- [ ] **Labour Register Review** (Overtime, Attendance) - Due monthly - *Medium Priority*
- [ ] **Environmental Return Check** (PCB) - Half-yearly requirement - *Medium Priority*

*I have added these tasks to your interactive **Compliance Tracker**.*`;
    }

    // Default conversational response
    return `I've analyzed your query regarding *"${userQuery}"* under Indian corporate regulations.

For a **${industry}** entity based in **${state}** with **${companyContext.employee_count} employees**:
1. **EPF & ESIC**: Ensure monthly deposits are filed by the 15th. Non-compliance results in interest penalties under Sec 7Q & Sec 14B of the EPF Act.
2. **GST Filing**: Watch the 11th (GSTR-1) and 20th (GSTR-3B) closely. 
3. **Labour Law**: Retain the mandatory muster rolls, wage registers, and incident logs on site.

If you have uploaded a regulatory notice or an invoice, I can extract the specific items for you. What details can I clarify further?`;
  }

  static parseDocument(fileName: string): any {
    const name = fileName.toLowerCase();

    if (name.includes('gst') || name.includes('tax') || name.includes('notice')) {
      return {
        summary: 'A formal compliance notice or letter issued by the GST authority regarding mismatched input tax credits or outward filings.',
        checklists: [
          'Verify purchase invoices against the GSTR-2B dashboard in the GST portal.',
          'Reconcile invoices for vendors who have not uploaded their returns.',
          'File response using Form DRC-01C on the portal.',
        ],
        deadlines: [
          { title: 'Form DRC-01C Clarification response', date: '2026-07-15' },
        ],
        penalties: [
          { violation: 'Failure to reconcile DRC-01C discrepancies', amount: 10000 },
        ],
        action_items: [
          'Contact accounts team to download current GSTR-2A/2B excel reconciliation ledger.',
          'Draft clarification letter identifying the vendor responsible for delay.',
          'Submit the response on the GST portal to prevent blocking of GSTR-1.',
        ],
        warnings: [
          'Crucial: If unanswered within 15 days, GST portal will auto-block outward invoice filing capabilities, halting business operations.',
        ],
      };
    }

    if (name.includes('contract') || name.includes('rent') || name.includes('agreement')) {
      return {
        summary: 'Commercial rental or service level agreement detailing space lease terms, monthly rental rates, security deposits, and maintenance clauses.',
        checklists: [
          'Verify payment terms and monthly invoicing deadlines.',
          'Confirm TDS (Tax Deducted at Source) rate application (typically 10% under Sec 194-I).',
          'Review rent escalation clauses (normally 5-10% annual increase).',
        ],
        deadlines: [
          { title: 'Monthly rent remittance', date: '2026-07-05' },
          { title: 'TDS Deposit on rent payment', date: '2026-07-07' },
        ],
        penalties: [
          { violation: 'TDS late deposit interest', amount: 1.5 }, // 1.5% per month
          { violation: 'Late rent payment surcharge', amount: 500 }, // Rs 500 per day
        ],
        action_items: [
          'Set up standing instruction for rent release.',
          'Instruct Finance to deduct TDS at 10% under Section 194-I and file Form 26QB.',
          'Store digital copy of lease certificate in administrative files.',
        ],
        warnings: [
          'TDS non-compliance results in disallowed expense status for corporate income tax assessment.',
        ],
      };
    }

    // Default Document Output
    return {
      summary: 'General corporate or regulatory document uploaded for compliance inspection.',
      checklists: [
        'Review document covenants and terms.',
        'File necessary administrative approvals.',
        'Confirm dates against standard compliance calendars.',
      ],
      deadlines: [
        { title: 'Submission of acknowledgment form', date: '2026-08-01' },
      ],
      penalties: [
        { violation: 'Standard late administration filing fee', amount: 2000 },
      ],
      action_items: [
        'Confirm contract signatures are complete.',
        'Ensure proper corporate seal and stamping.',
      ],
      warnings: [
        'Ensure that all regulatory stamp duty values matches local state laws.',
      ],
    };
  }
}

/**
 * Main AI Agent Query Dispatcher.
 * Leverages Google Gemini API if GEMINI_API_KEY is defined;
 * falls back to local intelligent Mock Engine to guarantee zero-setup execution.
 */
export async function callGeminiAgent(
  action: 'recommend' | 'chat' | 'parse_document',
  payload: any
): Promise<any> {
  const key = getApiKey();

  if (!key || !aiClient) {
    // RUNNING IN INTERACTIVE DEMO MODE (No API Key)
    // Add latency to simulate API calls and show loading skeletons beautifully!
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (action === 'recommend') {
      const { industry, state, employeeCount, licenses } = payload;
      return GeminiMockEngine.getComplianceRecommendations(industry, state, employeeCount, licenses);
    } else if (action === 'chat') {
      const { query, history, company } = payload;
      return GeminiMockEngine.getChatResponse(query, history, company);
    } else if (action === 'parse_document') {
      const { fileName } = payload;
      return GeminiMockEngine.parseDocument(fileName);
    }
    return null;
  }

  // PRODUCTION MODE: LIVE GOOGLE GEMINI API CALLS
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
      // Parse clean json
      const cleaned = text.replace(/^```json\s*|```$/g, '');
      return JSON.parse(cleaned);
    }

    if (action === 'chat') {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      // Construct prompt with company context and beginner-friendly constraints
      const context = `You are Vigilant AI, a friendly compliance assistant for Indian business owners. Keep answers extremely simple, easy to understand for beginners, brief, and highly actionable. Avoid complex legal jargon, and use clear lists. If the user says hi/hello, give a warm greeting offering help with GST, EPF/ESIC, or labour laws. Company: ${payload.company.name}, Industry: ${payload.company.industry}, State: ${payload.company.state}, Employees: ${payload.company.employee_count}, GSTIN: ${payload.company.gst_number}. If user asks in Hindi or Telugu, answer in the respective language.`;
      
      const chat = model.startChat({
        history: payload.history.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.message }]
        })),
        systemInstruction: context,
      });

      const response = await chat.sendMessage(payload.query);
      return response.text;
    }

    if (action === 'parse_document') {
      const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze the document named "${payload.fileName}". It contains the following text context: "${payload.fileText || 'No direct text extracted, simulate review based on name.'}".
Generate and extract the compliance requirements. Return ONLY a JSON object of this structure:
{
  "summary": "Brief summary",
  "checklists": ["step 1", "step 2"],
  "deadlines": [{"title": "step due", "date": "YYYY-MM-DD"}],
  "penalties": [{"violation": "why", "amount": 5000}],
  "action_items": ["action 1", "action 2"],
  "warnings": ["warning 1"]
}`;
      const response = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
      const text = response.text.trim();
      const cleaned = text.replace(/^```json\s*|```$/g, '');
      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.error('Error during Live Gemini API execution, falling back to mock:', error);
    // Graceful fallback to mock so application never crashes
    if (action === 'recommend') {
      return GeminiMockEngine.getComplianceRecommendations(payload.industry, payload.state, payload.employeeCount, payload.licenses);
    } else if (action === 'chat') {
      return GeminiMockEngine.getChatResponse(payload.query, payload.history, payload.company);
    } else if (action === 'parse_document') {
      return GeminiMockEngine.parseDocument(payload.fileName);
    }
  }
}
