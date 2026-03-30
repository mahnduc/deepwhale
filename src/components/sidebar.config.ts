import {
  LayoutDashboard,
  User,
  Mail,
  Settings,
  Folder,
  BookText,
  Database,
  Wrench,
  BotMessageSquare,
  BookAIcon,
  Share2,
} from "lucide-react";

export const menuItems = [
  {
    href: "/",
    label: "Trang chủ",
    icon: LayoutDashboard,
  },
  // {
  //   href: "/opfs-explorer",
  //   label: "OPFSExplorer",
  //   icon: Folder,
  // },
  {
    href: "/tools",
    label: "Công cụ",
    icon: Wrench,
  },
  {
    href: "/agents",
    label: "Trò chuyện",
    icon: BotMessageSquare,
  },
  {
    href: "/courses",
    label: "Bài học",
    icon: Share2,
  }
];

export const bottomMenuItems = [
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
  },
];
