"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, Stethoscope, Heart, Apple, PoundSterling, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Go-Bag", href: "/tasks", icon: ListTodo },
  { name: "OBGYN Log", href: "/questions", icon: Stethoscope },
  { name: "Name Vault", href: "/names", icon: Heart },
  { name: "Safe Meals", href: "/meals", icon: Apple },
  { name: "Nursery Budget", href: "/budget", icon: PoundSterling },
  { name: "Gear Pipeline", href: "/products", icon: Package },
  { name: "Milestones", href: "/milestones", icon: Sparkles },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 border-none bg-slate-900 z-40 shadow-xl transition-all duration-300">
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-2xl font-extrabold tracking-tight text-white mb-8 pl-2 w-full flex items-center gap-2">
           👶 ParentHq
        </h2>
        
        <nav className="flex flex-col gap-2 flex-1 w-full relative">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full font-bold shadow-none",
                  isActive ? "bg-indigo-600 text-white shadow-md border border-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-indigo-100" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
