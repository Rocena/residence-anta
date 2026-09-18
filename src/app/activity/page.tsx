"use client";
import { Activity, ShieldCheck, UserPlus, LogIn, FileEdit, Trash2, Search, Filter } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

export default function ActivityLogPage() {
  const {  activities , logActivity } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const logs = activities || [];

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === "" || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch(action) {
      case "LOGIN": return <LogIn className="h-4 w-4 text-emerald-500" />;
      case "UPDATE": return <FileEdit className="h-4 w-4 text-blue-500" />;
      case "CREATE": return <UserPlus className="h-4 w-4 text-indigo-500" />;
      case "DELETE": return <Trash2 className="h-4 w-4 text-rose-500" />;
      default: return <Activity className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch(action) {
      case "LOGIN": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "UPDATE": return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
      case "CREATE": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400";
      case "DELETE": return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
      default: return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-neutral-600" />
            Journal d'Activité
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Audit trail de toutes les actions effectuées sur la plateforme.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Rechercher par utilisateur, action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-500/20 focus:border-neutral-500 outline-none transition-all text-sm text-neutral-900 dark:text-neutral-100"
          />
        </div>
        <select 
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm outline-none focus:border-neutral-500 text-neutral-900 dark:text-neutral-100 hidden sm:block">
          <option value="">Toutes les actions</option>
          <option value="CREATE">Créations</option>
          <option value="UPDATE">Modifications</option>
          <option value="DELETE">Suppressions</option>
          <option value="LOGIN">Connexions</option>
        </select>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <Filter className="h-4 w-4" /> Filtrer
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Date & Heure</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Utilisateur</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Action</th>
                <th className="px-6 py-4 font-medium">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                    Aucune activité récente.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {log.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900 dark:text-white">{log.user}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{log.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium \${getActionBadge(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
