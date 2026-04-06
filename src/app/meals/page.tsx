"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Utensils } from "lucide-react";

export default function MealsFrontendPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) {
      setLoading(false);
      return;
    }

    const mealsRef = collection(db, "meals");
    const q = query(mealsRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      fetched.sort((a, b) => a.name.localeCompare(b.name));
      setMeals(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12 px-4 md:px-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-slate-900 font-semibold tracking-tight text-3xl md:text-4xl">
          Safe Meals
        </h1>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl">
          Curated pregnancy-safe recipes and nutritional guidelines.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 h-48 animate-pulse">
              <div className="h-6 w-2/3 bg-slate-200 rounded mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
                <div className="h-4 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded"></div>
                <div className="h-3 w-full bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-16 text-center shadow-inner">
           <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Utensils className="text-slate-300" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Meals Saved</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Head over to the Admin Hub to start building your recipe library!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((m) => (
            <div key={m.id} className="bg-white shadow-sm border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200 p-6 flex flex-col h-full">
              <div className="mb-4">
                <h3 className="text-slate-900 font-semibold tracking-tight text-xl mb-3 leading-tight">{m.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-md bg-slate-100 text-slate-500">
                    {m.category}
                  </span>
                  {m.focus && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-600">
                      {m.focus}
                    </span>
                  )}
                </div>
              </div>
              {m.notes && (
                <div className="mt-auto pt-4 border-t border-slate-100 flex-grow">
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{m.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
