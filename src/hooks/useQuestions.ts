import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DoctorQuestion } from "@/types";

export function useQuestions() {
  const [questions, setQuestions] = useState<DoctorQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const questionsRef = collection(db, "families", familyId, "doctorQuestions");

    const unsubscribe = onSnapshot(questionsRef, (snapshot) => {
      const qData: DoctorQuestion[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          question: data.question || "",
          answer: data.answer || "",
          isResolved: data.isResolved || false,
          priority: data.priority || "normal",
          addedBy: data.addedBy || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as DoctorQuestion;
      });

      // Sort client-side
      // 1. isResolved: false > isResolved: true
      // 2. priority: "high" > priority: "normal"
      // 3. createdAt: desc
      qData.sort((a, b) => {
        if (a.isResolved !== b.isResolved) {
          return a.isResolved ? 1 : -1;
        }
        if (a.priority !== b.priority) {
          if (a.priority === "high") return -1;
          if (b.priority === "high") return 1;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      setQuestions(qData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addQuestion = async (question: string, priority: "high" | "normal", userId: string) => {
    if (!familyId) return;
    const questionsRef = collection(db, "families", familyId, "doctorQuestions");
    await addDoc(questionsRef, {
      question,
      answer: "",
      isResolved: false,
      priority,
      addedBy: userId,
      createdAt: serverTimestamp(),
    });
  };

  const updateAnswer = async (questionId: string, answer: string) => {
    if (!familyId) return;
    const qDoc = doc(db, "families", familyId, "doctorQuestions", questionId);
    await updateDoc(qDoc, { answer });
  };

  const toggleResolved = async (questionId: string, isResolved: boolean) => {
    if (!familyId) return;
    const qDoc = doc(db, "families", familyId, "doctorQuestions", questionId);
    await updateDoc(qDoc, { isResolved });
  };

  return { questions, loading, addQuestion, updateAnswer, toggleResolved };
}
