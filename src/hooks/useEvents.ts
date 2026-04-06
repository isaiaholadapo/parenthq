import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DashboardEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  notes: string;
  familyId: string;
}

export function useEvents() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    
    if (!familyId) {
      setError("Family ID missing");
      setLoading(false);
      return;
    }

    const eventsRef = collection(db, "events");
    // We only query by familyId. We sort/filter in JS to avoid requiring 
    // the user to build a Firestore composite index during rapid prototyping.
    const q = query(
      eventsRef,
      where("familyId", "==", familyId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedEvents: DashboardEvent[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({
            id: doc.id,
            title: data.title,
            date: data.date?.toDate ? data.date.toDate() : new Date(),
            type: data.type,
            notes: data.notes,
            familyId: data.familyId
          });
        });
        
        // Filter out past events (keep events today)
        const now = new Date();
        now.setHours(0,0,0,0);
        
        // Return only the upcoming events sorted chronologically
        const upcomingEvents = fetchedEvents
          .filter(e => e.date >= now)
          .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        setEvents(upcomingEvents);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching events:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { events, loading, error };
}
