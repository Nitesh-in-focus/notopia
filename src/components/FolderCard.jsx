// src/components/FolderCard.jsx
import { Trash2 } from "lucide-react";

const FolderCard = ({ folder, onDelete }) => {
  return (
    <div className="p-4 rounded-xl bg-[#262626] border border-white/10 shadow hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold truncate">{folder.name}</h2>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-400 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-400">
        Created at: {new Date(folder.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
};

export default FolderCard;
