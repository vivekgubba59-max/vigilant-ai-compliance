export interface Company {
  id: string;
  name: string;
  industry: string;
  state: string;
  employee_count: number;
  gst_number: string;
  licenses: {
    gst: boolean;
    pf: boolean;
    esi: boolean;
    fssai: boolean;
    pcb: boolean; // Pollution Control Board
    factory: boolean; // Factory Act
  };
  compliance_score: number;
  risk_score: number;
  created_at: string;
}

export interface Compliance {
  id: string;
  company_id: string;
  title: string;
  description: string;
  category: 'GST' | 'PF' | 'ESI' | 'Labour Law' | 'FSSAI' | 'Tax' | 'General';
  status: 'pending' | 'completed' | 'overdue' | 'upcoming';
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  completion_date?: string;
  penalty_amount: number;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  summary?: string;
  extracted_data?: {
    checklists: string[];
    deadlines: { title: string; date: string }[];
    penalties: { violation: string; amount: number }[];
    action_items: string[];
    warnings: string[];
  };
  status: 'processing' | 'processed' | 'failed';
  uploaded_by: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  company_id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
}

export interface Notification {
  id: string;
  company_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'warning' | 'info';
  read: boolean;
  due_date?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}

// Initial Mock Company Profile
export const initialCompany: Company = {
  id: 'company-123',
  name: 'AeroCraft Manufacturing India Pvt Ltd',
  industry: 'Manufacturing',
  state: 'Karnataka',
  employee_count: 24,
  gst_number: '29ABCDE1234F1Z5',
  licenses: {
    gst: true,
    pf: true,
    esi: true,
    fssai: false,
    pcb: true,
    factory: true,
  },
  compliance_score: 82,
  risk_score: 18,
  created_at: '2026-01-10T10:00:00Z',
};

// Initial Mock Compliance List for Indian SME
export const initialCompliances: Compliance[] = [
  {
    id: 'comp-1',
    company_id: 'company-123',
    title: 'GSTR-1 Filing',
    description: 'Monthly return containing details of outward supplies of goods and services.',
    category: 'GST',
    status: 'pending',
    priority: 'high',
    due_date: '2026-07-11',
    penalty_amount: 100, // Rs. 50/day (CGST) + Rs. 50/day (SGST) per day of delay
    risk_level: 'high',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'comp-2',
    company_id: 'company-123',
    title: 'GSTR-3B Summary Filing',
    description: 'Monthly self-declared summary return filing and payment of tax.',
    category: 'GST',
    status: 'pending',
    priority: 'high',
    due_date: '2026-07-20',
    penalty_amount: 200,
    risk_level: 'critical',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'comp-3',
    company_id: 'company-123',
    title: 'EPF Monthly Contribution Deposit',
    description: 'Submission of Employee Provident Fund monthly contribution challan (ECR).',
    category: 'PF',
    status: 'completed',
    priority: 'high',
    due_date: '2026-07-15',
    completion_date: '2026-07-01',
    penalty_amount: 0,
    risk_level: 'high',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'comp-4',
    company_id: 'company-123',
    title: 'ESIC Contribution Challan Deposit',
    description: 'Monthly contribution return deposit for Employee State Insurance.',
    category: 'ESI',
    status: 'overdue',
    priority: 'high',
    due_date: '2026-06-15',
    penalty_amount: 5000, // Includes interest & damages
    risk_level: 'critical',
    created_at: '2026-05-15T00:00:00Z',
  },
  {
    id: 'comp-5',
    company_id: 'company-123',
    title: 'PCB Environmental Return',
    description: 'Filing of environmental compliance report to State Pollution Control Board.',
    category: 'General',
    status: 'upcoming',
    priority: 'medium',
    due_date: '2026-09-30',
    penalty_amount: 0,
    risk_level: 'medium',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'comp-6',
    company_id: 'company-123',
    title: 'Factory Safety Register Audit',
    description: 'Maintenance and inspection check of accident logs and safety systems under the Factories Act.',
    category: 'Labour Law',
    status: 'pending',
    priority: 'medium',
    due_date: '2026-07-28',
    penalty_amount: 0,
    risk_level: 'medium',
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'comp-7',
    company_id: 'company-123',
    title: 'Professional Tax (PT) Monthly Payment',
    description: 'Deduction and payment of Professional Tax from employee salaries under state legislation.',
    category: 'Tax',
    status: 'completed',
    priority: 'medium',
    due_date: '2026-06-20',
    completion_date: '2026-06-19',
    penalty_amount: 0,
    risk_level: 'medium',
    created_at: '2026-05-20T00:00:00Z',
  },
];

// Initial Mock Notifications
export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    company_id: 'company-123',
    title: 'ESIC Payment Overdue Alert',
    message: 'ESIC payment for May 2026 was due on June 15. Action required immediately to prevent penalty escalation.',
    type: 'warning',
    read: false,
    due_date: '2026-06-15',
    created_at: '2026-06-16T09:00:00Z',
  },
  {
    id: 'notif-2',
    company_id: 'company-123',
    title: 'GSTR-1 Filing Deadline',
    message: 'GSTR-1 filing deadline is approaching on July 11, 2026. Review invoices and drafts.',
    type: 'reminder',
    read: false,
    due_date: '2026-07-11',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'notif-3',
    company_id: 'company-123',
    title: 'Compliance Score Increased',
    message: 'Congratulations! Your compliance score rose from 75 to 82 after EPF monthly deposit compliance.',
    type: 'info',
    read: true,
    created_at: '2026-07-01T15:00:00Z',
  },
];

// Initial Mock Documents
export const initialDocuments: Document[] = [
  {
    id: 'doc-1',
    company_id: 'company-123',
    file_name: 'GSTR_Notice_June_2026.pdf',
    file_url: '#',
    file_type: 'application/pdf',
    file_size: 1542000,
    summary: 'A notice from the Central GST department regarding minor discrepancies in Input Tax Credit (ITC) matching between GSTR-2B and GSTR-3B for the previous quarter.',
    extracted_data: {
      checklists: [
        'Compare sales register invoices with GSTR-2B ledger.',
        'File reconciliation statement DRC-01C.',
        'Pay differential interest of Rs. 2,450 if any discrepancy is found.',
      ],
      deadlines: [
        { title: 'Response Submission to GST Officer', date: '2026-07-15' },
      ],
      penalties: [
        { violation: 'Failure to respond to DRC-01C notice', amount: 10000 },
      ],
      action_items: [
        'Download GSTR-2B reconciliation report.',
        'Engage CA/GST compliance partner.',
        'Draft response explaining genuine transit sales delay.',
      ],
      warnings: [
        'Failure to submit a response within 15 days can trigger automatic system block of GSTR-1 outbound invoice generation.',
      ],
    },
    status: 'processed',
    uploaded_by: 'user-123',
    created_at: '2026-06-25T14:30:00Z',
  },
];

// Initial Mock Chat History
export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    company_id: 'company-123',
    sender: 'ai',
    message: 'Hello! I am your Vigilant Compliance Intelligence Agent. How can I help you with Indian regulatory requirements today? I can assist with GST, EPF, ESIC, Factories Act, FSSAI, or check your upcoming deadlines.',
    created_at: '2026-07-02T09:00:00Z',
  },
];

// LocalStorage helpers for Browser Execution (Demo Mode)
const IS_BROWSER = typeof window !== 'undefined';

export function getLocalState<T>(key: string, defaultValue: T): T {
  if (!IS_BROWSER) return defaultValue;
  const stored = localStorage.getItem(`vigilant_${key}`);
  if (!stored) {
    localStorage.setItem(`vigilant_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
}

export function setLocalState<T>(key: string, value: T): void {
  if (!IS_BROWSER) return;
  localStorage.setItem(`vigilant_${key}`, JSON.stringify(value));
}

// Global state controller for Demo Mode
export class DemoDatabase {
  static getCompany(): Company {
    return getLocalState<Company>('company', initialCompany);
  }

  static saveCompany(company: Company): void {
    // Recalculate scores based on compliance status
    const compliances = this.getCompliances();
    const total = compliances.length;
    const completed = compliances.filter(c => c.status === 'completed').length;
    const overdue = compliances.filter(c => c.status === 'overdue').length;

    const score = total > 0 ? Math.round((completed / total) * 100) : 100;
    const risk = total > 0 ? Math.round((overdue / total) * 100) : 0;

    const updated = {
      ...company,
      compliance_score: score,
      risk_score: risk,
    };
    setLocalState('company', updated);
  }

  static getCompliances(): Compliance[] {
    return getLocalState<Compliance[]>('compliances', initialCompliances);
  }

  static saveCompliances(compliances: Compliance[]): void {
    setLocalState('compliances', compliances);
    // Auto-update company score
    const company = this.getCompany();
    this.saveCompany(company);
  }

  static toggleComplianceStatus(id: string): Compliance[] {
    const list = this.getCompliances();
    const updated = list.map(c => {
      if (c.id === id) {
        const isCompleted = c.status === 'completed';
        return {
          ...c,
          status: isCompleted ? 'pending' : ('completed' as any),
          completion_date: isCompleted ? undefined : new Date().toISOString().split('T')[0],
        };
      }
      return c;
    });
    this.saveCompliances(updated);
    this.addAuditLog('Compliance State Toggled', `Toggled state of compliance ID ${id}`);
    return this.getCompliances();
  }

  static getNotifications(): Notification[] {
    return getLocalState<Notification[]>('notifications', initialNotifications);
  }

  static saveNotifications(notifications: Notification[]): void {
    setLocalState('notifications', notifications);
  }

  static markNotificationRead(id: string): Notification[] {
    const list = this.getNotifications();
    const updated = list.map(n => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
    return updated;
  }

  static getDocuments(): Document[] {
    return getLocalState<Document[]>('documents', initialDocuments);
  }

  static saveDocuments(documents: Document[]): void {
    setLocalState('documents', documents);
  }

  static getChatMessages(): ChatMessage[] {
    return getLocalState<ChatMessage[]>('chat_messages', initialChatMessages);
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    setLocalState('chat_messages', messages);
  }

  static addChatMessage(sender: 'user' | 'ai', message: string): ChatMessage[] {
    const history = this.getChatMessages();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      company_id: 'company-123',
      sender,
      message,
      created_at: new Date().toISOString(),
    };
    const updated = [...history, newMsg];
    this.saveChatMessages(updated);
    return updated;
  }

  static getAuditLogs(): AuditLog[] {
    return getLocalState<AuditLog[]>('audit_logs', [
      {
        id: 'log-1',
        company_id: 'company-123',
        user_id: 'user-123',
        action: 'System Initialization',
        details: 'Vigilant AI compliance engine initialized with standard seed profiles.',
        created_at: '2026-07-02T08:00:00Z',
      },
    ]);
  }

  static addAuditLog(action: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      company_id: 'company-123',
      user_id: 'user-123',
      action,
      details,
      created_at: new Date().toISOString(),
    };
    setLocalState('audit_logs', [newLog, ...logs]);
  }
}
