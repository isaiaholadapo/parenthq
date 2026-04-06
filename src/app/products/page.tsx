"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Package, ExternalLink } from "lucide-react";

export default function PipelineFrontendPage() {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) {
      setLoading(false);
      return;
    }

    const pipeRef = collection(db, "pipeline");
    const q = query(pipeRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort logic
      setPipeline(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 lg:py-12 px-4 md:px-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-slate-900 font-semibold tracking-tight text-3xl md:text-4xl">
          Gear Pipeline
        </h1>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl">
          A synchronized view of essential products, brands, and nursery gear.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 h-32 animate-pulse">
                <div className="h-6 w-2/3 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
             </div>
           ))}
        </div>
      ) : pipeline.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-16 text-center shadow-inner">
           <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Package className="text-slate-300" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Gear Tracked</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Head over to the Admin Hub to start shortlisting products!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipeline.map((p) => (
            <div 
              key={p.id}
              className="bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-900 font-semibold tracking-tight text-xl leading-tight pr-4">
                  {p.name}
                </h3>
                {p.url && (
                  <a 
                    href={p.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors flex-shrink-0" 
                    title="Visit External Link"
                  >
                    <ExternalLink size={16} strokeWidth={2.5} />
                  </a>
                )}
              </div>
              
              {p.brand && <p className="text-slate-600 font-medium mb-6 flex-grow">{p.brand}</p>}

              <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                {p.priority === "Must Have" ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-[4px] bg-rose-100 text-rose-700">
                    Must Have
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-[4px] bg-slate-100 text-slate-600">
                    Nice to Have
                  </span>
                )}
                
                {p.status === "Bought" ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-[4px] bg-emerald-100 text-emerald-700">
                    Bought
                  </span>
                ) : p.status === "Shortlisted" ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-[4px] bg-indigo-100 text-indigo-700">
                    Shortlisted
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-[4px] bg-amber-100 text-amber-700">
                    Researching
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
