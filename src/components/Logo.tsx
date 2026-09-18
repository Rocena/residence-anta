export default function Logo({ className, size = 32, showText = true }: { className?: string, size?: number, showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 group ${className || ""}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-900 dark:text-white flex-shrink-0">
        <rect width="40" height="40" rx="8" className="fill-neutral-900 dark:fill-white" />
        <path d="M12 28L20 12L28 28M15 22H25" stroke="currentColor" className="stroke-white dark:stroke-neutral-900" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showText && (
        <span className="font-semibold text-base hidden sm:block text-neutral-800 dark:text-neutral-100 tracking-tight">
          Résidence ANTA
        </span>
      )}
    </div>
  );
}
