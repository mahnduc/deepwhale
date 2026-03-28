"use client";

import Link from "next/link";
import { menuItems, bottomMenuItems } from "./sidebar.config";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-base-300 bg-base-200 flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-base-300">
        My App
      </div>

      {/* TOP MENU */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM MENU */}
      <div className="p-4 border-t border-base-300 space-y-2">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}