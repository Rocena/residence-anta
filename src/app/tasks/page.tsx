import TopBar from "@/components/TopBar";
import { CheckSquare, Plus, Search, Filter, Calendar, User, MoreVertical } from "lucide-react";

export default function TasksPage() {
  const tasks = [
    { id: "TSK-01", title: "Changer l'ampoule du couloir A", status: "TODO", priority: "LOW", dueDate: "2026-10-15", assignedTo: "Jean KPERI" },
    { id: "TSK-02", title: "Vérifier le compteur d'eau A02", status: "IN_PROGRESS", priority: "HIGH", dueDate: "2026-10-12", assignedTo: "Calvin NZUE" },
    { id: "TSK-03", title: "Nettoyage parking sous-sol", status: "TODO", priority: "MEDIUM", dueDate: "2026-10-14", assignedTo: "Véronique M." },
    { id: "TSK-04", title: "Remise des clés A03", status: "DONE", priority: "HIGH", dueDate: "2026-10-10", assignedTo: "Tévi ADABUNU" },
  ];

  return (
    <>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-sky-600" />
              Tâches Simples
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Assignez et suivez les interventions rapides.</p>
          </div>
          <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
            <Plus className="h-4 w-4" /> Nouvelle tâche
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Rechercher une tâche, un assigné..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm"
            />
          </div>
          <select className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm outline-none focus:border-sky-500 hidden sm:block">
            <option value="">À faire</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="DONE">Terminé</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Filter className="h-4 w-4" /> Filtrer
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {tasks.map((task) => (
              <li key={task.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group flex items-start gap-4">
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={task.status === "DONE"}
                    readOnly
                    className="h-5 w-5 rounded border-neutral-300 text-sky-600 focus:ring-sky-600 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className={`font-medium ${task.status === "DONE" ? "text-neutral-400 line-through" : "text-neutral-900 dark:text-neutral-50"}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {task.priority === "HIGH" && <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded uppercase">Urgent</span>}
                      <span className="text-xs text-neutral-400 font-mono">{task.id}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {task.assignedTo}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <button className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
