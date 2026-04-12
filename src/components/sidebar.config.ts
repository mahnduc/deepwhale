import {
  LayoutDashboard,
  Settings,
  Wrench,
  Bot,
  BookCheckIcon,
} from "lucide-react";

export const menuItems = [
  {
    href: "/",
    label: "Trang chủ",
    icon: LayoutDashboard,
  },
  {
    href: "/tools",
    label: "Công cụ",
    icon: Wrench,
  },
  {
    href: "/pengu",
    label: "Pengu",
    icon: Bot,
  },
  {
    href: "/courses",
    label: "Courses",
    icon: BookCheckIcon,
  },
];

export const bottomMenuItems = [
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
  },
];
