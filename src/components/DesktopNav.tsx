"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Stethoscope, 
  Heart, 
  Utensils, 
  Wallet, 
  Package, 
  Star,
  Plus
} from "lucide-react";
import { useFamilyData } from "@/hooks/useFamilyData";

const routes = [
  { path: "/", label: "Dashboard", Icon: LayoutDashboard },
  { path: "/tasks", label: "Go-Bag", Icon: ShoppingBag },
  { path: "/questions", label: "OBGYN Log", Icon: Stethoscope },
  { path: "/names", label: "Name Vault", Icon: Heart },
  { path: "/meals", label: "Safe Meals", Icon: Utensils },
  { path: "/budget", label: "Nursery Budget", Icon: Wallet },
  { path: "/products", label: "Gear Pipeline", Icon: Package },
  { path: "/milestones", label: "Milestones", Icon: Star },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { familyData } = useFamilyData();

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-surface-container-low py-10 rounded-r-[32px] overflow-hidden">
      <div className="px-8 mb-12">
        <h1 className="font-headline text-3xl text-primary">ParentHQ</h1>
        <p className="text-sm font-label tracking-wide text-slate-500 uppercase mt-1">Serene Curator Mode</p>
      </div>

      <nav className="flex-1 space-y-1">
        {routes.map(({ path, label, Icon }) => {
          const isActive = pathname === path;
          
          if (isActive) {
            return (
              <Link 
                key={path} 
                href={path}
                className="flex items-center text-primary font-bold bg-white/60 rounded-l-full ml-4 pl-4 py-3 group hover:translate-x-1 transition-all"
              >
                <Icon size={24} className="mr-4 text-primary" strokeWidth={2.5} />
                <span className="font-label">{label}</span>
              </Link>
            );
          }
          
          return (
            <Link 
              key={path} 
              href={path}
              className="flex items-center text-slate-500 pl-8 py-3 group hover:translate-x-1 hover:text-primary transition-all"
            >
              <Icon size={24} className="mr-4" strokeWidth={2} />
              <span className="font-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-8 mt-auto pt-10">
        <Link href="/milestones">
            <button className="w-full bg-primary text-on-primary py-4 px-6 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              <Plus size={20} strokeWidth={3} />
              <span>Add New Milestone</span>
            </button>
        </Link>

        {familyData && (
          <div className="mt-8 flex items-center gap-3 p-2 bg-surface hover:bg-surface-container transition-colors rounded-2xl cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-lg">
              P
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Parent Profile</p>
              <p className="text-xs text-on-surface-variant">Expecting {familyData.dueDate ? new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(familyData.dueDate) : "Soon"}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
