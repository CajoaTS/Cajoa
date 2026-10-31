import { createSignal, isServer } from "cajoa";
import { Icon, type IconName } from "./icons";

type Theme = "system" | "light" | "dark";

const KEY = "cajoa-theme";
const order: Theme[] = ["system", "light", "dark"];
const icons: Record<Theme, IconName> = { system: "monitor", light: "sun", dark: "moon" };
const labels: Record<Theme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  try {
    if (theme === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem(KEY);
    } else {
      root.setAttribute("data-theme", theme);
      localStorage.setItem(KEY, theme);
    }
  } catch {
    // Storage can be blocked. The theme still changes for this visit.
  }
}

export function ThemeToggle() {
  // index.html already applied the saved theme before the first paint
  const [theme, setTheme] = createSignal<Theme>(isServer() ? "system" : readTheme());

  const change = () => {
    const next = order[(order.indexOf(theme()) + 1) % order.length];
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      class="icon-button"
      onClick={change}
      aria-label={labels[theme()] + ". Click to change."}
      title={labels[theme()]}
    >
      {() => <Icon name={icons[theme()]} />}
    </button>
  );
}