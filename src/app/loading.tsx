import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32 flex flex-col items-center animate-in fade-in duration-300">
      <div className="w-full max-w-md flex flex-col gap-6 pt-4">
        
        {/* Top App Bar Skeleton */}
        <div className="flex justify-between items-center px-2">
          <Skeleton className="h-7 w-24 rounded-md bg-slate-200" />
          <Skeleton className="h-6 w-6 rounded-full bg-slate-200" />
        </div>

        {/* Hero Card Skeleton */}
        <Skeleton className="h-64 w-full rounded-3xl bg-slate-200/70" />

        {/* Action Row Skeletons */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-3xl bg-slate-200/70" />
          <Skeleton className="h-32 w-full rounded-3xl bg-slate-200/70" />
        </div>

        {/* Reminders Widget Skeleton */}
        <div className="mt-2 flex flex-col gap-3">
          <Skeleton className="h-6 w-36 rounded-md bg-slate-200 mb-1 ml-2" />
          <Skeleton className="h-[140px] w-full rounded-3xl bg-slate-200/70" />
        </div>

      </div>
    </div>
  );
}
