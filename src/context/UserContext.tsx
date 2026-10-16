"use client";
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import * as actions from "@/lib/actions";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrateur",
  admin: "Administrateur",
  proprietaire: "Propriétaire",
  gestionnaire: "Gestionnaire",
  intendant: "Intendant",
  comptable: "Comptable",
  technicien: "Technicien",
};

export interface ResidenceItem {
  id: string;
  name: string;
  address: string;
  city?: string;
  description?: string;
  unitsCount?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  permissions: string[];
  residenceIds: string[];
  twoFactorEnabled?: boolean;
  hideOnlineStatus?: boolean;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  residenceIds?: string[];
  createdAt?: string;
}

interface UserContextType {
  user: UserProfile | null;
  status: "authenticated" | "loading" | "unauthenticated";
  hasPermission: (module: string) => boolean;
  getRoleLabel: (roleKey?: string) => string;
  logout: () => void;

  // Multi-properties management
  residences: ResidenceItem[];
  userAccessibleResidences: ResidenceItem[];
  selectedResidenceId: string;
  setSelectedResidenceId: (id: string) => void;
  refreshResidences: () => Promise<void>;

  // User management (Super Admin / Admin)
  usersList: ManagedUser[];
  refreshUsers: () => Promise<void>;
  getAllUsers: () => ManagedUser[];
  addUser: (userData: { name: string; email: string; role: string; password?: string; residenceIds?: string[] }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (userId: string) => Promise<{ success: boolean; tempPassword?: string; error?: string }>;

  // Role permissions
  rolePermissionsMap: Record<string, string[]>;
  getRolePermissionsMap: () => Record<string, string[]>;
  updateRolePermissions: (perms: Record<string, string[]>) => Promise<void>;

  // Notifications & Activities
  notifications: any[];
  setNotifications: (n: any[]) => void;
  unreadCount: number;
  activities: any[];
  logActivity: (type: string, details: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [residences, setResidences] = useState<ResidenceItem[]>([]);
  const [selectedResidenceId, setSelectedResidenceIdState] = useState<string>("ALL");
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [rolePermissionsMap, setRolePermissionsMap] = useState<Record<string, string[]>>({});

  // Convert NextAuth session user to our internal format
  const user: UserProfile | null = session?.user
    ? {
        id: (session.user as any).id || "0",
        name: session.user.name || "Utilisateur",
        email: session.user.email || "",
        role: (session.user as any).role || "gestionnaire",
        permissions: (session.user as any).permissions || [],
        residenceIds: (session.user as any).residenceIds || ["*"],
        avatar: session.user.name ? session.user.name.substring(0, 2).toUpperCase() : "AN",
      }
    : null;

  // Load initial notifications & local storage selections
  useEffect(() => {
    try {
      const savedNots = localStorage.getItem("anta_notifications");
      if (savedNots) setNotifications(JSON.parse(savedNots));

      const savedActs = localStorage.getItem("anta_activities");
      if (savedActs) setActivities(JSON.parse(savedActs));

      const savedRes = localStorage.getItem("anta_selected_residence");
      if (savedRes) setSelectedResidenceIdState(savedRes);
    } catch (e) {
      console.warn("Could not read local storage:", e);
    }
  }, []);

  const setSelectedResidenceId = (id: string) => {
    setSelectedResidenceIdState(id);
    try {
      localStorage.setItem("anta_selected_residence", id);
    } catch (e) {}
  };

  // Fetch residences from server
  const refreshResidences = useCallback(async () => {
    try {
      const res = await actions.getResidencesAction();
      if (res?.success && Array.isArray(res.data)) {
        setResidences(res.data);
      }
    } catch (err) {
      console.warn("[UserContext] Could not load residences:", err);
    }
  }, []);

  // Fetch users list (for Super Admin / Admin)
  const refreshUsers = useCallback(async () => {
    if (!user) return;
    const role = user.role.toLowerCase();
    if (role === "super_admin" || role === "admin" || role === "proprietaire") {
      try {
        const res = await actions.getUsersAction();
        if (res?.success && Array.isArray(res.data)) {
          setUsersList(res.data);
        }
      } catch (err) {
        console.warn("[UserContext] Could not load users:", err);
      }
    }
  }, [user]);

  // Fetch role permissions
  const refreshPermissions = useCallback(async () => {
    if (!user) return;
    const role = user.role.toLowerCase();
    if (role === "super_admin" || role === "admin" || role === "proprietaire") {
      try {
        const res = await actions.getRolePermissionsAction();
        if (res?.success && res.data) {
          setRolePermissionsMap(res.data);
        }
      } catch (err) {
        console.warn("[UserContext] Could not load permissions:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    if (status === "authenticated") {
      refreshResidences();
      refreshUsers();
      refreshPermissions();
    }
  }, [status, refreshResidences, refreshUsers, refreshPermissions]);

  // Determine residences accessible by this user
  const userAccessibleResidences = residences.filter((r) => {
    if (!user) return false;
    if (user.role === "super_admin" || user.role === "admin" || user.role === "proprietaire") return true;
    if (user.residenceIds.includes("*")) return true;
    return user.residenceIds.includes(r.id);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const logActivity = (type: string, details: string) => {
    const newActivity = {
      id: Date.now().toString(),
      type,
      details,
      date: new Date().toISOString(),
    };
    const updated = [newActivity, ...activities].slice(0, 50);
    setActivities(updated);
    try {
      localStorage.setItem("anta_activities", JSON.stringify(updated));
    } catch (e) {}
  };

  const hasPermission = (module: string) => {
    if (!user) return false;
    const role = user.role.toLowerCase();
    if (role === "super_admin" || role === "admin" || role === "proprietaire") return true;
    if (user.permissions.includes("*")) return true;
    return user.permissions.includes(module) || user.permissions.some((p) => p.startsWith(module + "."));
  };

  const getRoleLabel = (roleKey?: string) => {
    const key = roleKey || (user ? user.role : "");
    return ROLE_LABELS[key] || key;
  };

  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const getAllUsers = () => usersList;

  const addUser = async (userData: {
    name: string;
    email: string;
    role: string;
    password?: string;
    residenceIds?: string[];
  }) => {
    try {
      const res = await actions.addUserAction(userData);
      if (res?.success) {
        await refreshUsers();
        return { success: true };
      }
      return { success: false, error: "Échec de création utilisateur" };
    } catch (err: any) {
      return { success: false, error: err.message || "Erreur" };
    }
  };

  const updateUser = async (id: string, updates: any) => {
    try {
      const res = await actions.updateUserAction(id, updates);
      if (res?.success) {
        await refreshUsers();
        return { success: true };
      }
      return { success: false, error: "Échec de mise à jour" };
    } catch (err: any) {
      return { success: false, error: err.message || "Erreur" };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await actions.deleteUserAction(id);
      if (res?.success) {
        await refreshUsers();
        return { success: true };
      }
      return { success: false, error: "Échec de suppression" };
    } catch (err: any) {
      return { success: false, error: err.message || "Erreur" };
    }
  };

  const resetPassword = async (userId: string) => {
    try {
      const res = await actions.resetUserPasswordAction(userId);
      return res;
    } catch (err: any) {
      return { success: false, error: err.message || "Erreur" };
    }
  };

  const getRolePermissionsMap = () => rolePermissionsMap;

  const updateRolePermissions = async (perms: Record<string, string[]>) => {
    await actions.updateRolePermissionsAction(perms);
    setRolePermissionsMap(perms);
  };

  // Loading animation state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide">Chargement d&apos;ANTA Management...</p>
        </div>
      </div>
    );
  }

  // Not authenticated on protected route
  if (!user && pathname !== "/login") {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        status,
        hasPermission,
        getRoleLabel,
        logout,
        residences,
        userAccessibleResidences,
        selectedResidenceId,
        setSelectedResidenceId,
        refreshResidences,
        usersList,
        refreshUsers,
        getAllUsers,
        addUser,
        deleteUser,
        updateUser,
        resetPassword,
        rolePermissionsMap,
        getRolePermissionsMap,
        updateRolePermissions,
        notifications,
        setNotifications,
        unreadCount,
        activities,
        logActivity,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
