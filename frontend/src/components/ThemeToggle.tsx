import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("roadguard-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      return savedTheme;
    }

    return "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);

    localStorage.setItem("roadguard-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="
        flex h-11 w-11 items-center justify-center
        rounded-xl
        border border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--muted)]
        transition-all duration-200
        hover:border-emerald-400/40
        hover:bg-emerald-400/10
        hover:text-emerald-400
      "
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

export default ThemeToggle;