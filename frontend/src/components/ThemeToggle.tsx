import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        relative flex h-10 w-10 items-center justify-center
        rounded-xl border
        border-[var(--border)]
        bg-[var(--surface)]
        text-[var(--muted)]
        transition-all duration-300
        hover:border-emerald-400/40
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