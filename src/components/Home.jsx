import { Copy, Link, PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

const Home = () => {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [slug, setSlug] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const pasteId = searchParams.get("pasteId");
  const user = useSelector((s) => s.auth.user);
  const firstName = user?.email?.split("@")[0] || "Creator";
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // handle install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "folders"), where("userId", "==", user.uid))
        );
        setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        toast.error("Couldn't load folders.");
      }
    })();
  }, [user]);

  // fetch existing paste
  useEffect(() => {
    if (!pasteId) return;
    (async () => {
      const ref = doc(db, "pastes", pasteId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        if (d.userId !== user?.uid) {
          toast.error("Unauthorized");
          setSearchParams({});
          return;
        }
        setTitle(d.title);
        setValue(d.content);
        setTags(d.tags || []);
        setSlug(d.slug || "");
      } else toast.error("Paste not found");
    })();
  }, [pasteId, user]);

  const resetPaste = () => {
    setTitle("");
    setValue("");
    setTags([]);
    setSlug("");
    setSearchParams({});
    setSelectedFolder("");
  };

  const createPaste = async () => {
    if (!title.trim() || !value.trim())
      return toast.error("Add title & content");
    try {
      if (pasteId) {
        await updateDoc(doc(db, "pastes", pasteId), {
          title,
          content: value,
          tags,
          folderId: selectedFolder || null,
          updatedAt: new Date().toISOString(),
        });
        toast.success("Note updated!");
      } else {
        const generatedSlug = nanoid(8);
        await addDoc(collection(db, "pastes"), {
          title,
          content: value,
          tags,
          folderId: selectedFolder || null,
          createdAt: new Date().toISOString(),
          isPinned: false,
          userId: user.uid,
          slug: generatedSlug,
        });
        setSlug(generatedSlug);
        toast.success("Note created!");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      resetPaste();
    } catch (err) {
      toast.error("Oops! Something broke.");
      console.error(err);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleVoice = () => {
    try {
      const r = new window.webkitSpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.lang = "en-US";
      r.start();
      r.onresult = (ev) => {
        setValue((prev) => prev + "\n" + ev.results[0][0].transcript);
        toast.success("Voice added 🎙️");
      };
      r.onerror = () => toast.error("Voice input failed");
    } catch {
      toast.error("Browser doesn't support voice input");
    }
  };

  const handleAddFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return toast.error("Folder name can't be empty");
    try {
      await addDoc(collection(db, "folders"), {
        name: trimmed,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });
      toast.success("Folder created 🎉");
      setNewFolderName("");
      setShowNewFolderInput(false);
      const snap = await getDocs(
        query(collection(db, "folders"), where("userId", "==", user.uid))
      );
      setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    toast.success(
      outcome === "accepted" ? "Installed 🎉" : "Install cancelled."
    );
    setDeferredPrompt(null);
  };

  return (
    <div className="pt-[88px] bg-[#121212] text-white min-h-screen pb-8">
      <motion.section
        className="py-14 px-6 sm:px-10 max-w-5xl mx-auto mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="bg-[#181818] rounded-3xl p-8 sm:p-12 shadow-[inset_10px_10px_25px_#121212,inset_-10px_-10px_25px_#1f1f1f] transition-transform duration-300"
          whileHover={{
            rotateX: 6,
            rotateY: -6,
            scale: 1.015,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
        >
          {/* 👋 Welcome Text */}
          <motion.h1
            className="text-3xl sm:text-5xl font-extrabold text-white text-center tracking-tight mb-4"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            Welcome back, <span className="text-[#00bfff]">{firstName}</span> 👋
          </motion.h1>

          {/* 📝 App Description */}
          <motion.p
            className="text-gray-300 text-center text-base sm:text-lg leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Notopia is your peaceful space to write and organize. With clean
            markdown, powerful tags, and cloud folders — your notes stay simple,
            beautiful, and truly yours.
          </motion.p>

          {/* 📲 Install Button */}
          {deferredPrompt && (
            <motion.div
              className="text-center mt-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={handleInstallClick}
                className="bg-[#00bfff] hover:bg-[#1a8cc5] transition-all text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_20px_#00bfff66]"
              >
                Install Notopia 📲
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.section>

      <section className="max-w-3xl mx-auto bg-[#181818] rounded-lg shadow-lg overflow-hidden mb-8">
        {showConfetti && <Confetti />}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            type="text"
            placeholder="Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-[#1e1e1e] placeholder:text-gray-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00bfff]"
          />
          <button
            onClick={createPaste}
            className="bg-[#00bfff] hover:bg-[#009fdf] px-6 py-2 rounded-md text-white transition w-full sm:w-auto"
          >
            {pasteId ? "Update Note" : "Create Note"}
          </button>
          {pasteId && (
            <button
              onClick={resetPaste}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-2 rounded-md transition"
            >
              <PlusCircle size={20} />
            </button>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block mb-1 text-gray-300">Folder</label>
            <div className="flex gap-2">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="flex-1 bg-[#1e1e1e] text-white px-4 py-2 rounded focus:ring-2 focus:ring-[#00bfff]"
              >
                <option value="">📁 No Folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowNewFolderInput((prev) => !prev)}
                className="px-3 py-2 bg-[#00bfff] hover:bg-[#009fdf] rounded-md text-white"
                title="Add Folder"
              >
                <PlusCircle size={20} />
              </button>
            </div>

            {showNewFolderInput && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 bg-[#1e1e1e] text-white px-4 py-2 rounded focus:ring-2 focus:ring-[#00bfff]"
                />
                <button
                  onClick={handleAddFolder}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div>
            <form onSubmit={addTag} className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag & Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 bg-[#1e1e1e] text-white px-4 py-2 rounded focus:ring-2 focus:ring-[#00bfff]"
              />
              <button
                type="submit"
                className="bg-[#00bfff] hover:bg-[#009fdf] px-4 py-2 rounded"
              >
                Add
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((t, i) => (
                <div
                  key={i}
                  className="bg-[#00bfff]/30 text-[#00bfff] px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                >
                  {t}
                  <X
                    size={14}
                    className="cursor-pointer hover:text-red-400"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleVoice}
              className="flex-1 bg-[#1e1e1e] border border-[#00bfff] text-[#00bfff] hover:bg-[#00bfff] hover:text-black px-4 py-2 rounded-md transition"
            >
              🎙️ Speak
            </button>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={showMarkdown}
                onChange={() => setShowMarkdown((v) => !v)}
              />
              Markdown Preview
            </label>
          </div>

          <div className="bg-[#1e1e1e] rounded-md overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-[#2a2a2a] border-b border-[#2a2a2a]">
              <div className="flex space-x-2">
                <div className="w-[12px] h-[12px] bg-red-500 rounded-full" />
                <div className="w-[12px] h-[12px] bg-yellow-400 rounded-full" />
                <div className="w-[12px] h-[12px] bg-green-500 rounded-full" />
              </div>
              <div className="flex space-x-3 text-gray-300">
                <Copy
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    toast.success("Copied!");
                  }}
                  size={20}
                  className="cursor-pointer hover:text-[#00bfff] transition"
                />
                {slug && (
                  <Link
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/pastes/${slug}`
                      );
                      toast.success("Link copied");
                    }}
                    size={20}
                    className="cursor-pointer hover:text-[#00bfff] transition"
                  />
                )}
              </div>
            </div>
            {showMarkdown ? (
              <div className="p-4 prose prose-sm prose-invert overflow-auto">
                <ReactMarkdown>
                  {value || "Nothing to preview..."}
                </ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={10}
                placeholder="Your content..."
                className="w-full bg-transparent text-white p-4 resize-none focus:outline-none"
              />
            )}
          </div>
        </div>
      </section>

      <footer className="text-center text-gray-400 mt-8">
        🙏 Thank you for using Notopia —<br />
        with ❤️ by Nitesh
      </footer>
    </div>
  );
};

export default Home;
