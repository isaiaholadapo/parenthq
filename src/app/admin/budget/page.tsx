"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminBudgetPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [cost, setCost] = useState<number | "">("");
  const [status, setStatus] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) return;

    const budgetRef = collection(db, "budget");
    const q = query(budgetRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      fetched.sort((a, b) => {
        // Sort by Purchased status first, then by createdAt date if possible
        if (a.status !== b.status) return a.status === "Purchased" ? 1 : -1;
        return 0; // fallback
      });
      setItems(fetched);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !status) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const payload = {
        name,
        category,
        cost: cost === "" ? 0 : Number(cost),
        status,
        updatedAt: new Date()
      };

      if (editingId) {
        const iRef = doc(db, "budget", editingId);
        await updateDoc(iRef, payload);
        setSuccessMsg("Budget item updated!");
      } else {
        await addDoc(collection(db, "budget"), {
          ...payload,
          createdAt: new Date(),
          familyId: process.env.NEXT_PUBLIC_FAMILY_ID || "default_family"
        });
        setSuccessMsg("Budget item tracked successfully!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error saving document:", error);
      alert("Failed to save budget item: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (i: any) => {
    setEditingId(i.id);
    setName(i.name);
    setCategory(i.category);
    setCost(i.cost);
    setStatus(i.status);
    setSuccessMsg("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget entry?")) return;
    try {
      await deleteDoc(doc(db, "budget", id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete item.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("");
    setCost("");
    setStatus("");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-4 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8 sticky top-8">
          <h1 className="text-slate-900 font-semibold tracking-tight text-2xl mb-6">
            {editingId ? "Edit Expense" : "Track Expense"}
          </h1>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Crib, Changing Table"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 font-bold">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "")} required>
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-slate-700 font-bold">Estimated Cost</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : "")}
                required
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700 font-bold">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val || "")} required>
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Is it bought?" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Purchased">Purchased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Item" : "Track Item"}
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
              Nursery Budget
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Your budget is clear!
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((i) => (
                <div 
                  key={i.id}
                  className="group flex justify-between items-center p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                      {i.name}
                      {i.status === "Purchased" ? (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-widest">
                          Purchased
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-widest">
                          Planned
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                       <p className="font-mono font-bold text-indigo-600 text-lg">${Number(i.cost).toFixed(2)}</p>
                       <p className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{i.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(i)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(i.id)}
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
