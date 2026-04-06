"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBudget } from "@/hooks/useBudget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, PoundSterling } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetPage() {
  const { user } = useAuth();
  const { budgetItems, loading, totalAllocated, totalSpent, addBudgetItem, updateSpent, deleteBudgetItem } = useBudget();

  const [newTitle, setNewTitle] = useState("");
  const [newAllocated, setNewAllocated] = useState("");
  const [spentDrafts, setSpentDrafts] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    if (!newTitle.trim() || !newAllocated || !user) return;
    const amount = parseFloat(newAllocated);
    if (isNaN(amount) || amount < 0) return;

    await addBudgetItem(newTitle.trim(), amount, user.uid);
    setNewTitle("");
    setNewAllocated("");
  };

  const handleUpdateSpent = async (id: string, currentVal: number) => {
    const draft = spentDrafts[id];
    if (draft === undefined) return;

    const amount = parseFloat(draft);
    if (!isNaN(amount) && amount >= 0 && amount !== currentVal) {
      await updateSpent(id, amount);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
        <div className="w-full max-w-md flex flex-col pt-6 px-4">
          <Skeleton className="h-8 w-48 mb-4 bg-slate-200" />
          <Skeleton className="h-32 w-full rounded-3xl bg-slate-200 mb-4" />
          <Skeleton className="h-32 w-full rounded-3xl bg-slate-200 mb-4" />
          <div className="flex flex-col gap-3 pt-4 pb-12">
            <Skeleton className="h-32 w-full rounded-2xl bg-slate-200" />
            <Skeleton className="h-32 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  const percentSpent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  const isOverBudget = totalSpent > totalAllocated;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-5xl mx-auto md:px-8 flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-4">Nursery Budget</h1>
          
          <Card className={cn(
            "text-white p-5 rounded-3xl shadow-md border-none mb-4 w-full transition-colors duration-300",
            isOverBudget ? "bg-red-500" : "bg-indigo-600"
          )}>
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">{isOverBudget ? "Over Budget By" : "Total Remaining"}</span>
              <span className="text-4xl font-extrabold tracking-tight">
                £{Math.abs(totalAllocated - totalSpent).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="w-full flex flex-col gap-2">
              <div className="flex justify-between items-end text-sm">
                <span className="text-white font-medium">Spent: £{totalSpent.toLocaleString('en-GB')}</span>
                <span className="text-white/70 font-medium text-xs">/ £{totalAllocated.toLocaleString('en-GB')}</span>
              </div>
              <Progress 
                value={Math.min(percentSpent, 100)} 
                className="h-2.5 bg-black/20" 
                indicatorClassName={isOverBudget ? "bg-red-900" : "bg-white"} 
              />
            </div>
          </Card>

          {/* Input Form */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-3">
             <Input
                placeholder="Item needed (e.g. Bugaboo Fox...)"
                className="border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-10 px-5 font-bold text-slate-800"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">£</span>
                <Input
                  type="number"
                  placeholder="Allocated"
                  className="border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-10 pl-8 pr-4 font-bold text-slate-800"
                  value={newAllocated}
                  onChange={(e) => setNewAllocated(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                />
              </div>
              <Button 
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newAllocated}
                className="flex-1 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold h-10 text-xs tracking-wide uppercase transition-transform active:scale-95 whitespace-nowrap"
              >
                Allocate
              </Button>
            </div>
          </div>
        </div>

        {/* Ledger List */}
        <div className="px-4 pt-4 pb-12">
          {budgetItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <p className="text-slate-400 font-medium text-sm">No budget items allocated yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetItems.map((item) => {
                const draft = spentDrafts[item.id] !== undefined ? spentDrafts[item.id] : item.spent.toString();
                const overItemBudget = parseFloat(draft) > item.allocated;

                return (
                  <Card key={item.id} className={cn(
                    "p-4 rounded-2xl flex flex-col gap-3 shadow-sm transition-all duration-300",
                    overItemBudget ? "border-red-200 bg-red-50/50" : "border-transparent bg-white hover:shadow-md"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shadow-inner">
                           <PoundSterling size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-slate-800 leading-tight">{item.title}</span>
                          <span className="text-xs font-bold tracking-wide mt-0.5 text-slate-400">Allocated: £{item.allocated.toLocaleString('en-GB')}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteBudgetItem(item.id)} className="text-slate-300 hover:text-red-500 p-2 -mr-2 -mt-2 rounded-full hover:bg-slate-50 transition-colors pointer"><Trash2 size={18} /></button>
                    </div>

                    <div className="flex items-center gap-3">
                       <span className="text-sm font-semibold text-slate-500">Spent:</span>
                       <div className="relative flex-1 min-w-0">
                          <span className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 justify-center font-bold text-sm",
                            overItemBudget ? "text-red-400" : "text-slate-400"
                          )}>£</span>
                          <Input
                            type="number"
                            className={cn(
                              "border-slate-100 bg-slate-50 rounded-full focus-visible:ring-indigo-600 h-9 pl-7 pr-3 font-bold text-sm transition-colors",
                              overItemBudget ? "text-red-600 bg-white focus-visible:ring-red-400 border-red-200" : "text-slate-800"
                            )}
                            value={draft}
                            onChange={(e) => setSpentDrafts({ ...spentDrafts, [item.id]: e.target.value })}
                            onBlur={() => handleUpdateSpent(item.id, item.spent)}
                          />
                       </div>
                       <Button 
                         variant="secondary"
                         size="sm"
                         onClick={() => handleUpdateSpent(item.id, item.spent)}
                         className="rounded-full h-9 px-4 font-bold bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                         disabled={draft === item.spent.toString() || isNaN(parseFloat(draft))}
                       >
                         Save
                       </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
