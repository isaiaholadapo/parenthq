import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, "families", familyId, "tasks");

    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const dbTasks: Task[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          category: data.category || "todo",
          isCompleted: data.isCompleted || false,
          priority: data.priority || "normal",
          addedBy: data.addedBy || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : null,
        } as Task;
      });

      // Sort client-side
      // 1. isCompleted: false > isCompleted: true
      // 2. createdAt: desc
      dbTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setTasks(dbTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addTask = async (title: string, category: "go-bag" | "todo" | "admin", userId: string) => {
    if (!familyId) return;
    const tasksRef = collection(db, "families", familyId, "tasks");
    await addDoc(tasksRef, {
      title,
      category,
      isCompleted: false,
      priority: "normal",
      addedBy: userId,
      createdAt: serverTimestamp(),
      completedAt: null,
    });
  };

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    if (!familyId) return;
    const tDoc = doc(db, "families", familyId, "tasks", taskId);
    await updateDoc(tDoc, { 
      isCompleted,
      completedAt: isCompleted ? serverTimestamp() : null
    });
  };

  const deleteTask = async (taskId: string) => {
    if (!familyId) return;
    const tDoc = doc(db, "families", familyId, "tasks", taskId);
    await deleteDoc(tDoc);
  };

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
