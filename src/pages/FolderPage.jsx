import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

const FolderPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [folders, setFolders] = useState([]);
  const [allPastes, setAllPastes] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedFolderId, setExpandedFolderId] = useState(null);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchFolders();
      fetchAllPastes();
    }
  }, [user]);

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "folders"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      setFolders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load folders 😔");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPastes = async () => {
    try {
      const q = query(
        collection(db, "pastes"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      setAllPastes(snapshot.docs.map((d) => ({ _id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load pastes");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim())
      return toast.error("Folder name cannot be empty");
    await addDoc(collection(db, "folders"), {
      name: newFolderName,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });
    toast.success("Folder created 🗂️");
    setNewFolderName("");
    fetchFolders();
  };

  const handleDeleteFolder = async (id) => {
    await deleteDoc(doc(db, "folders", id));
    toast.success("Folder deleted 🗑️");
    fetchFolders();
  };

  const handleRenameFolder = async (id, name) => {
    if (!name.trim()) return toast.error("Folder name cannot be empty");
    await updateDoc(doc(db, "folders", id), { name });
    toast.success("Folder renamed ✏️");
    setEditingFolderId(null);
    fetchFolders();
  };

  const sortedAndFiltered = folders
    .filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  return (
    <div className="min-h-screen bg-darkbg text-white px-4 py-8 mt-[100px] sm:px-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">📁 Your Folders</h1>
          <p className="text-gray-400">
            Browse and manage your folders and pastes here. Click the icons to
            rename, view notes, or delete.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-4 py-2 bg-[#1e1e1e] rounded-md border border-gray-700"
            placeholder="New folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button
            onClick={handleCreateFolder}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md transition"
          >
            Create Folder
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            className="w-full sm:w-[60%] px-4 py-2 bg-[#1e1e1e] rounded-md border border-gray-700"
            placeholder="Search folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-md border bg-white text-black"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          sortedAndFiltered.map((folder) => {
            const notes = allPastes.filter((p) => p.folderId === folder.id);
            const isExpanded = expandedFolderId === folder.id;

            return (
              <div
                key={folder.id}
                className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-5 shadow-md space-y-4"
              >
                <div className="flex justify-between items-center">
                  {editingFolderId === folder.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#2a2a2a] rounded-md border border-gray-600"
                      />
                      <button
                        onClick={() =>
                          handleRenameFolder(folder.id, renameInput)
                        }
                        className="text-green-400 hover:text-green-200 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingFolderId(null)}
                        className="text-red-400 hover:text-red-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold flex-1">
                        📁 {folder.name}
                      </h2>
                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            setExpandedFolderId((prev) =>
                              prev === folder.id ? null : folder.id
                            )
                          }
                          className="p-2 rounded-md bg-[#1e1e1e] hover:bg-[#2a2a2a] transition"
                          title={isExpanded ? "Hide notes" : "View notes"}
                        >
                          {isExpanded ? <EyeOff /> : <Eye />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingFolderId(folder.id);
                            setRenameInput(folder.name);
                          }}
                          className="p-2 rounded-md bg-[#1e1e1e] hover:bg-[#2a2a2a] transition"
                          title="Rename"
                        >
                          <Pencil />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="p-2 rounded-md bg-[#1e1e1e] hover:bg-[#2a2a2a] transition"
                          title="Delete"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {isExpanded && (
                  <div className="pl-4 border-t border-gray-600 pt-4 space-y-2">
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <Link
                          key={note._id}
                          to={`/pastes/${note.slug || note._id}`}
                          className="block px-3 py-2 bg-[#222] rounded-md hover:bg-[#2a2a2a] transition"
                        >
                          🔗 {note.title || "Untitled Note"}
                        </Link>
                      ))
                    ) : (
                      <p className="italic text-gray-500">
                        No notes in this folder.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="text-center text-gray-400">
          💙 Made with love by Nitesh
        </div>
      </div>
    </div>
  );
};

export default FolderPage;
