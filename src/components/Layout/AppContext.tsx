'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Company, 
  Compliance, 
  Document, 
  Notification, 
  ChatMessage, 
  AuditLog, 
  DemoDatabase,
  initialCompany 
} from '@/lib/mockData';
import { callGeminiAgent } from '@/lib/gemini';

interface AppContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  apiKey: string;
  saveApiKey: (key: string) => void;
  company: Company;
  updateCompany: (company: Company) => void;
  compliances: Compliance[];
  toggleCompliance: (id: string) => void;
  addCompliance: (title: string, category: string, dueDate: string, priority: string, desc: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  documents: Document[];
  uploadDocument: (fileName: string, fileSize: number) => Promise<void>;
  updateDocument: (doc: Document) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  auditLogs: AuditLog[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [company, setCompany] = useState<Company>(initialCompany);
  const [compliances, setCompliances] = useState<Compliance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state from DemoDatabase (localStorage wrappers) on client mount
  useEffect(() => {
    setCompany(DemoDatabase.getCompany());
    setCompliances(DemoDatabase.getCompliances());
    setNotifications(DemoDatabase.getNotifications());
    setDocuments(DemoDatabase.getDocuments());
    setChatMessages(DemoDatabase.getChatMessages());
    setAuditLogs(DemoDatabase.getAuditLogs());

    const savedKey = localStorage.getItem('vigilant_gemini_api_key') || '';
    setApiKey(savedKey);

    const savedMode = localStorage.getItem('vigilant_demo_mode');
    if (savedMode !== null) {
      setIsDemoMode(savedMode === 'true');
    }

    const savedTheme = localStorage.getItem('vigilant_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem('vigilant_demo_mode', String(next));
    DemoDatabase.addAuditLog(
      'System Configuration Change', 
      `Execution mode changed to ${next ? 'Interactive Demo Mode' : 'Production Mode (API Key active)'}`
    );
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('vigilant_gemini_api_key', key);
    if (key) {
      setIsDemoMode(false);
      localStorage.setItem('vigilant_demo_mode', 'false');
    }
    DemoDatabase.addAuditLog('API Configuration Saved', 'Google Gemini API key was updated.');
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const updateCompany = (updated: Company) => {
    DemoDatabase.saveCompany(updated);
    // Reload state which recalculates metrics
    setCompany(DemoDatabase.getCompany());
    setCompliances(DemoDatabase.getCompliances());
    DemoDatabase.addAuditLog('Company Profile Updated', `Profile settings updated for ${updated.name}`);
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const toggleCompliance = (id: string) => {
    const nextList = DemoDatabase.toggleComplianceStatus(id);
    setCompliances(nextList);
    setCompany(DemoDatabase.getCompany()); // score changes
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const addCompliance = (title: string, category: string, dueDate: string, priority: string, desc: string) => {
    const list = DemoDatabase.getCompliances();
    const newComp: Compliance = {
      id: `comp-${Date.now()}`,
      company_id: company.id,
      title,
      description: desc,
      category: category as any,
      status: 'pending',
      priority: priority as any,
      due_date: dueDate,
      penalty_amount: priority === 'high' ? 5000 : priority === 'medium' ? 2000 : 500,
      risk_level: priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low',
      created_at: new Date().toISOString(),
    };
    DemoDatabase.saveCompliances([...list, newComp]);
    setCompliances(DemoDatabase.getCompliances());
    setCompany(DemoDatabase.getCompany());
    DemoDatabase.addAuditLog('Compliance Created', `Added manual obligation: ${title}`);
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const markNotificationRead = (id: string) => {
    const nextList = DemoDatabase.markNotificationRead(id);
    setNotifications(nextList);
  };

  const uploadDocument = async (fileName: string, fileSize: number) => {
    setIsLoading(true);
    try {
      const docList = DemoDatabase.getDocuments();
      
      // Call AI parse engine
      const aiResult = await callGeminiAgent('parse_document', {
        fileName,
        fileText: `Uploaded standard compliance documentation file: ${fileName}`
      });

      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        company_id: company.id,
        file_name: fileName,
        file_url: '#',
        file_type: fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_size: fileSize,
        summary: aiResult.summary,
        extracted_data: aiResult,
        status: 'processed',
        uploaded_by: 'user-123',
        created_at: new Date().toISOString()
      };

      DemoDatabase.saveDocuments([newDoc, ...docList]);
      setDocuments(DemoDatabase.getDocuments());

      // Auto generate checklists extracted from document into the Tracker!
      if (aiResult.checklists && aiResult.checklists.length > 0) {
        const compList = DemoDatabase.getCompliances();
        const newComps: Compliance[] = aiResult.checklists.map((task: string, index: number) => {
          // Parse due date if any extracted, otherwise set in 7 days
          const matchedDeadline = aiResult.deadlines?.[0]?.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          return {
            id: `comp-doc-${Date.now()}-${index}`,
            company_id: company.id,
            title: task.length > 50 ? task.substring(0, 47) + '...' : task,
            description: `Extracted from uploaded document "${fileName}": ${task}`,
            category: 'General',
            status: 'pending',
            priority: 'medium',
            due_date: matchedDeadline,
            penalty_amount: aiResult.penalties?.[0]?.amount || 1000,
            risk_level: 'medium',
            created_at: new Date().toISOString()
          };
        });

        DemoDatabase.saveCompliances([...newComps, ...compList]);
        setCompliances(DemoDatabase.getCompliances());
        setCompany(DemoDatabase.getCompany());
      }

      // Add warning notifications if penalties detected
      if (aiResult.penalties && aiResult.penalties.length > 0) {
        const notifList = DemoDatabase.getNotifications();
        const warningNotif: Notification = {
          id: `notif-${Date.now()}`,
          company_id: company.id,
          title: `Compliance Risk: ${fileName}`,
          message: `Identified potential liability of ${aiResult.penalties[0].amount} INR for violation of ${aiResult.penalties[0].violation}.`,
          type: 'warning',
          read: false,
          created_at: new Date().toISOString()
        };
        DemoDatabase.saveNotifications([warningNotif, ...notifList]);
        setNotifications(DemoDatabase.getNotifications());
      }

      DemoDatabase.addAuditLog('Document Uploaded & Parsed', `Processed "${fileName}" using AI compliances extraction.`);
      setAuditLogs(DemoDatabase.getAuditLogs());
    } catch (e) {
      console.error(e);
      DemoDatabase.addAuditLog('Document Upload Failed', `Failed parsing "${fileName}"`);
      setAuditLogs(DemoDatabase.getAuditLogs());
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = (updatedDoc: Document) => {
    const list = DemoDatabase.getDocuments();
    const nextList = list.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    DemoDatabase.saveDocuments(nextList);
    setDocuments(DemoDatabase.getDocuments());
    DemoDatabase.addAuditLog('Document Edited', `Updated OCR audit records for "${updatedDoc.file_name}"`);
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const sendChatMessage = async (msg: string) => {
    if (!msg.trim()) return;

    // Save user message
    const updatedChat = DemoDatabase.addChatMessage('user', msg);
    setChatMessages(updatedChat);
    setIsLoading(true);

    try {
      // Build history payload for Gemini API
      const history = updatedChat.slice(0, -1); // exclude the latest user message
      
      const aiReply = await callGeminiAgent('chat', {
        query: msg,
        history,
        company
      });

      const finalChat = DemoDatabase.addChatMessage('ai', aiReply);
      setChatMessages(finalChat);
    } catch (e) {
      console.error(e);
      const finalChat = DemoDatabase.addChatMessage('ai', 'My apologies. I encountered a server communication error while analyzing that query. Please check your connectivity and try again.');
      setChatMessages(finalChat);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    DemoDatabase.saveChatMessages([]);
    setChatMessages([]);
    DemoDatabase.addAuditLog('Chat History Cleared', 'Compliance assistant conversation logs reset.');
    setAuditLogs(DemoDatabase.getAuditLogs());
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('vigilant_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <AppContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        apiKey,
        saveApiKey,
        company,
        updateCompany,
        compliances,
        toggleCompliance,
        addCompliance,
        notifications,
        markNotificationRead,
        documents,
        uploadDocument,
        updateDocument,
        chatMessages,
        sendChatMessage,
        clearChat,
        auditLogs,
        theme,
        toggleTheme,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
