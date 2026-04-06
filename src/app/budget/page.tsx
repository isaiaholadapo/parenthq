"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Wallet, PieChart, ShoppingBag } from "lucide-react";

export default function BudgetFrontendPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) {
      setLoading(false);
      return;
    }

    const budgetRef = collection(db, "budget");
    const q = query(budgetRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort purchased first, then date
      fetched.sort((a, b) => {
        if (a.status !== b.status) return a.status === "Purchased" ? -1 : 1;
        return 0;
      });
      setItems(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPlanned = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  const totalSpent = items.reduce((sum, item) => item.status === "Purchased" ? sum + (Number(item.cost) || 0) : sum, 0);

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12 px-4 md:px-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-slate-900 font-semibold tracking-tight text-3xl md:text-4xl">
          Nursery Budget
        </h1>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl">
          Track expenses dynamically to prepare for your expanding family.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
            <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl w-full"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top Level Metric Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-8 flex items-center justify-between">
               <div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Total Planned</p>
                  <p className="text-4xl font-headline text-slate-900">${totalPlanned.toFixed(2)}</p>
               </div>
               <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                  <PieChart className="text-indigo-600" size={32} strokeWidth={1} />
               </div>
            </div>
            <div className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-8 flex items-center justify-between">
               <div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Total Spent</p>
                  <p className="text-4xl font-headline text-emerald-600">${totalSpent.toFixed(2)}</p>
               </div>
               <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Wallet className="text-emerald-600" size={32} strokeWidth={1} />
               </div>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8">
            <h2 className="text-slate-900 font-semibold tracking-tight text-xl mb-6 border-b border-slate-100 pb-4">
              Detailed Transactions
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Your budget is completely clear.
              </div>
            ) : (
              <div className="flex flex-col">
                {items.map((i) => (
                  <div 
                    key={i.id}
                    className="flex justify-between items-center py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {i.status === "Purchased" ? (
                          <ShoppingBag className="text-emerald-600" size={20} />
                        ) : (
                          <Wallet className="text-amber-500" size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{i.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-semibold text-slate-500">{i.category}</p>
                          <span className="text-slate-300">•</span>
                          {i.status === "Purchased" ? (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-[4px] uppercase tracking-widest">
                              Purchased
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-[4px] uppercase tracking-widest">
                              Planned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <p className={`font-mono font-bold text-xl ${i.status === "Purchased" ? "text-emerald-600" : "text-slate-600"}`}>
                          ${Number(i.cost).toFixed(2)}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
