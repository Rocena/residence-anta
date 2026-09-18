"use client";

import TopBar from "@/components/TopBar";
import { Bell, AlertTriangle, Info, CheckCircle2, DollarSign, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export default function NotificationsPage() {
  const { notifications = [], setNotifications = () => {} } = useUser();

  const markAllAsRead = () => {
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "URGENT": return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case "FINANCE": return <DollarSign className="h-5 w-5 text-amber-500" />;
      case "INFO": return <Info className="h-5 w-5 text-blue-500" />;
      case "SUCCESS": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: return <Bell className="h-5 w-5 text-neutral-500" />;
    }
  };

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Bell className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
              Notifications
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gérez vos alertes et rappels automatisés.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="flex justify-between items-center p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Récemment</span>
            <button onClick={markAllAsRead} className="text-xs font-medium text-blue-600 hover:underline">Tout marquer comme lu</button>
          </div>
          
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">Aucune notification à afficher.</div>
            ) : (
              notifications.map((notif: any) => (
              <div key={notif.id} className={`p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${!notif.read ? (notif.type === 'URGENT' ? 'bg-rose-50/30 dark:bg-rose-900/10 border-l-4 border-rose-500' : 'bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-blue-500') : 'border-l-4 border-transparent'}`}>
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className={`p-2 rounded-full ${!notif.read ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'bg-neutral-100 dark:bg-neutral-900'}`}>
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium ${!notif.read ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-neutral-400 whitespace-nowrap ml-4">{notif.date}</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{notif.message}</p>
                    
                    {/* Actions contextuelles pour les notifications non lues ou urgentes */}
                    {!notif.read && notif.actionLink && (
                      <div className="flex gap-3 mt-2">
                        <Link onClick={() => setNotifications(notifications.map((n: any) => n.id === notif.id ? { ...n, read: true } : n))} href={notif.actionLink} className={`text-xs font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-md ${notif.type === 'URGENT' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400'} transition-colors`}>
                          Résoudre le problème <ArrowRight className="h-3 w-3" />
                        </Link>
                        <button 
                          onClick={() => setNotifications(notifications.map((n: any) => n.id === notif.id ? { ...n, read: true } : n))}
                          className="text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                          Ignorer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </main>
    </>
  );
}
