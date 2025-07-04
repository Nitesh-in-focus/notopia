import {
  Calendar,
  Copy,
  Eye,
  PencilLine,
  Trash2,
  Star,
  X,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { FormatDate } from "../utlis/formatDate";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";

const highlightText = (text, term) => {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={i} className="bg-yellow-300 text-black px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const Paste = ({ folders = [] }) => {
  const user = useSelector((state) => state.auth.user);
  const [pastes, setPastes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [activeTags, setActiveTags] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");

  const fetchPastes = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "pastes"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      setPastes(data);
    } catch (error) {
      toast.error("Failed to load notes");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "pastes", id));
      setPastes((prev) => prev.filter((p) => p._id !== id));
      toast.success("Note deleted 🗑️");
    } catch {
      toast.error("Error deleting note");
    }
  };

  const handleTogglePin = async (id, current) => {
    try {
      await updateDoc(doc(db, "pastes", id), { isPinned: !current });
      fetchPastes();
    } catch {
      toast.error("Couldn’t update pin");
    }
  };

  useEffect(() => {
    fetchPastes();
  }, [user?.uid]);

  const filtered = pastes
    .filter((p) => (selectedFolder ? p.folderId === selectedFolder : true))
    .filter(
      (p) =>
        (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.content?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeTags.length === 0 ||
          p.tags?.some((tag) => activeTags.includes(tag)))
    )
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const downloadAsFile = (paste, type) => {
    const name = paste.title || "notopia-note";
    if (type === "txt") {
      const blob = new Blob([paste.content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${name}.txt`;
      link.click();
      toast.success("Downloaded as .txt 📄");
    } else if (type === "pdf") {
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(paste.content || "", 180);
      doc.text(lines, 15, 20);
      doc.save(`${name}.pdf`);
      toast.success("Downloaded as PDF 📕");
    }
  };

  return (
    <div className="pt-[90px] px-4 sm:px-6 lg:px-10 w-full min-h-screen bg-darkbg text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 scroll-mt-24">Your Notes</h1>

          <p className="text-gray-400">
            Manage your saved notes with sorting, tagging, and quick actions.
          </p>
        </div>

        {/* 🔍 Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          <input
            type="text"
            placeholder="Search notes..."
            className="flex-1 bg-[#1f1f1f] px-4 py-2 rounded-md border border-gray-700 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#1f1f1f] px-4 py-2 rounded-md border border-gray-700 text-white"
          >
            <option value="newest">🕓 Newest First</option>
            <option value="oldest">📜 Oldest First</option>
          </select>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="bg-[#1f1f1f] px-4 py-2 rounded-md border border-gray-700 text-white"
          >
            <option value="">📁 All Folders</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🏷️ Tags Filter */}
        {filtered.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {[...new Set(filtered.flatMap((p) => p.tags || []))].map(
              (tag, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setActiveTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    )
                  }
                  className={`px-3 py-1 text-sm rounded-full transition border ${
                    activeTags.includes(tag)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-blue-700 border-blue-300"
                  }`}
                >
                  {tag}
                </button>
              )
            )}
            {activeTags.length > 0 && (
              <button
                onClick={() => setActiveTags([])}
                className="text-sm text-red-400 underline flex items-center gap-1"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        )}

        {/* 📋 Notes List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400">
              Loading notes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center text-red-400">
              No notes found 😕
            </div>
          ) : (
            filtered.map((note) => (
              <div
                key={note._id}
                className="rounded-xl p-5 bg-[#1a1a1a] border border-gray-800 shadow-md transition hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-blue-300 line-clamp-1">
                    {highlightText(note.title, searchTerm)}
                  </h2>
                  <button
                    onClick={() => handleTogglePin(note._id, note.isPinned)}
                  >
                    <Star
                      size={20}
                      className={`${
                        note.isPinned ? "text-yellow-400" : "text-gray-400"
                      }`}
                      fill={note.isPinned ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3 mb-2">
                  {highlightText(note.content, searchTerm)}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {/* Line 1: Common actions */}
                  <div className="flex gap-3 flex-wrap">
                    <a href={`/?pasteId=${note._id}`} title="Edit Note">
                      <ActionBtn icon={<PencilLine size={16} />} />
                    </a>
                    <ActionBtn
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete(note._id)}
                      title="Delete"
                    />
                    <a
                      href={`/pastes/${note.slug || note._id}`}
                      target="_blank"
                    >
                      <ActionBtn icon={<Eye size={16} />} title="View" />
                    </a>
                    <ActionBtn
                      icon={<Copy size={16} />}
                      onClick={() => {
                        navigator.clipboard.writeText(note.content);
                        toast.success("Copied note content");
                      }}
                      title="Copy"
                    />
                  </div>

                  {/* Line 2: Share and Download */}
                  <div className="flex gap-3 flex-wrap">
                    <ActionBtn
                      icon={<Share2 size={16} />}
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${window.location.origin}/pastes/${
                            note.slug || note._id
                          }`
                        )
                      }
                      title="Share"
                    />
                    <ActionBtn
                      icon={<span className="text-sm">TXT</span>}
                      onClick={() => downloadAsFile(note, "txt")}
                      title="Download TXT"
                    />
                    <ActionBtn
                      icon={<span className="text-sm">PDF</span>}
                      onClick={() => downloadAsFile(note, "pdf")}
                      title="Download PDF"
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <Calendar size={14} /> {FormatDate(note.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="text-center mt-10 text-sm text-gray-500 border-t border-gray-800 pt-6">
          ❤️ Made with love by{" "}
          <span className="text-white font-medium">Nitesh</span>
        </footer>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, onClick, title }) => (
  <div
    title={title}
    onClick={onClick}
    className="w-9 h-9 flex items-center justify-center rounded-md bg-[#101010] border border-gray-700 hover:border-blue-500 transition cursor-pointer"
  >
    {icon}
  </div>
);

export default Paste;
