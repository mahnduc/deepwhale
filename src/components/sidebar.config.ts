import { LayoutDashboard, User, Mail, Settings, Folder, BookText, Database, Wrench } from "lucide-react";

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
  // {
  //   href: "/knowledge-base",
  //   label: "Kho tri thức",
  //   icon: Database,
  // },
  // {
  //   href: "/knowledge-base/markdown-page",
  //   label: "Tài liệu",
  //   icon: BookText,
  // },
  {
    href: "/tools",
    label: "Công cụ",
    icon: Wrench,
  },
];

export const bottomMenuItems = [
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
  },
];
