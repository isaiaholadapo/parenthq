"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPipelinePage() {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) return;

    const pipeRef = collection(db, "pipeline");
    const q = query(pipeRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort logic
      setPipeline(fetched);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priority || !status) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const payload = {
        name,
        brand,
        url,
        priority,
        status,
        updatedAt: new Date()
      };

      if (editingId) {
        const iRef = doc(db, "pipeline", editingId);
        await updateDoc(iRef, payload);
        setSuccessMsg("Product updated!");
      } else {
        await addDoc(collection(db, "pipeline"), {
          ...payload,
          createdAt: new Date(),
          familyId: process.env.NEXT_PUBLIC_FAMILY_ID || "default_family"
        });
        setSuccessMsg("Product queued strictly!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error saving document:", error);
      alert("Failed to queue product: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setName(p.name);
    setBrand(p.brand || "");
    setUrl(p.url || "");
    setPriority(p.priority);
    setStatus(p.status);
    setSuccessMsg("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to drop this gear from the pipeline?")) return;
    try {
      await deleteDoc(doc(db, "pipeline", id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete product.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setBrand("");
    setUrl("");
    setPriority("");
    setStatus("");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8 sticky top-8">
          <h1 className="text-slate-900 font-semibold tracking-tight text-2xl mb-6">
            {editingId ? "Edit Product" : "Queue Product"}
          </h1>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold">Product Name</Label>
              <Input
                id="name"
                placeholder="e.g., Doona Car Seat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-slate-700 font-bold">Brand</Label>
              <Input
                id="brand"
                placeholder="e.g., UPPAbaby"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url" className="text-slate-700 font-bold">URL / Link</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 border-slate-200 rounded-xl text-indigo-600 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-slate-700 font-bold">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val || "")} required>
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Is it essential?" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Must Have">Must Have</SelectItem>
                  <SelectItem value="Nice to Have">Nice to Have</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 font-bold">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val || "")} required>
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Current progress..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Researching">Researching</SelectItem>
                  <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="Bought">Bought</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Queueing..." : editingId ? "Update Product" : "Queue Product"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-8 h-12 font-bold transition-transform active:scale-95"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-8 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-slate-900 font-semibold tracking-tight text-xl">
              Gear Pipeline
            </h2>
          </div>

          {pipeline.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Pipeline is empty. Start researching!
            </div>
          ) : (
            <div className="flex flex-col">
              {pipeline.map((p) => (
                <div 
                  key={p.id}
                  className="group flex justify-between items-center p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      {p.name}
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors" title="Visit Product Page">
                          <ExternalLink size={16} strokeWidth={2.5} />
                        </a>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      {p.brand && <p className="text-sm font-bold text-slate-700">{p.brand}</p>}
                      <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{p.priority}</p>
                      
                      {/* Status Badge */}
                      {p.status === "Bought" ? (
                        <p className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-[4px]">
                          {p.status}
                        </p>
                      ) : p.status === "Shortlisted" ? (
                        <p className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-[4px]">
                          {p.status}
                        </p>
                      ) : (
                        <p className="text-[10px] uppercase tracking-widest font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-[4px]">
                          {p.status}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(p)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
