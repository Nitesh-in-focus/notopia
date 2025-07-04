import { Home, StickyNote, Folder, Settings } from "lucide-react";

export const NavbarData = [
  {
    path: "/",
    title: "Home",
    icon: Home,
    authRequired: false,
  },
  {
    path: "/pastes",
    title: "Your Notes",
    icon: StickyNote,
    authRequired: true,
  },
  {
    path: "/folders",
    title: "Folders",
    icon: Folder,
    authRequired: true,
  },
];
