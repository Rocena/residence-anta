"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { AlertCircle, ChevronRight, CheckCircle2, DollarSign } from "lucide-react";
import Link from "next/link";
import { getPendingTasksAction } from "@/lib/actions";

export default function PendingTasksAlerts() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<{
    expensesToValidate: number;
    projectStepsToValidate: number;
    expensesToDisburse: number;
    expensesToPay: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch tasks based on user role and id
      getPendingTasksAction(user.id, user.role, user.name).then(res => {
        if (res.success) {
          setTasks(res.data);
        }
      });
      
      // Poll every 10 seconds for "real-time" feel
      const interval = setInterval(() => {
        getPendingTasksAction(user.id, user.role, user.name).then(res => {
          if (res.success) setTasks(res.data);
        });
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user || !tasks) return null;

  const alerts = [];

  if (tasks.expensesToValidate > 0) {
    alerts.push(
      <Link key="exp-val" href="/expenses" className="flex items-center justify-between w-full p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-b border-amber-100 dark:border-amber-500/20 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Vous avez {tasks.expensesToValidate} dépense{tasks.expensesToValidate > 1 ? 's' : ''} en attente de validation.</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }

  if (tasks.projectStepsToValidate > 0) {
    alerts.push(
      <Link key="proj-val" href="/projects" className="flex items-center justify-between w-full p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-b border-amber-100 dark:border-amber-500/20 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Vous avez {tasks.projectStepsToValidate} étape{tasks.projectStepsToValidate > 1 ? 's' : ''} de projet en attente de validation.</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }

  if (tasks.expensesToDisburse > 0) {
    alerts.push(
      <Link key="exp-dis" href="/expenses" className="flex items-center justify-between w-full p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-500/20 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>Il y a {tasks.expensesToDisburse} dépense{tasks.expensesToDisburse > 1 ? 's' : ''} à décaisser (virement à effectuer).</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }

  if (tasks.expensesToPay > 0) {
    alerts.push(
      <Link key="exp-pay" href="/expenses" className="flex items-center justify-between w-full p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border-b border-blue-100 dark:border-blue-500/20 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Fonds reçus : vous avez {tasks.expensesToPay} paiement{tasks.expensesToPay > 1 ? 's' : ''} à effectuer.</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="w-full flex flex-col shadow-sm z-40 relative">
      {alerts}
    </div>
  );
}
