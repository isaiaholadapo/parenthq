import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BudgetItem {
  id: string;
  title: string;
  allocated: number;
  spent: number;
  addedBy: string;
  createdAt: Date;
}

export function useBudget() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const budgetRef = collection(db, "families", familyId, "budgetItems");

    const unsubscribe = onSnapshot(budgetRef, (snapshot) => {
      const dbItems: BudgetItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          allocated: typeof data.allocated === "number" ? data.allocated : 0,
          spent: typeof data.spent === "number" ? data.spent : 0,
          addedBy: data.addedBy || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as BudgetItem;
      });

      // Sort by chronological order (newest first)
      dbItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setBudgetItems(dbItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addBudgetItem = async (title: string, allocated: number, userId: string) => {
    if (!familyId) return;
    const budgetRef = collection(db, "families", familyId, "budgetItems");
    await addDoc(budgetRef, {
      title,
      allocated,
      spent: 0,
      addedBy: userId,
      createdAt: serverTimestamp(),
    });
  };

  const updateSpent = async (budgetId: string, spent: number) => {
    if (!familyId) return;
    const bDoc = doc(db, "families", familyId, "budgetItems", budgetId);
    await updateDoc(bDoc, { spent });
  };

  const deleteBudgetItem = async (budgetId: string) => {
    if (!familyId) return;
    const bDoc = doc(db, "families", familyId, "budgetItems", budgetId);
    await deleteDoc(bDoc);
  };

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);

  return { budgetItems, loading, totalAllocated, totalSpent, addBudgetItem, updateSpent, deleteBudgetItem };
}
