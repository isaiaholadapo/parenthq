"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFamilyData } from "@/hooks/useFamilyData";
import { useEvents } from "@/hooks/useEvents";
import { getPregnancyStats, getBabySize, calculateBabyAge } from "@/lib/pregnancy";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Bell, 
  Settings, 
  Heart, 
  Apple, 
  PhoneCall, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  PartyPopper 
} from "lucide-react";
import { InsightWidget } from "@/components/InsightWidget";

export default function HomePage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const { familyData, loading: familyLoading, transitionToPostpartum } = useFamilyData();
  const { events, loading: eventsLoading } = useEvents();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [actualBirthDate, setActualBirthDate] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (!user) return null;

  const dueDateParam = familyData?.dueDate ? familyData.dueDate.toISOString() : "2026-12-05";
  const { weeks, days, daysRemaining, progressPercent } = getPregnancyStats(dueDateParam);
  const babySize = getBabySize(weeks);
  const username = user.email?.split("@")[0] || "User";
  const isPostpartum = familyData?.mode === "postpartum";
  const birthDateParam = familyData?.actualBirthDate ? (familyData.actualBirthDate as any)?.toDate?.() ?? familyData.actualBirthDate : undefined;

  const handleTransition = async () => {
    if (!actualBirthDate) return;
    try {
      await transitionToPostpartum(new Date(actualBirthDate));
      setDialogOpen(false);
    } catch (e) {
      console.error("Transition failed:", e);
    }
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-12 pb-32 md:pb-12">
        
        {isPostpartum ? (
           <section className="relative">
             <div className="bg-emerald-600 rounded-lg p-10 shadow-xl overflow-hidden group">
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-8">
                   <div>
                     <h2 className="font-headline text-5xl text-white mb-2">Hello, {username}</h2>
                     <p className="text-emerald-100 font-bold tracking-wide">You did it! Welcome to parenthood.</p>
                   </div>
                 </div>
                 <div className="mt-auto bg-emerald-700/50 p-6 rounded-2xl border border-emerald-500/50 shadow-inner inline-block w-fit">
                    <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest mb-1.5">Baby Age</p>
                    <p className="font-extrabold text-white text-4xl">{birthDateParam ? calculateBabyAge(birthDateParam) : "Born!"}</p>
                 </div>
               </div>
             </div>
           </section>
        ) : (
          <section className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Hero Card */}
              <div className="lg:col-span-8 bg-surface-container-lowest rounded-[24px] p-10 shadow-xl shadow-indigo-900/5 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl transition-transform group-hover:scale-110 duration-1000"></div>
                <div className="relative z-10 flex flex-col h-full min-h-[200px]">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                      <h2 className="font-headline text-5xl text-on-surface mb-2">Hello, {username}</h2>
                      <p className="text-secondary font-bold tracking-wide">Week {weeks}, Day {days} of your journey</p>
                    </div>
                    <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2">
                      <Heart className="text-tertiary" size={16} fill="currentColor" />
                      <span className="text-sm font-bold text-on-surface-variant">{daysRemaining} days remaining</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-8">
                    <div className="flex justify-between items-end mb-4">
                      <div className="space-y-1">
                        <p className="text-sm text-on-surface-variant font-bold">Trimester Progress</p>
                        <p className="font-headline text-3xl text-primary">{Math.round(progressPercent)}% Complete</p>
                      </div>
                      <span className="text-xs font-bold bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full uppercase tracking-tighter">
                        {weeks < 14 ? "First" : weeks < 28 ? "Second" : "Third"} Trimester
                      </span>
                    </div>
                    {/* Progress Veil */}
                    <div className="h-6 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full shadow-lg shadow-primary/20 transition-all duration-1000"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Baby Size Card */}
              <div className="lg:col-span-4 bg-tertiary-container/30 backdrop-blur-md rounded-[24px] p-8 flex flex-col justify-center items-center text-center border-2 border-white/50">
                <p className="text-tertiary font-bold tracking-widest uppercase text-xs mb-6">BABY SIZE</p>
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner text-6xl">
                  🍋
                </div>
                <h3 className="font-headline text-3xl text-on-tertiary-container mb-2">{babySize}</h3>
                <p className="text-on-tertiary-container/60 text-sm italic font-bold">Tiny but mighty growth phase</p>
              </div>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="font-headline text-3xl text-on-surface ml-2">Quick Support</h4>
            <div className="grid grid-cols-2 gap-4">
              <a href={familyData?.midwifePhone ? `tel:${familyData.midwifePhone}` : "#"} className="block aspect-square bg-surface-container-low hover:bg-primary-container/20 transition-all rounded-[24px] p-6 flex flex-col justify-between items-start group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <PhoneCall className="text-primary" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-on-surface text-lg">Midwife Dial</p>
                  <p className="text-xs font-bold text-on-surface-variant">Direct clinical line</p>
                </div>
              </a>
              <a href={familyData?.maternityUnitRoute || "#"} target="_blank" rel="noreferrer" className="block aspect-square bg-surface-container-low hover:bg-secondary-container/30 transition-all rounded-[24px] p-6 flex flex-col justify-between items-start group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <MapPin className="text-secondary" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-on-surface text-lg">Maternity Unit</p>
                  <p className="text-xs font-bold text-on-surface-variant">Find quickest route</p>
                </div>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h4 className="font-headline text-3xl text-on-surface">Upcoming</h4>
              <button className="text-primary font-bold text-sm hover:underline">View Calendar</button>
            </div>
            <div className="space-y-3">
              {eventsLoading ? (
                <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm animate-pulse flex items-center gap-6">
                   <div className="w-14 h-14 bg-surface-container-low rounded-2xl"></div>
                   <div className="flex-1 space-y-2">
                     <div className="h-4 bg-surface-container-low rounded w-1/3"></div>
                     <div className="h-3 bg-surface-container-low rounded w-1/2"></div>
                   </div>
                </div>
              ) : events.length === 0 ? (
                 <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-on-surface-variant font-bold text-sm">No upcoming events scheduled.</p>
                 </div>
              ) : (
                events.slice(0, 3).map((event, idx) => {
                  const isSoon = event.date.getTime() - new Date().getTime() < 48 * 60 * 60 * 1000;
                  
                  return (
                    <div key={event.id} className="bg-surface-container-lowest p-6 rounded-[24px] shadow-sm border border-transparent hover:border-outline-variant/15 transition-all flex items-center gap-6 cursor-pointer">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${idx === 0 ? 'bg-primary-container/30 text-primary' : 'bg-surface-container-low text-on-surface-variant'}`}>
                        <Calendar size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-lg text-on-surface">{event.title}</h5>
                          {isSoon && (
                            <span className="px-2 py-0.5 bg-error/10 text-error text-[10px] font-extrabold rounded uppercase tracking-wider">Soon</span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-on-surface-variant">
                          {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, {event.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-surface-container-low rounded-full">
                        <ChevronRight className="text-on-surface-variant" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <InsightWidget />

        {!isPostpartum && (
          <div className="flex justify-center pb-12">
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              {/* @ts-expect-error asChild is a valid Radix prop but TS fails to resolve it */}
              <DialogTrigger asChild>
                <button className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors px-6 py-4 rounded-full flex items-center gap-3 shadow-lg shadow-secondary/10 animate-pulse-slow">
                  <PartyPopper className="text-secondary" />
                  <span className="font-bold tracking-tight text-lg">The Baby is Here!</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-[32px] bg-surface-container-lowest border-none p-8">
                <DialogHeader>
                  <DialogTitle className="font-headline text-4xl text-on-surface flex items-center gap-3">
                    Congratulations! <PartyPopper className="text-amber-500" size={32} />
                  </DialogTitle>
                  <DialogDescription className="text-on-surface-variant font-bold mt-2">
                    Ready to switch ParentHq into Postpartum Mode? This updates your dashboard to track your newborn's age.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Actual Birth Date</label>
                  <Input
                    type="date"
                    className="border-outline-variant bg-surface-container-lowest rounded-2xl focus-visible:ring-primary h-14 px-5 text-on-surface font-bold"
                    value={actualBirthDate}
                    onChange={(e) => setActualBirthDate(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <button 
                    onClick={handleTransition} 
                    disabled={!actualBirthDate} 
                    className="w-full rounded-full bg-primary hover:bg-primary/90 text-on-primary font-bold h-14 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                  >
                    Transition to Postpartum
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
}
