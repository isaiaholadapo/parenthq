"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFamilyData } from "@/hooks/useFamilyData";
import { getPregnancyStats, getBabySize, calculateBabyAge } from "@/lib/pregnancy";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Phone, MapPin, Calendar, LogOut, PartyPopper } from "lucide-react";

export default function HomePage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const { familyData, loading: familyLoading, transitionToPostpartum } = useFamilyData();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [actualBirthDate, setActualBirthDate] = useState("");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Prevent flash of content before redirecting
  if (!user) {
    return null;
  }

  const dueDateParam = familyData?.dueDate ? familyData.dueDate.toISOString() : "2026-12-05";
  const { weeks, days, daysRemaining, progressPercent } = getPregnancyStats(dueDateParam);
  const babySize = getBabySize(weeks);

  const username = user.email?.split("@")[0] || "User";

  const isPostpartum = familyData?.mode === "postpartum";
  // The decode logic in useFamilyData can return simple Dates, if it exists format it properly for the age function
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
    <div className="min-h-screen bg-slate-50 p-4 pb-32 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-5xl mx-auto md:px-8 flex flex-col gap-6 pt-4">
        
        {/* Top App Bar */}
        <div className="flex justify-between items-center px-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">ParentHq</h1>
          <button onClick={logOut} className="text-slate-400 hover:text-slate-800 transition" aria-label="Sign out">
            <LogOut size={20} />
          </button>
        </div>

        {/* Header / HUD Card */}
        {isPostpartum ? (
          <Card className="bg-emerald-600 shadow-md rounded-3xl overflow-hidden border-none text-white relative">
            <div className="absolute -top-4 -right-8 opacity-10 pointer-events-none">
              <PartyPopper size={160} />
            </div>
            <CardContent className="p-6 flex flex-col gap-6 relative z-10">
              <div>
                <p className="text-emerald-100 font-medium text-sm">Hello, {username}</p>
                <div className="flex flex-col mt-2 gap-1 mb-2">
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-sm leading-tight">Postpartum</h2>
                </div>
                <p className="text-emerald-50 font-medium">You did it! Welcome to parenthood.</p>
              </div>

              <div className="bg-emerald-700/50 p-5 rounded-2xl border border-emerald-500/50 shadow-inner">
                 <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest mb-1.5">Baby Age</p>
                 <p className="font-extrabold text-white text-3xl">{birthDateParam ? calculateBabyAge(birthDateParam) : "Born!"}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-sm border border-slate-200/60 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex flex-col gap-6">
              <div>
                <p className="text-slate-500 font-medium text-sm">Hello, {username}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter shadow-sm">{weeks}<span className="text-2xl text-slate-400 font-bold ml-1">w + {days}d</span></h2>
                </div>
                <p className="text-indigo-600 font-semibold mt-2 text-sm">❤️ {daysRemaining} days remaining</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600">Trimester Progress</span>
                  <span className="text-sm font-black text-indigo-600">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-3 bg-slate-100 rounded-full overflow-hidden" indicatorClassName="bg-indigo-600" />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 mt-2">
                 <div className="text-3xl drop-shadow-sm">🍋</div>
                 <div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Baby Size</p>
                   <p className="font-semibold text-slate-800 text-sm leading-tight">{babySize}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Row */}
        <div className="grid grid-cols-2 gap-4">
          <a title="Call Midwife" href={familyData?.midwifePhone ? `tel:${familyData.midwifePhone}` : "#"} className="block group">
            <Card className="bg-white shadow-sm border border-slate-200/60 rounded-2xl cursor-pointer group-hover:-translate-y-0.5 group-hover:shadow-md transition-all h-full">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Phone size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Midwife Dial</p>
                </div>
              </CardContent>
            </Card>
          </a>
          
          <a title="Maternity Route" href={familyData?.maternityUnitRoute || "#"} target={familyData?.maternityUnitRoute ? "_blank" : undefined} rel="noopener noreferrer" className="block group">
            <Card className="bg-white shadow-sm border border-slate-200/60 rounded-2xl cursor-pointer group-hover:-translate-y-0.5 group-hover:shadow-md transition-all h-full">
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                 <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <MapPin size={22} strokeWidth={2.5} />
                </div>
                 <div>
                  <p className="font-semibold text-slate-800 text-sm">Maternity Unit</p>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Reminders Widget */}
        <div className="mt-2">
          <h3 className="font-semibold text-slate-900 text-lg mb-3 px-2 tracking-tight">Upcoming Events</h3>
          <Card className="bg-white shadow-sm border border-slate-200/60 rounded-2xl overflow-hidden">
            <CardContent className="p-0 flex flex-col">
               <div className="p-4 border-b border-slate-50 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                 <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
                   <Calendar size={18} strokeWidth={2.5} />
                 </div>
                 <div className="flex-1">
                   <p className="font-semibold text-slate-900 text-sm">20-Week Scan</p>
                   <p className="text-slate-500 text-xs mt-0.5 font-medium">Tomorrow, 10:00 AM</p>
                 </div>
                 <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-none border-none font-bold">Soon</Badge>
               </div>
               
               <div className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                 <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                   <Calendar size={18} strokeWidth={2.5} />
                 </div>
                 <div className="flex-1">
                   <p className="font-semibold text-slate-900 text-sm">Glucose Test</p>
                   <p className="text-slate-500 text-xs mt-0.5 font-medium">Aug 15, 08:30 AM</p>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Postpartum Toggle Button */}
        {!isPostpartum && (
          <div className="mt-6 flex justify-center pb-4">
             <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              {/* @ts-expect-error asChild is a valid Radix prop but TS fails to resolve it */}
              <DialogTrigger asChild>
                <Button className="rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-bold border border-emerald-200 transition-colors px-6">
                  <PartyPopper size={16} className="mr-2" />
                  The Baby is Here!
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-3xl bg-slate-50">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                    Congratulations! <PartyPopper className="text-amber-500" />
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 mb-2 font-medium text-sm">
                    Ready to switch ParentHq into Postpartum Mode? This updates your dashboard to track your newborn's age.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 py-4">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Actual Birth Date</label>
                   <Input
                    type="date"
                    className="border-slate-200 bg-white rounded-xl focus-visible:ring-emerald-600 h-12 px-5 text-slate-800 font-bold"
                    value={actualBirthDate}
                    onChange={(e) => setActualBirthDate(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleTransition} 
                    disabled={!actualBirthDate} 
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold h-12 text-sm shadow-sm transition-transform active:scale-95"
                  >
                    Transition to Postpartum
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

      </div>
    </div>
  );
}
