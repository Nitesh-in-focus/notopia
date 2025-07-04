import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";

// Firestore collection
const pastesCollection = collection(db, "pastes");

// Thunks
export const fetchPastes = createAsyncThunk(
  "paste/fetchPastes",
  async (userId) => {
    const q = query(pastesCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));
  }
);

export const addPasteToDB = createAsyncThunk(
  "paste/addPaste",
  async (paste) => {
    const docRef = await addDoc(pastesCollection, {
      ...paste,
      tags: paste.tags || [],
      isPinned: paste.isPinned || false,
      folderId: paste.folderId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast.success("Paste created ✅");
    return { ...paste, _id: docRef.id };
  }
);

export const updatePasteInDB = createAsyncThunk(
  "paste/updatePaste",
  async (paste) => {
    const { _id, ...rest } = paste;
    const docRef = doc(db, "pastes", _id);
    await updateDoc(docRef, {
      ...rest,
      updatedAt: new Date().toISOString(),
    });
    toast.success("Paste updated ✅");
    return paste;
  }
);

export const deletePasteFromDB = createAsyncThunk(
  "paste/deletePaste",
  async (id) => {
    const docRef = doc(db, "pastes", id);
    await deleteDoc(docRef);
    toast.success("Paste deleted 🗑️");
    return id;
  }
);

export const togglePinInDB = createAsyncThunk(
  "paste/togglePin",
  async ({ id, current }) => {
    const docRef = doc(db, "pastes", id);
    await updateDoc(docRef, { isPinned: !current });
    toast.success(!current ? "Note pinned 📌" : "Note unpinned");
    return { id, newPin: !current };
  }
);

// Slice
const pasteSlice = createSlice({
  name: "paste",
  initialState: {
    pastes: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetPasteState: (state) => {
      state.pastes = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPastes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPastes.fulfilled, (state, action) => {
        state.loading = false;
        state.pastes = action.payload;
      })
      .addCase(fetchPastes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch pastes";
      })

      .addCase(addPasteToDB.fulfilled, (state, action) => {
        state.pastes.push(action.payload);
      })

      .addCase(updatePasteInDB.fulfilled, (state, action) => {
        const idx = state.pastes.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) {
          state.pastes[idx] = action.payload;
        }
      })

      .addCase(deletePasteFromDB.fulfilled, (state, action) => {
        state.pastes = state.pastes.filter((p) => p._id !== action.payload);
      })

      .addCase(togglePinInDB.fulfilled, (state, action) => {
        const paste = state.pastes.find((p) => p._id === action.payload.id);
        if (paste) paste.isPinned = action.payload.newPin;
      });
  },
});

export const { resetPasteState } = pasteSlice.actions;
export default pasteSlice.reducer;

// Selectors (optional for ease)
export const selectPastes = (state) => state.paste.pastes;
export const selectPasteLoading = (state) => state.paste.loading;
export const selectPasteError = (state) => state.paste.error;
