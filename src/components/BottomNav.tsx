"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope, Heart, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Health", href: "/questions", icon: Stethoscope },
  { name: "Add", href: "/add", icon: Plus, isPrimary: true },
  { name: "Names", href: "/names", icon: Heart },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around items-center py-4 px-4 pb-safe">
       {NAV_ITEMS.map((item) => {
          if (item.isPrimary) {
             return (
                <div key="add" className="-mt-12">
                  <Link href="/milestones">
                    <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl shadow-primary/40">
                      <Plus size={30} strokeWidth={3} />
                    </button>
                  </Link>
                </div>
             );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center transition-all",
                isActive ? "text-primary scale-105" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold mt-1 tracking-wide">{item.name}</span>
            </Link>
          );
        })}
    </nav>
  );
}
