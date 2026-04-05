import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Family } from "@/types";

export function useFamilyData() {
  const [familyData, setFamilyData] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    
    if (!familyId) {
      setError("Family ID is missing in environment variables.");
      setLoading(false);
      return;
    }

    const familyRef = doc(db, "families", familyId);
    
    const unsubscribe = onSnapshot(
      familyRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Firestore dates usually come back as Timestamps, decode to native Date
          // Provide a fallback just in case data structure differs slightly
          const dueDate = data.dueDate?.toDate 
            ? data.dueDate.toDate() 
            : data.dueDate ? new Date(data.dueDate) : new Date();
          
          setFamilyData({
            id: docSnap.id,
            ...data,
            dueDate,
          } as Family);
        } else {
          setFamilyData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching family data:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);
  const transitionToPostpartum = async (actualBirthDate: Date) => {
    const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;
    if (!familyId) return;
    const familyRef = doc(db, "families", familyId);
    await updateDoc(familyRef, {
      mode: "postpartum",
      actualBirthDate: actualBirthDate,
    });
  };

  return { familyData, loading, error, transitionToPostpartum };
}
