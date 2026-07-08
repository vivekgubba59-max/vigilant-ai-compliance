'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Company, 
  Compliance, 
  Notification, 
  ChatMessage, 
  AuditLog, 
  LocalDatabase,
  initialCompany,
  User 
} from '@/lib/database';
import { callGeminiAgent } from '@/lib/gemini';

interface AppContextType {
  apiKey: string;
  saveApiKey: (key: string) => void;
  company: Company;
  updateCompany: (company: Company) => void;
  compliances: Compliance[];
  toggleCompliance: (id: string) => void;
  addCompliance: (title: string, category: string, dueDate: string, priority: string, desc: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  auditLogs: AuditLog[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean;
  currentUser: User | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  signupUser: (fullName: string, email: string, password: string) => Promise<string | null>;
  logoutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string>('');
  const [company, setCompany] = useState<Company>(initialCompany);
  const [compliances, setCompliances] = useState<Compliance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Sync state from LocalDatabase (localStorage wrappers) on client mount
  useEffect(() => {
    setCompany(LocalDatabase.getCompany());
    setCompliances(LocalDatabase.getCompliances());
    setNotifications(LocalDatabase.getNotifications());
    setChatMessages(LocalDatabase.getChatMessages());
    setAuditLogs(LocalDatabase.getAuditLogs());
    setCurrentUser(LocalDatabase.getSessionUser());

    const savedKey = localStorage.getItem('vigilant_gemini_api_key') || '';
    setApiKey(savedKey);

    const savedTheme = localStorage.getItem('vigilant_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('vigilant_gemini_api_key', key);
    LocalDatabase.addAuditLog('API Configuration Saved', 'Google Gemini API key was updated.');
    setAuditLogs(LocalDatabase.getAuditLogs());
  };

  const updateCompany = (updated: Company) => {
    LocalDatabase.saveCompany(updated);
    // Reload state which recalculates metrics
    setCompany(LocalDatabase.getCompany());
    setCompliances(LocalDatabase.getCompliances());
    LocalDatabase.addAuditLog('Company Profile Updated', `Profile settings updated for ${updated.name}`);
    setAuditLogs(LocalDatabase.getAuditLogs());
  };

  const toggleCompliance = (id: string) => {
    const nextList = LocalDatabase.toggleComplianceStatus(id);
    setCompliances(nextList);
    setCompany(LocalDatabase.getCompany()); // score changes
    setAuditLogs(LocalDatabase.getAuditLogs());
  };

  const addCompliance = (title: string, category: string, dueDate: string, priority: string, desc: string) => {
    const list = LocalDatabase.getCompliances();
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
    LocalDatabase.saveCompliances([...list, newComp]);
    setCompliances(LocalDatabase.getCompliances());
    setCompany(LocalDatabase.getCompany());
    LocalDatabase.addAuditLog('Compliance Created', `Added manual obligation: ${title}`);
    setAuditLogs(LocalDatabase.getAuditLogs());
  };

  const markNotificationRead = (id: string) => {
    const nextList = LocalDatabase.markNotificationRead(id);
    setNotifications(nextList);
  };



  const sendChatMessage = async (msg: string) => {
    if (!msg.trim()) return;

    // Save user message
    const updatedChat = LocalDatabase.addChatMessage('user', msg);
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

      const finalChat = LocalDatabase.addChatMessage('ai', aiReply);
      setChatMessages(finalChat);
    } catch (e: any) {
      console.error(e);
      const errText = e.message || '';
      let reply = 'My apologies. I encountered a server communication error while analyzing that query. Please check your connectivity and try again.';
      if (errText.includes("Gemini API Key is missing") || errText.includes("configured Gemini API key is invalid")) {
        reply = errText;
      }
      const finalChat = LocalDatabase.addChatMessage('ai', reply);
      setChatMessages(finalChat);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    LocalDatabase.saveChatMessages([]);
    setChatMessages([]);
    LocalDatabase.addAuditLog('Chat History Cleared', 'Compliance assistant conversation logs reset.');
    setAuditLogs(LocalDatabase.getAuditLogs());
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('vigilant_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    const user = await LocalDatabase.loginUser(email, password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const signupUser = async (fullName: string, email: string, password: string): Promise<string | null> => {
    const result = await LocalDatabase.registerUser(fullName, email, password);
    if (typeof result === 'string') {
      return result;
    }
    setCurrentUser(result);
    return null;
  };

  const logoutUser = () => {
    LocalDatabase.setSessionUser(null);
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        saveApiKey,
        company,
        updateCompany,
        compliances,
        toggleCompliance,
        addCompliance,
        notifications,
        markNotificationRead,
        chatMessages,
        sendChatMessage,
        clearChat,
        auditLogs,
        theme,
        toggleTheme,
        isLoading,
        currentUser,
        loginUser,
        signupUser,
        logoutUser
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
