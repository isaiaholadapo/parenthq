"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTodo, Stethoscope, Heart, Menu, Apple, PoundSterling, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Go-Bag", href: "/tasks", icon: ListTodo },
  { name: "OBGYN", href: "/questions", icon: Stethoscope },
  { name: "Names", href: "/names", icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 pb-safe pb-6 pt-3 px-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-200",
                isActive ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}

        {/* More Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <div className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer",
              ["/meals", "/budget", "/products"].includes(pathname) ? "text-indigo-600 scale-105" : "text-slate-400 hover:text-slate-600"
            )}>
              <Menu size={24} strokeWidth={["/meals", "/budget", "/products"].includes(pathname) ? 2.5 : 2} />
              <span className="text-[11px] font-bold tracking-wide">More</span>
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-slate-50 border-l border-slate-200">
            <SheetHeader className="mb-6 mt-4">
              <SheetTitle className="text-xl font-bold text-slate-800 text-left">Explore</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              <Link href="/meals">
               <div className={cn("flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all", pathname === "/meals" ? "border-indigo-400 bg-indigo-50/50" : "hover:border-slate-300")}>
                  <div className={cn("p-2 rounded-full", pathname === "/meals" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
                    <Apple size={20} strokeWidth={2.5} />
                  </div>
                  <span className={cn("font-bold text-lg", pathname === "/meals" ? "text-indigo-900" : "text-slate-700")}>Diet & Meals</span>
                </div>
              </Link>
              <Link href="/budget">
                <div className={cn("flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all", pathname === "/budget" ? "border-indigo-400 bg-indigo-50/50" : "hover:border-slate-300")}>
                  <div className={cn("p-2 rounded-full", pathname === "/budget" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
                    <PoundSterling size={20} strokeWidth={2.5} />
                  </div>
                  <span className={cn("font-bold text-lg", pathname === "/budget" ? "text-indigo-900" : "text-slate-700")}>Nursery Budget</span>
                </div>
              </Link>
              <Link href="/products">
                <div className={cn("flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all", pathname === "/products" ? "border-indigo-400 bg-indigo-50/50" : "hover:border-slate-300")}>
                  <div className={cn("p-2 rounded-full", pathname === "/products" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
                    <Package size={20} strokeWidth={2.5} />
                  </div>
                  <span className={cn("font-bold text-lg", pathname === "/products" ? "text-indigo-900" : "text-slate-700")}>Gear & Products</span>
                </div>
              </Link>
              <Link href="/milestones">
                <div className={cn("flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all", pathname === "/milestones" ? "border-indigo-400 bg-indigo-50/50" : "hover:border-slate-300")}>
                  <div className={cn("p-2 rounded-full", pathname === "/milestones" ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
                    <Sparkles size={20} strokeWidth={2.5} />
                  </div>
                  <span className={cn("font-bold text-lg", pathname === "/milestones" ? "text-indigo-900" : "text-slate-700")}>Milestone Feed</span>
                </div>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
