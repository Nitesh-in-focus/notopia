import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Paste from "./components/Paste";
import ViewPaste from "./components/ViewPaste";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { setUser, logoutUser } from "./redux/authSlice";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { nanoid } from "nanoid";
import FolderPage from "./pages/FolderPage";

// 🔐 Route Guard
const PrivateRoute = ({ element }) => {
  const user = useSelector((state) => state.auth.user);
  return user ? element : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const [folders, setFolders] = useState([]); // 🗂️ fetched folders
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 🔁 Sync offline paste
  const syncOfflinePaste = async () => {
    const unsyncedPaste = localStorage.getItem("unsyncedPaste");
    if (!unsyncedPaste || !user?.uid) return;

    try {
      const data = JSON.parse(unsyncedPaste);
      await addDoc(collection(db, "pastes"), {
        ...data,
        userId: user.uid,
        slug: data.slug || nanoid(8),
      });
      toast.success("✅ Offline paste synced!");
      localStorage.removeItem("unsyncedPaste");
    } catch (err) {
      console.error("❌ Failed to sync offline paste", err);
      toast.error("Failed to sync offline paste ⚠️");
    }
  };

  // 🌐 Online/offline status
  useEffect(() => {
    const updateStatus = () => {
      const status = navigator.onLine;
      setIsOnline(status);

      if (!status && localStorage.getItem("unsyncedPaste")) {
        toast.error("You're offline — changes will sync later 🔄");
      } else {
        toast.success("Back online — syncing 🔁");
        syncOfflinePaste();
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [user]);

  // 👤 Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
          })
        );
      } else {
        dispatch(logoutUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  // 📂 Fetch folders when user is available
  useEffect(() => {
    const fetchFolders = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "folders"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFolders(data);
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };

    fetchFolders();
  }, [user?.uid]);

  // 🔁 Routes with folders passed to <Paste />
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <PrivateRoute
          element={
            <>
              <Navbar />
              <div className="pt-[115px] w-full h-full">
                <Home />
              </div>
            </>
          }
        />
      ),
    },
    {
      path: "/pastes",
      element: (
        <PrivateRoute
          element={
            <>
              <Navbar />
              <div className="pt-[115px] w-full h-full">
                <Paste folders={folders} />
              </div>
            </>
          }
        />
      ),
    },
    {
      path: "/folders",
      element: (
        <PrivateRoute
          element={
            <>
              <Navbar />
              <div className="pt-[115px] w-full h-full">
                <FolderPage />
              </div>
            </>
          }
        />
      ),
    },
    {
      path: "/pastes/:id",
      element: (
        <>
          <Navbar />
          <div className="pt-[115px] w-full h-full">
            <ViewPaste />
          </div>
        </>
      ),
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="text-lg animate-pulse text-blue-500 font-bold">
          Loading Notopia...
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
