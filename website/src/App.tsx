import { useState } from "react"
import { WaitlistExperience } from "@/components/ui/waitlist-landing-page-with-countdown-timer"

type Theme = "v1" | "v2" | "v3" | "v4"

const THEME_LABELS: Record<Theme, string> = {
  v1: "Navy + Gold",
  v2: "Teal + Terracotta",
  v3: "Slate + Amber",
  v4: "Deep Blue + Sage",
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("v1")

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {(["v1", "v2", "v3", "v4"] as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              theme === t
                ? "bg-white/20 text-white border-white/40"
                : "bg-black/40 text-white/60 border-white/10 hover:text-white/80"
            }`}
          >
            {THEME_LABELS[t]}
          </button>
        ))}
      </div>
      <WaitlistExperience theme={theme} />
    </div>
  )
}
