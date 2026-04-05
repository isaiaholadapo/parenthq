import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ProductStatus = "Voting" | "Approved" | "Purchased";

export interface ProductItem {
  id: string;
  title: string;
  url: string;
  price: number;
  status: ProductStatus;
  votes: Record<string, number>;
  addedBy: string;
  createdAt: Date;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = process.env.NEXT_PUBLIC_FAMILY_ID;

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const productsRef = collection(db, "families", familyId, "productVoting");

    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const dbProducts: ProductItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || "",
          url: data.url || "",
          price: typeof data.price === "number" ? data.price : 0,
          status: data.status || "Voting",
          votes: data.votes || {},
          addedBy: data.addedBy || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as ProductItem;
      });

      // Sort chronological
      dbProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setProducts(dbProducts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [familyId]);

  const addProduct = async (title: string, url: string, price: number, userId: string) => {
    if (!familyId) return;
    const productsRef = collection(db, "families", familyId, "productVoting");
    await addDoc(productsRef, {
      title,
      url,
      price,
      status: "Voting",
      votes: {},
      addedBy: userId,
      createdAt: serverTimestamp(),
    });
  };

  const castVote = async (productId: string, userId: string, voteValue: number) => {
    if (!familyId) return;
    const pDoc = doc(db, "families", familyId, "productVoting", productId);
    await updateDoc(pDoc, {
      [`votes.${userId}`]: voteValue
    });
  };

  const updateStatus = async (productId: string, newStatus: ProductStatus) => {
    if (!familyId) return;
    const pDoc = doc(db, "families", familyId, "productVoting", productId);
    await updateDoc(pDoc, { status: newStatus });
  };

  const deleteProduct = async (productId: string) => {
    if (!familyId) return;
    const pDoc = doc(db, "families", familyId, "productVoting", productId);
    await deleteDoc(pDoc);
  };

  return { products, loading, addProduct, castVote, updateStatus, deleteProduct };
}
