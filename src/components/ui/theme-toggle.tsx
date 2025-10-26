import { Moon, Sun } from "lucide-react"
import { Button } from "./button"
import { useTheme } from "../theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    // If current theme is system, check what the actual applied theme is
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme === "dark" ? "light" : "dark")
    } else {
      // Toggle between light and dark
      setTheme(theme === "light" ? "dark" : "light")
    }
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-10 w-10 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-indigo-400/20 rounded-full border border-transparent hover:border-indigo-300 dark:hover:border-indigo-600"
      onClick={toggleTheme}
    >
      <Sun className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-indigo-600 dark:text-indigo-400" />
      <Moon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-indigo-600 dark:text-indigo-400" />
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  )
}