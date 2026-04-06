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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) return;

    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("familyId", "==", familyId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedEvents.push({
          id: docSnap.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(),
        });
      });

      // Sort by date inside memory
      fetchedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      setEvents(fetchedEvents);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate || !eventType) return;

    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      if (editingId) {
        const eventRef = doc(db, "events", editingId);
        await updateDoc(eventRef, {
          title,
          date: new Date(eventDate),
          type: eventType,
          notes,
          updatedAt: new Date(),
        });
        setSuccessMsg("Event updated successfully!");
      } else {
        await addDoc(collection(db, "events"), {
          title,
          date: new Date(eventDate),
          type: eventType,
          notes,
          createdAt: new Date(),
          familyId: process.env.NEXT_PUBLIC_FAMILY_ID || "default_family"
        });
        setSuccessMsg("Event added successfully!");
      }

      resetForm();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("Failed to save event. Check console.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleEdit = (event: any) => {
    setEditingId(event.id);
    setTitle(event.title);
    setEventType(event.type);
    setNotes(event.notes);

    // Format date for datetime-local (yyyy-MM-ddThh:mm)
    const d = event.date;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formattedDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    
    setEventDate(formattedDate);
    setSuccessMsg("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete event.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setEventDate("");
    setEventType("");
    setNotes("");
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Data Entry Form */}
        <div className="lg:col-span-4 bg-white shadow-sm border border-slate-200/60 rounded-2xl p-6 lg:p-8 sticky top-8">
          <h1 className="text-slate-900 font-semibold tracking-tight text-2xl mb-6">
            {editingId ? "Edit Event" : "Add New Event"}
          </h1>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-bold">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g., 20-Week Scan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-slate-700 font-bold">Date & Time</Label>
              <Input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="h-12 border-slate-200 rounded-xl block w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType" className="text-slate-700 font-bold">Event Type</Label>
              <Select value={eventType} onValueChange={(val) => setEventType(val || "")} required>
                <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select type of event..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Ultrasound Scan">Ultrasound Scan</SelectItem>
                  <SelectItem value="Midwife Appointment">Midwife Appointment</SelectItem>
                  <SelectItem value="Class">Class</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-bold">Location / Notes</Label>
              <Textarea
                id="notes"
                placeholder="Location address or things to remember..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-slate-200 rounded-xl min-h-[100px] resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 font-bold shadow-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : editingId ? "Update Event" : "Save Event"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
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
            Upcoming Events Manager
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No events found. Start by adding one on the left.
            </div>
          ) : (
            <div className="flex flex-col">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="group flex justify-between items-center p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-xl"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {event.type}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        {event.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric"})}, {event.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Event"
                    >
                      <Pencil size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Event"
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
