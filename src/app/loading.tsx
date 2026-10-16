export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin dark:border-slate-700 dark:border-t-indigo-400" />
        <div className="absolute w-8 h-8 border-4 border-emerald-200 border-b-emerald-500 rounded-full animate-spin [animation-direction:reverse] dark:border-slate-800 dark:border-b-emerald-400" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-semibold tracking-wider text-slate-700 dark:text-slate-300 uppercase">
          Chargement en cours
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Préparation des données ANTA Management...
        </p>
      </div>

      <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="w-full h-full bg-indigo-600 rounded-full animate-[shimmer_1.5s_infinite] -translate-x-full" />
      </div>
    </div>
  );
}
