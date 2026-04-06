"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Real-time listener
  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) return;

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
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateStr || !description) return;
    
    // Strict Validation: Restrict text-only events from breaking the frontend UI
    if (!editingId && !imageFile) {
      return alert("Please select an image for this milestone to display in the grid.");
    }

    setIsUploading(true);
    setSuccessMsg("");

    try {
      let finalImageUrl = existingImageUrl;

      // Ensure the entire upload executes and finalizes the remote token before the doc fires
      if (imageFile) {
        const uniqueName = `milestones/${Date.now()}_${imageFile.name}`;
        const imageRef = ref(storage, uniqueName);
        await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      if (editingId) {
        const mRef = doc(db, "milestones", editingId);
        await updateDoc(mRef, {
          title,
          date: new Date(dateStr),
          description,
          imageUrl: finalImageUrl,
          updatedAt: new Date(),
        });
        setSuccessMsg("Milestone updated successfully!");
      } else {
        await addDoc(collection(db, "milestones"), {
          title,
          date: new Date(dateStr),
          description,
          imageUrl: finalImageUrl,
          createdAt: new Date(),
          familyId: process.env.NEXT_PUBLIC_FAMILY_ID || "default_family"
        });
        setSuccessMsg("Milestone added successfully!");
      }

      resetForm();
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Error saving milestone: " + (error?.message || "Unknown error"));
    } finally {
      setIsUploading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setTitle(m.title);
    setDescription(m.description || "");
    setExistingImageUrl(m.imageUrl || "");
    
    // Parse to internal HTML YYYY-MM-DD
    const d = m.date;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    
    setDateStr(formattedDate);
    setImageFile(null);
    setSuccessMsg("");
  };

  const handleDelete = async (m: any) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return;
    try {
      // 1) Delete image file mathematically first
      if (m.imageUrl) {
        const imageRef = ref(storage, m.imageUrl);
        await deleteObject(imageRef).catch(e => console.warn("Image file not found or inaccessible.", e));
      }

      // 2) Delete db record
      await deleteDoc(doc(db, "milestones", m.id));
      if (editingId === m.id) resetForm();

    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete milestone.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDateStr("");
    setDescription("");
    setImageFile(null);
    setExistingImageUrl("");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Data Entry Form */}
        <div className="lg:col-span-4 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8 sticky top-8">
          <h1 className="text-slate-900 font-semibold tracking-tight text-2xl mb-6">
            {editingId ? "Edit Milestone" : "Add Milestone"}
          </h1>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-bold">Title</Label>
              <Input
                id="title"
                placeholder="e.g., First Kicks"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateStr" className="text-slate-700 font-bold">Date</Label>
              <Input
                id="dateStr"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl block w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-bold">Description</Label>
              <Textarea
                id="description"
                placeholder="How did it feel?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="border-slate-200 rounded-xl min-h-[100px] resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageFile" className="text-slate-700 font-bold">Upload Image</Label>
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="border-slate-200 rounded-xl file:mr-4 file:bg-slate-100 file:text-slate-700 file:border-0 hover:file:bg-slate-200 file:rounded-md file:px-3 file:py-1 cursor-pointer pt-2.5"
              />
              {existingImageUrl && !imageFile && (
                <p className="text-xs text-slate-500 italic mt-2">Current image will be safely preserved.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading Image..." : editingId ? "Update Milestone" : "Save Milestone"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isUploading}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-8 h-12 font-bold transition-transform active:scale-95"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Events List */}
        <div className="lg:col-span-8 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8">
          <h2 className="text-slate-900 font-semibold tracking-tight text-xl mb-6 border-b border-slate-100 pb-4">
            Milestones Tracker
          </h2>

          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No milestones found. Add your first memory!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {milestones.map((m) => (
                <div 
                  key={m.id}
                  className="group flex gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl items-start"
                >
                  {m.imageUrl ? (
                    <img 
                      src={m.imageUrl} 
                      alt={m.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-sm border border-slate-200" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <ImageIcon size={24} />
                    </div>
                  )}

                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{m.title}</h3>
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                       {m.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric"})}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-1">
                    <button 
                      onClick={() => handleEdit(m)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m)}
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
