import { NavbarData } from "../data/NavbarData";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { logoutUser } from "../redux/authSlice";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Wifi, WifiOff, Menu, X } from "lucide-react";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  if (!user) return null;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logoutUser());
      toast.success("Logged out successfully 👋");
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
      toast.error("Logout failed 😓");
    }
  };

  return (
    <motion.nav
      className="w-full fixed top-0 left-0 z-50 bg-[#121212] text-white px-4 py-3 sm:py-4 border-b border-[#1f1f1f] shadow-md"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto bg-[#181818] px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* 🔰 Logo with motion */}
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="text-xl sm:text-2xl font-extrabold text-white tracking-wide cursor-pointer"
        >
          Notopia
        </motion.div>

        {/* 🔗 Navigation & Mobile Toggle */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          {/* 🖥️ Desktop Nav */}
          <div className="hidden sm:flex gap-6 text-sm sm:text-base font-semibold whitespace-nowrap">
            {NavbarData.map((link, idx) => (
              <NavLink
                key={idx}
                to={link.path}
                className={({ isActive }) =>
                  `relative px-3 py-1 transition-all duration-300 rounded-md
                  ${
                    isActive
                      ? "text-[#00bfff] font-bold shadow-[0_0_10px_#00bfff80]"
                      : "text-gray-300 hover:text-[#00bfff]"
                  }
                  ${
                    isActive
                      ? ""
                      : "hover:scale-[1.04] hover:translate-y-[-1px]"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          {/* 📱 Mobile Toggle */}
          <button
            className="sm:hidden text-white"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 👤 Right Section */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#b3b3b3]">
          {/* 🌐 Online Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div
                title="You're online"
                className="flex items-center gap-1 text-green-400 border border-green-400 px-2 py-[2px] text-xs rounded-full"
              >
                <Wifi size={14} /> Online
              </div>
            ) : (
              <div
                title="You're offline"
                className="flex items-center gap-1 text-yellow-400 border border-yellow-400 px-2 py-[2px] text-xs rounded-full animate-pulse"
              >
                <WifiOff size={14} /> Offline
              </div>
            )}
          </div>

          {/* 👋 Welcome + Logout */}
          <span className="hidden sm:inline">
            Welcome,{" "}
            <span className="text-white font-semibold">
              {user.email?.split("@")[0]}
            </span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 sm:py-1.5 rounded-full text-white transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 📱 Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sm:hidden mt-3 w-full flex flex-col items-start gap-3 text-sm font-semibold"
        >
          {NavbarData.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              className={({ isActive }) =>
                `w-full px-3 py-2 rounded-md transition-all duration-300 ${
                  isActive
                    ? "text-[#00bfff] font-bold bg-[#1b1b1b] shadow-[0_0_8px_#00bfff88]"
                    : "text-gray-300 hover:text-[#00bfff] hover:bg-[#1a1a1a]"
                }`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.title}
            </NavLink>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
