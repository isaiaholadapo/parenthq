import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface MealItem {
  id: string;
  name: string;
  category: "Strictly Avoid" | "Safe Groceries" | "Recipes";
  notes: string;
  addedBy: string;
  createdAt: Date;
}

export function useMeals() {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const foodsRef = collection(db, "families", familyId, "foods");

    const unsubscribe = onSnapshot(foodsRef, (snapshot) => {
      const dbMeals: MealItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "",
          category: data.category || "Safe Groceries",
          notes: data.notes || "",
          addedBy: data.addedBy || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as MealItem;
      });

      // Sort chronologically (newest first)
      dbMeals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setMeals(dbMeals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addFood = async (name: string, category: "Strictly Avoid" | "Safe Groceries" | "Recipes", notes: string, userId: string) => {
    if (!familyId) return;
    const foodsRef = collection(db, "families", familyId, "foods");
    await addDoc(foodsRef, {
      name,
      category,
      notes,
      addedBy: userId,
      createdAt: serverTimestamp(),
    });
  };

  const deleteFood = async (foodId: string) => {
    if (!familyId) return;
    const fDoc = doc(db, "families", familyId, "foods", foodId);
    await deleteDoc(fDoc);
  };

  return { meals, loading, addFood, deleteFood };
}
