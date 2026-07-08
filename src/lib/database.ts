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

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: string;
}

export const defaultUser: User = {
  id: 'user-default',
  fullName: 'Vivek Gubba',
  email: 'demo@vigilant.ai',
  password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA-256 hash of 'password'
  role: 'Compliance Manager'
};

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

// LocalStorage helpers for Browser Execution (Local State)
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

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";
  }
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Global state controller for Local Session
export class LocalDatabase {
  static getUsers(): User[] {
    return getLocalState<User[]>('users', [defaultUser]);
  }

  static saveUsers(users: User[]): void {
    setLocalState('users', users);
  }

  static getSessionUser(): User | null {
    return getLocalState<User | null>('session_user', null);
  }

  static setSessionUser(user: User | null): void {
    setLocalState('session_user', user);
  }

  static async registerUser(fullName: string, email: string, password: string): Promise<User | string> {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return 'Email address is already registered.';
    }
    const hashedPassword = await hashPassword(password);
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      password: hashedPassword,
      role: 'Compliance Manager'
    };
    this.saveUsers([...users, newUser]);
    this.setSessionUser(newUser);
    this.addAuditLog('User Registered', `Account created for ${fullName} (${email})`);
    return newUser;
  }

  static async loginUser(email: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const hashedPassword = await hashPassword(password);
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === hashedPassword
    );
    if (user) {
      this.setSessionUser(user);
      this.addAuditLog('User Logged In', `${user.fullName} logged in successfully.`);
      return user;
    }
    return null;
  }

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
