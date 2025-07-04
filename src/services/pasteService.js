import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

// Firestore reference to the "pastes" collection
const pastesRef = collection(db, "pastes");

/**
 * Create a new paste
 * @param {Object} paste - The paste object
 * @returns {Object} - Created paste with generated Firestore ID
 */
export const createPaste = async (paste) => {
  const docRef = await addDoc(pastesRef, paste);
  return { ...paste, _id: docRef.id }; // 🔁 Consistent with Redux _id convention
};

/**
 * Get all pastes (ordered by latest)
 * @returns {Array} - List of paste documents
 */
export const getAllPastes = async () => {
  const snapshot = await getDocs(
    query(pastesRef, orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
};

/**
 * Get all pastes for a specific user
 * @param {string} userId - Firebase UID of the user
 * @returns {Array} - List of user's pastes
 */
export const getPastesByUser = async (userId) => {
  const q = query(
    pastesRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
};

/**
 * Update an existing paste
 * @param {string} id - Paste document ID
 * @param {Object} data - Fields to update
 */
export const updatePaste = async (id, data) => {
  const docRef = doc(db, "pastes", id);
  await updateDoc(docRef, data);
};

/**
 * Delete a paste
 * @param {string} id - Paste document ID
 */
export const deletePaste = async (id) => {
  const docRef = doc(db, "pastes", id);
  await deleteDoc(docRef);
};
