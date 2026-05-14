# RecruRep Workspace

Two independent projects + one website:

- `spec-kit/` — GitHub Spec Kit toolkit (Spec-Driven Development). Has its own `AGENTS.md` for adding integrations, running tests, and building the CLI.
- `awesome-design-md/` — Collection of DESIGN.md files from popular websites for UI inspiration.
- `website/` — RecruRep landing page (vanilla HTML/CSS/JS).

## website/ — Landing Page

**Stack:** Vanilla HTML5, CSS3, ES6+. No frameworks, no build step.

**Design:** VoltAgent-inspired dark theme (`DESIGN.md` at `website/DESIGN.md`).
- Canvas `#101010`, emerald `#00d992`, Inter font, hairline borders, no shadows, no light mode.

**To preview:** Open `website/index.html` in a browser or serve with any static file server.

**SDD artifacts** live in `website/.specify/`:
- `memory/constitution.md` — project principles
- `specs/001-landing-page/` — spec, plan, tasks

**Structure:** Single `index.html`, `css/style.css`, `js/main.js`. Responsive breakpoints at 768px (mobile) and 1024px (desktop).

## Key conventions

- Do NOT add a build step or framework unless explicitly asked.
- The `specify` CLI (`uv tool install specify-cli`) is installed but has Unicode issues on Windows PowerShell — prefer editing SDD files directly.
- All DESIGN.md files use the [Stitch format](https://stitch.withgoogle.com/docs/design-md/format/).
