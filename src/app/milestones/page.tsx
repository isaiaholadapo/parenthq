"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Image as ImageIcon } from "lucide-react";

export default function MilestonesFrontendPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) {
      setLoading(false);
      return;
    }

    const milestonesRef = collection(db, "milestones");
    const q = query(milestonesRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(),
        });
      });

      // Sort by newest first
      fetched.sort((a, b) => b.date.getTime() - a.date.getTime());
      setMilestones(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12 px-4 md:px-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-slate-900 font-semibold tracking-tight text-3xl md:text-4xl">
          The Journey
        </h1>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl">
          A visual timeline of your pregnancy milestones, updates, and memories.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white shadow-sm border border-slate-200/60 rounded-2xl overflow-hidden animate-pulse">
              <div className="w-full h-48 md:h-64 bg-slate-200"></div>
              <div className="p-6 space-y-4">
                <div className="h-3 w-1/3 bg-slate-200 rounded"></div>
                <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : milestones.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-16 text-center shadow-inner">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ImageIcon className="text-slate-300" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Milestones Yet</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Your timeline is empty. Head over to the Admin Hub to secure your first memory!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((m) => (
            <div 
              key={m.id} 
              className="bg-white shadow-sm border border-slate-200/60 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200 group"
            >
              {m.imageUrl ? (
                <div className="w-full h-48 md:h-64 relative overflow-hidden bg-slate-100">
                  <img 
                    src={m.imageUrl} 
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full h-48 md:h-64 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                  <ImageIcon className="text-slate-300 opacity-50" size={48} strokeWidth={1} />
                </div>
              )}
              
              <div className="p-6 flex flex-col h-full bg-white relative z-10">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                   {m.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric"})}
                </p>
                <h3 className="text-slate-900 font-semibold tracking-tight text-xl mb-3 leading-tight">
                  {m.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
