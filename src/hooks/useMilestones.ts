import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface MilestoneItem {
  id: string;
  title: string;
  date: Date;
  notes: string;
  imageUrl: string | null;
  addedBy: string;
  createdAt: Date;
}

export function useMilestones() {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const mRef = collection(db, "families", familyId, "milestones");

    const unsubscribe = onSnapshot(mRef, (snapshot) => {
      const dbItems: MilestoneItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          date: data.date?.toDate ? data.date.toDate() : new Date(),
          notes: data.notes || "",
          imageUrl: data.imageUrl || null,
          addedBy: data.addedBy || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as MilestoneItem;
      });

      // Sort by timeline date descending
      dbItems.sort((a, b) => b.date.getTime() - a.date.getTime());

      setMilestones(dbItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addMilestone = async (title: string, date: Date, notes: string, imageFile: File | null, userId: string) => {
    if (!familyId) return;

    let imageUrl = null;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop() || "jpeg";
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
      const storageRef = ref(storage, `families/${familyId}/milestones/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const mRef = collection(db, "families", familyId, "milestones");
    await addDoc(mRef, {
      title,
      date,
      notes,
      imageUrl,
      addedBy: userId,
      createdAt: serverTimestamp(),
    });
  };

  const deleteMilestone = async (id: string) => {
    if (!familyId) return;
    const mDoc = doc(db, "families", familyId, "milestones", id);
    await deleteDoc(mDoc);
  };

  return { milestones, loading, addMilestone, deleteMilestone };
}
