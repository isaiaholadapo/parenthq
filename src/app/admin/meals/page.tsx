"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminMealsPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) return;

    const mealsRef = collection(db, "meals");
    const q = query(mealsRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by newest added locally if no created field, or simply order by name
      fetched.sort((a, b) => a.name.localeCompare(b.name));
      setMeals(fetched);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      if (editingId) {
        const mRef = doc(db, "meals", editingId);
        await updateDoc(mRef, {
          name,
          category,
          focus,
          notes,
          updatedAt: new Date()
        });
        setSuccessMsg("Meal updated successfully!");
      } else {
        await addDoc(collection(db, "meals"), {
          name,
          category,
          focus,
          notes,
          createdAt: new Date(),
          familyId: process.env.NEXT_PUBLIC_FAMILY_ID || "default_family"
        });
        setSuccessMsg("Meal added successfully!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error saving document:", error);
      alert("Failed to save meal: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setName(m.name);
    setCategory(m.category);
    setFocus(m.focus || "");
    setNotes(m.notes || "");
    setSuccessMsg("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    try {
      await deleteDoc(doc(db, "meals", id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete meal.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("");
    setFocus("");
    setNotes("");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-4 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8 sticky top-8">
          <h1 className="text-slate-900 font-semibold tracking-tight text-2xl mb-6">
            {editingId ? "Edit Safe Meal" : "Add Safe Meal"}
          </h1>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold">Meal Name</Label>
              <Input
                id="name"
                placeholder="e.g., Moi Moi or Spinach Stew"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 font-bold">Meal Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "")} required>
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select timeframe..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focus" className="text-slate-700 font-bold">Nutritional Focus</Label>
              <Input
                id="focus"
                placeholder="e.g., High Iron, Folic Acid"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-bold">Notes/Recipe</Label>
              <Textarea
                id="notes"
                placeholder="Recipe links or quick prep notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-slate-200 rounded-xl min-h-[100px] resize-none"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Meal" : "Save Meal"}
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
          <h2 className="text-slate-900 font-semibold tracking-tight text-xl mb-6 border-b border-slate-100 pb-4">
            Safe Meals Library
          </h2>

          {meals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No meals logged yet. Start cooking!
            </div>
          ) : (
            <div className="flex flex-col">
              {meals.map((m) => (
                <div 
                  key={m.id}
                  className="group flex justify-between items-start p-5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{m.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                        {m.category}
                      </span>
                      {m.focus && (
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          {m.focus}
                        </span>
                      )}
                    </div>
                    {m.notes && (
                      <p className="text-sm text-slate-500 mt-3 max-w-lg leading-relaxed whitespace-pre-wrap">{m.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(m)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m.id)}
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
