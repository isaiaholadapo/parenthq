import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center relative z-20">
        <h1 className="font-semibold tracking-tight text-xl">ParentHq Admin</h1>
        <Link href="/" className="flex items-center gap-2 hover:text-slate-300 transition-colors text-sm font-medium">
          <ArrowLeft size={16} />
          Return to App
        </Link>
      </nav>
      <div className="bg-slate-50 min-h-screen p-4 md:p-8 flex-1">
        {children}
      </div>
    </div>
  );
}
