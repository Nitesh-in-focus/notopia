import { useEffect, useState } from "react";
import { Copy, Download, Folder } from "lucide-react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

const ViewPaste = () => {
  const { id } = useParams(); // slug
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPasteBySlug = async () => {
      try {
        const q = query(collection(db, "pastes"), where("slug", "==", id));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          toast.error("Paste not found");
          return;
        }
        const docSnap = snapshot.docs[0];
        setPaste({ _id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        toast.error("Failed to fetch paste");
      } finally {
        setLoading(false);
      }
    };
    fetchPasteBySlug();
  }, [id]);

  const handleDownloadPDF = () => {
    if (!paste) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text(paste.title || "Untitled Note", 40, 50);

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(paste.content || "", 500);
    doc.text(lines, 40, 80);

    doc.save(`${paste.title || "note"}.pdf`);
    toast.success("PDF downloaded");
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl text-gray-400">
        Loading your note...
      </div>
    );
  }

  if (!paste) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl text-red-400">
        Paste not found.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-darkbg pt-[90px] px-4 sm:px-6 lg:px-10 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Title & Tags */}
        <div className="flex flex-col items-start gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400 tracking-tight">
            {paste.title}
          </h1>

          {paste.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {paste.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-sm bg-blue-900 text-blue-300 shadow-inner"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {paste.folderName && (
            <div className="flex items-center gap-2 text-sm text-blue-400 mt-1">
              <Folder size={16} />
              <span className="font-medium">{paste.folderName}</span>
            </div>
          )}
        </div>

        {/* Content Viewer Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#101010]/60 backdrop-blur-md shadow-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-white/10 bg-[#1a1a1a]/60">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>

            <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
              <div
                onClick={() => {
                  navigator.clipboard.writeText(paste.content);
                  toast.success("Copied to Clipboard 📋");
                }}
                title="Copy Note"
                className="w-11 h-11 flex items-center justify-center rounded-md border border-gray-700 hover:border-green-500 transition duration-200 cursor-pointer"
              >
                <Copy className="text-white" size={20} />
              </div>

              <div
                onClick={handleDownloadPDF}
                title="Download PDF"
                className="w-11 h-11 flex items-center justify-center rounded-md border border-gray-700 hover:border-blue-500 transition duration-200 cursor-pointer"
              >
                <Download className="text-white" size={20} />
              </div>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="p-6 prose prose-invert max-w-none overflow-auto">
            <ReactMarkdown>
              {paste.content || "*No content found.*"}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-10 pb-5">
          Made with 💙 by <span className="text-blue-400 font-medium">Nitesh</span>
        </div>
      </div>
    </div>
  );
};

export default ViewPaste;
