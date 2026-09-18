"use client";
import { getPendingTasksAction, getRolePermissionsAction, updateRolePermissionsAction } from "@/lib/actions";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const INITIAL_USERS = [
  { id: "1", name: "Admin ANTA", email: "admin@anta.app", role: "admin", passwordHash: "[REDACTED]", avatar: "AD", twoFactorEnabled: false },
  { id: "2", name: "Tévi ADABUNU", email: "tevi@anta.app", role: "proprietaire", passwordHash: "[REDACTED]", avatar: "TA", twoFactorEnabled: false },
  { id: "3", name: "Véronique", email: "veronique@anta.app", role: "gestionnaire", passwordHash: "[REDACTED]", avatar: "VE", twoFactorEnabled: false },
  { id: "4", name: "Jean KPERI", email: "jean@anta.app", role: "gestionnaire", passwordHash: "[REDACTED]", avatar: "JK", twoFactorEnabled: false },
  { id: "5", name: "Calvin NZUE", email: "calvin@anta.app", role: "intendant", passwordHash: "[REDACTED]", avatar: "CN", twoFactorEnabled: false },
];

const ALL_MODULES = [
  "dashboard", "residence", "tenants", "rents", "unpaid", "expenses",
  "finance", "projects", "messages", "reports", "settings", "help", "activity", "permissions"
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_MODULES,
  proprietaire: ALL_MODULES,
  gestionnaire: ["dashboard", "residence", "tenants", "rents", "unpaid", "expenses", "projects", "messages", "reports", "help"],
  intendant: ["dashboard", "residence", "tenants", "rents", "projects", "messages", "help"],
  comptable: ["dashboard", "finance", "rents", "unpaid", "expenses", "reports", "messages", "help"],
  technicien: ["dashboard", "projects", "messages", "residence", "help"],
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin & Support",
  proprietaire: "Propriétaire",
  gestionnaire: "Gestionnaire",
  intendant: "Intendant",
  comptable: "Comptable",
  technicien: "Technicien",
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  permissions: string[];
  twoFactorEnabled?: boolean;
    hideOnlineStatus?: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  hasPermission: (module: string) => boolean;
  getRoleLabel: () => string;
  login: (email: string, pass: string, mfaCode?: string) => 'success' | 'invalid_credentials' | 'mfa_required' | 'invalid_mfa' | 'deleted';
  logout: () => void; notifications?: any[]; setNotifications?: any; addNotification?: (notif: any) => void; unreadCount?: number;
  resetPassword: (email: string, newPass: string) => boolean;
  getAllUsers: () => any[];
  addUser: (userData: any) => void;
  deleteUser: (id: string) => void;
  updateUser: (id: string, updates: any) => void;
  activities: any[];
  logActivity: (action: string, details: string) => void;
  getRolePermissionsMap: () => Record<string, string[]>;
  updateRolePermissions: (perms: Record<string, string[]>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [usersDb, setUsersDb] = useState<any[]>([]);
  const [rolePermissionsDb, setRolePermissionsDb] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadPerms() {
      const res = await getRolePermissionsAction();
      if (res.success && res.data) {
        setRolePermissionsDb(res.data);
      }
    }
    loadPerms();
  }, []);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [dynamicTasks, setDynamicTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const storedActivities = localStorage.getItem('anta_activities');
    if (storedActivities) {
      let parsed = JSON.parse(storedActivities);
      let modified = false;
      parsed = parsed.map((act: any) => {
         if ((act.action && act.action.includes('Ǹ')) || (act.details && act.details.includes('Ǹ')) || (act.details && act.details.includes(''))) {
           modified = true;
           return {
             ...act,
             action: act.action ? act.action.replace(/Ǹ/g, 'é').replace(/ǯ/g, 'û') : act.action,
             details: act.details ? act.details.replace(/Ǹ/g, 'é').replace(/ǯ/g, 'û') : act.details
           };
         }
         return act;
      });
      if (modified) {
         localStorage.setItem('anta_activities', JSON.stringify(parsed));
      }
      setActivities(parsed);
    }
  }, []);

  const logActivity = (action: string, details: string) => {
    setActivities(prev => {
      // Find the current user for the log, wait we don't have it in the callback easily without a ref, 
      // but we can just use the 'user' state from closure... actually it's better to get from localStorage if user is null (like during login)
      let currentUser = user;
      if (!currentUser) {
         const saved = localStorage.getItem('anta_user');
         if (saved) currentUser = JSON.parse(saved);
      }
      
      const newActivity = {
        id: Date.now(),
        action,
        user: currentUser ? currentUser.name : "Système",
        role: currentUser ? currentUser.role : "SYSTEM",
        details,
        date: new Date().toLocaleString('fr-FR', {
          day: '2-digit', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit'
        })
      };
      const updated = [newActivity, ...prev];
      localStorage.setItem('anta_activities', JSON.stringify(updated));
      return updated;
    });
  };

  
  useEffect(() => {
    const stored = localStorage.getItem('anta_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications([{ id: 1, type: "INFO", title: "Bienvenue", message: "Bienvenue sur ANTA", date: new Date().toLocaleDateString(), read: false }]);
    }
  }, []);

  const addNotification = (notif: any) => {
    const pushEnabled = localStorage.getItem('anta_push_notifications') === 'true';
    if (pushEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title || 'Nouvelle notification', {
        body: notif.message || notif.text || '',
      });
    }
    setNotifications(prev => {
      const updated = [{...notif, id: Date.now(), read: false, date: new Date().toLocaleDateString()}, ...prev];
      localStorage.setItem('anta_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const setNotificationsWrapped = (notifs: any) => { return; 
    setNotifications(notifs);
    if (typeof notifs !== 'function') {
      localStorage.setItem('anta_notifications', JSON.stringify(notifs));
    }
  };

  const combinedNotifications = [...dynamicTasks, ...notifications];
  const unreadCount = combinedNotifications.filter(n => !n.read).length;
  
  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        try {
          const res = await getPendingTasksAction(user.id, user.role, user.name);
          if (res.success && res.data) {
            const newDynamics = [];
            const d = res.data;
            if (d.expensesToValidate > 0) {
              newDynamics.push({ id: 'dyn-1', type: 'URGENT', title: 'Action requise', message: `Vous avez ${d.expensesToValidate} dépense(s) en attente de validation.`, date: 'Maintenant', read: false, actionLink: '/expenses' });
            }
            if (d.projectStepsToValidate > 0) {
              newDynamics.push({ id: 'dyn-2', type: 'URGENT', title: 'Action requise', message: `Vous avez ${d.projectStepsToValidate} étape(s) de projet en attente de validation.`, date: 'Maintenant', read: false, actionLink: '/projects' });
            }
            if (d.expensesToDisburse > 0) {
              newDynamics.push({ id: 'dyn-3', type: 'FINANCE', title: 'Décaissement', message: `Il y a ${d.expensesToDisburse} dépense(s) à décaisser.`, date: 'Maintenant', read: false, actionLink: '/expenses' });
            }
            if (d.expensesToPay > 0) {
              newDynamics.push({ id: 'dyn-4', type: 'SUCCESS', title: 'Paiement à effectuer', message: `Fonds reçus : vous avez ${d.expensesToPay} paiement(s) à effectuer.`, date: 'Maintenant', read: false, actionLink: '/expenses' });
            }
            // Simulate unread messages dynamically
    newDynamics.push({ id: 'dyn-msg', type: 'INFO', title: 'Nouveau message', message: 'Vous avez des messages non lus dans votre messagerie.', date: 'Maintenant', read: false, actionLink: '/messages' });
    setDynamicTasks(newDynamics);
          }
        } catch(e) {}
      };
      
      fetchTasks();
      const interval = setInterval(fetchTasks, 10000);
      return () => clearInterval(interval);
    } else {
      setDynamicTasks([]);
    }
  }, [user]);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize DB
    let storedUsers = localStorage.getItem('anta_users_db');
    if (!storedUsers) {
      localStorage.setItem('anta_users_db', JSON.stringify(INITIAL_USERS));
      storedUsers = JSON.stringify(INITIAL_USERS);
    }
    
    const parsedUsers = JSON.parse(storedUsers);
    let dirty = false;
    
    // Force Calvin to be intendant if he was previously saved as something else
    const calvin = parsedUsers.find((u: any) => u.email === "calvin@anta.app");
    if (calvin && (calvin.role !== "intendant" || calvin.name !== "Calvin NZUE")) {
      calvin.role = "intendant";
      calvin.name = "Calvin NZUE";
      calvin.avatar = "CN";
      dirty = true;
    }
    
    if (dirty) {
      localStorage.setItem('anta_users_db', JSON.stringify(parsedUsers));
    }
    setUsersDb(parsedUsers);

    const saved = localStorage.getItem('anta_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Update current user session if it's Calvin
      if (parsed.email === "calvin@anta.app" && (parsed.role !== "intendant" || parsed.name !== "Calvin NZUE")) {
        parsed.role = "intendant";
        parsed.name = "Calvin NZUE";
        parsed.avatar = "CN";
        localStorage.setItem('anta_user', JSON.stringify(parsed));
      }
      
      setUser({
        ...parsed,
        permissions: (rolePermissionsDb[parsed.role] || ROLE_PERMISSIONS[parsed.role]) || []
      });
    } else if (pathname !== '/login') {
      logActivity('LOGIN', 'Déconnexion réussie');
    router.push('/login');
  }
    setLoading(false);
  }, [pathname, router]);

  const saveUsersDb = (newDb: any[]) => {
    localStorage.setItem('anta_users_db', JSON.stringify(newDb));
    setUsersDb(newDb);
  };

  
  useEffect(() => {
    if (user && Object.keys(rolePermissionsDb).length > 0) {
      const updatedPerms = rolePermissionsDb[user.role] || ROLE_PERMISSIONS[user.role] || [];
      if (JSON.stringify(user.permissions) !== JSON.stringify(updatedPerms)) {
        const u = { ...user, permissions: updatedPerms };
        setUser(u);
        localStorage.setItem('anta_user', JSON.stringify(u));
      }
    }
  }, [rolePermissionsDb]);

  const getRolePermissionsMap = () => {
    return Object.keys(rolePermissionsDb).length > 0 ? rolePermissionsDb : ROLE_PERMISSIONS;
  };

  const updateRolePermissions = async (perms: Record<string, string[]>) => {
    setRolePermissionsDb(perms);
    await updateRolePermissionsAction(perms);
  };

  const login = (email: string, pass: string, mfaCode?: string) => {
    const deletedEmails = JSON.parse(localStorage.getItem('anta_deleted_users') || '[]');
    if (deletedEmails.includes(email)) return 'deleted';
    
    const found = usersDb.find(u => u.email === email && u.password === pass);
    if (!found) {
      return 'invalid_credentials';
    }

    if (found.twoFactorEnabled) {
      if (!mfaCode) {
        return 'mfa_required';
      }
      // Extremely basic mock MFA check (e.g., must be 6 digits)
      if (mfaCode.length !== 6) {
        return 'invalid_mfa';
      }
    }

    const u = { ...found, permissions: (rolePermissionsDb[found.role] || ROLE_PERMISSIONS[found.role]) || [] };
    localStorage.setItem('anta_user', JSON.stringify(found));
      document.cookie = 'anta_session=true; path=/; max-age=86400; SameSite=Lax';
    setUser(u);
    router.push('/');
      logActivity('LOGIN', 'Connexion réussie');
      return 'success';
  };

  const logout = () => {
    localStorage.removeItem('anta_user');
      document.cookie = 'anta_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    logActivity('LOGIN', 'Déconnexion réussie');
    router.push('/login');
  };

  const resetPassword = (email: string, newPass: string) => {
    const idx = usersDb.findIndex(u => u.email === email);
    if (idx !== -1) {
      const updated = [...usersDb];
      updated[idx].password = newPass;
      saveUsersDb(updated);
      logActivity('UPDATE', `A réinitialisé le mot de passe pour ${email}`);
      return true;
    }
    return false;
  };

  const getAllUsers = () => {
    return usersDb;
  };

  const addUser = (userData: any) => {
    const newUser = {
      id: Date.now().toString(),
      passwordHash: "[REDACTED]", // default
      avatar: userData.name.substring(0, 2).toUpperCase(),
      twoFactorEnabled: false,
      permissions: (rolePermissionsDb[userData.role] || ROLE_PERMISSIONS[userData.role]) || [],
      ...userData
    };
    saveUsersDb([...usersDb, newUser]);
  };

  const deleteUser = (id: string) => {
    const userToDel = usersDb.find(u => u.id === id);
    if (userToDel) {
      const deletedEmails = JSON.parse(localStorage.getItem('anta_deleted_users') || '[]');
      deletedEmails.push(userToDel.email);
      localStorage.setItem('anta_deleted_users', JSON.stringify(deletedEmails));
    }
    saveUsersDb(usersDb.filter(u => u.id !== id));
  };

  const updateUser = (id: string, updates: any) => {
    const idx = usersDb.findIndex(u => u.id === id);
    if (idx !== -1) {
      const updated = [...usersDb];
      updated[idx] = { 
        ...updated[idx], 
        ...updates,
        permissions: updates.role ? ((rolePermissionsDb[updates.role] || ROLE_PERMISSIONS[updates.role]) || []) : updated[idx].permissions
      };
      saveUsersDb(updated);
      // update current user if it's them
      if (user?.id === id) {
        localStorage.setItem('anta_user', JSON.stringify(updated[idx]));
        setUser(updated[idx]);
      }
    }
  };

  const hasPermission = (module: string) => user ? user.permissions.includes(module) : false;
  const getRoleLabel = () => user ? ROLE_LABELS[user.role] || user.role : "";

  if (loading) return null;
  if (!user && pathname !== '/login') return null;

  return (
    <UserContext.Provider value={{ 
      user, 
      hasPermission, 
      getRoleLabel, 
      login, 
      logout, 
      resetPassword, 
      getAllUsers, 
      addUser, 
      deleteUser, 
      updateUser,
      notifications,
      setNotifications,
      unreadCount,
      activities,
      logActivity,
        getRolePermissionsMap,
        updateRolePermissions
      }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
