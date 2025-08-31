import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="fill-background stroke-primary" />
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="stroke-accent opacity-50" style={{transform: 'translate(1px, -1px)'}}/>
      </svg>
      <span className="text-xl font-bold tracking-tight">StudySpark</span>
    </div>
  );
}
