import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NameIdea } from "@/types";

export interface NameIdeaWithMatch extends NameIdea {
  isMatch: boolean;
}

export function useNames() {
  const [names, setNames] = useState<NameIdeaWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const namesRef = collection(db, "families", familyId, "names");

    const unsubscribe = onSnapshot(namesRef, (snapshot) => {
      const dbNames: NameIdeaWithMatch[] = snapshot.docs.map((d) => {
        const data = d.data();
        const votes = data.votes || {};
        
        // Match condition: Exactly 2 upvotes (since it's a 2 player app)
        const upvotes = Object.values(votes).filter(v => v === 1).length;
        const isMatch = upvotes >= 2;

        return {
          id: d.id,
          name: data.name || "",
          category: data.category || "General",
          votes,
          isMatch,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as NameIdeaWithMatch;
      });

      // Sort by creation date descending
      dbNames.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setNames(dbNames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addName = async (name: string, category: "Yoruba" | "General") => {
    if (!familyId) return;
    const namesRef = collection(db, "families", familyId, "names");
    await addDoc(namesRef, {
      name,
      category,
      votes: {},
      createdAt: serverTimestamp(),
    });
  };

  const castVote = async (nameId: string, userId: string, voteValue: number) => {
    if (!familyId) return;
    const nDoc = doc(db, "families", familyId, "names", nameId);
    
    // updateDoc with dot notation updates a nested map field atomically
    await updateDoc(nDoc, {
      [`votes.${userId}`]: voteValue
    });
  };

  const deleteName = async (nameId: string) => {
    if (!familyId) return;
    const nDoc = doc(db, "families", familyId, "names", nameId);
    await deleteDoc(nDoc);
  };

  return { names, loading, addName, castVote, deleteName };
}
