"use client";

import { useEffect, useState } from "react";
import ThemeSettingsUI from "@/app/settings/_components/ThemeSettingsUI";
import { Theme } from "./theme";

function Settings() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleChangeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="h-screen overflow-y-auto scrollbar-hide bg-base-200">
      <ThemeSettingsUI 
        theme={theme} 
        onChangeTheme={handleChangeTheme} 
      />
    </div>
  );
}

export default Settings;