"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useMilestones } from "@/hooks/useMilestones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

export default function MilestonesPage() {
  const { user } = useAuth();
  const { milestones, loading, addMilestone, deleteMilestone } = useMilestones();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDate || !user) return;
    setIsUploading(true);

    try {
      const parsedDate = new Date(newDate);
      await addMilestone(newTitle.trim(), parsedDate, newNotes.trim(), imageFile, user.uid);
      setNewTitle("");
      setNewDate("");
      setNewNotes("");
      setImageFile(null);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <p className="text-slate-500 animate-pulse font-medium">Loading timeline...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md pt-6 pb-4 px-4 z-10 border-b border-slate-200 shadow-sm flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Timeline</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
             <DialogTrigger asChild>
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md">
                + New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl bg-slate-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-800">Log Milestone</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  placeholder="e.g. First Ultrasound!"
                  className="border-slate-200 bg-white rounded-xl focus-visible:ring-indigo-600 h-12 px-5 font-bold"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isUploading}
                />
                <Input
                  type="date"
                  className="border-slate-200 bg-white rounded-xl focus-visible:ring-indigo-600 h-12 px-5 text-slate-700 font-medium"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  disabled={isUploading}
                />
                <Textarea
                  placeholder="Journal notes... (Optional)"
                  className="border-slate-200 bg-white rounded-xl focus-visible:ring-indigo-600 min-h-24 p-4 text-sm resize-none"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  disabled={isUploading}
                />
                
                {/* Custom File Upload Styling */}
                <div className="relative border-2 border-dashed border-slate-200 bg-white rounded-xl h-20 flex items-center justify-center overflow-hidden hover:border-indigo-300 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                     {imageFile ? (
                       <span className="text-indigo-600 font-bold text-sm truncate max-w-[200px]">{imageFile.name}</span>
                     ) : (
                       <>
                         <ImageIcon size={24} className="text-slate-400 mb-1" />
                         <span className="text-slate-500 font-medium text-xs">Attach Photo (Optional)</span>
                       </>
                     )}
                  </div>
                </div>

              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreate} 
                  disabled={!newTitle.trim() || !newDate || isUploading} 
                  className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold h-12 text-sm flex items-center justify-center"
                >
                  {isUploading ? (
                    <><Loader2 className="animate-spin mr-2" size={18} /> Uploading...</>
                  ) : (
                    "Save to Timeline"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Timeline Feed */}
        <div className="px-4 pt-6 pb-12">
          {milestones.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm flex flex-col items-center">
              <Sparkles className="text-indigo-200 mb-3" size={32} />
              <p className="text-slate-500 font-bold text-base">Your journey awaits!</p>
              <p className="text-slate-400 font-medium text-xs mt-1">Log your first ultrasound or moment.</p>
            </div>
          ) : (
             <div className="flex flex-col gap-6 relative">
              {/* Vertical Timeline Divider */}
              <div className="absolute left-6 top-6 bottom-4 w-0.5 bg-slate-200 z-0 hidden" />
              
              {milestones.map((item) => (
                <Card 
                  key={item.id} 
                  className="rounded-3xl flex flex-col shadow-sm border-slate-200 bg-white overflow-hidden relative z-10"
                >
                  {item.imageUrl && (
                    <div className="w-full aspect-[4/3] bg-slate-100 relative">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                         src={item.imageUrl} 
                         alt={item.title}
                         className="object-cover w-full h-full"
                       />
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">
                          {format(item.date, "MMMM do, yyyy")}
                        </span>
                        <h2 className="font-extrabold text-xl text-slate-800 leading-tight">{item.title}</h2>
                      </div>
                      <button onClick={() => deleteMilestone(item.id)} className="text-slate-300 hover:text-red-500 p-2 -mt-2 -mr-2 rounded-full hover:bg-slate-50 flex-shrink-0 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    {item.notes && (
                      <p className="text-slate-600 leading-relaxed font-medium mt-1 whitespace-pre-wrap text-sm border-l-2 border-slate-100 pl-3">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
