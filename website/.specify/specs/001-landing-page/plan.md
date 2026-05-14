# Technical Plan: RecruRep Landing Page

## Architecture
- **Type**: Static single-page application (SPA-style anchor navigation)
- **Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Build**: None — raw files served directly
- **Deploy target**: Any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages)

## File Structure
```
website/
├── index.html              # Single HTML page with all sections
├── css/
│   └── style.css           # All styles (no preprocessor)
├── js/
│   └── main.js             # All JavaScript (nav, FAQ accordion, form, scroll)
├── DESIGN.md               # VoltAgent design reference
└── .specify/               # SDD artifacts
    ├── memory/
    │   └── constitution.md
    └── specs/
        └── 001-landing-page/
            ├── spec.md
            ├── plan.md
            └── tasks.md
```

## Design System (from DESIGN.md)
- **Canvas**: #101010 (near-black page background)
- **Canvas Soft**: #1a1a1a (cards, inputs)
- **Primary**: #00d992 (emerald — CTAs, accent)
- **Primary Soft**: #2fd6a1 (hover states, secondary green)
- **Primary Deep**: #10b981 (inline links)
- **Ink**: #f2f2f2 (body text)
- **Ink Strong**: #ffffff (headlines)
- **Body**: #bdbdbd (secondary text)
- **Mute**: #8b949e (fine print, captions)
- **Hairline**: #3d3a39 (borders)
- **Font**: Inter (Google Fonts), SF Mono fallback for code

## Component Breakdown
| Component | Approach |
|-----------|----------|
| Nav | Sticky flexbox, JS toggle for mobile hamburger, smooth scroll |
| Hero | Full-viewport band, flex column, max-width container |
| Feature cards | CSS grid, 2-col desktop, 1-col mobile, hairline borders |
| Testimonials | Flexbox row, 3 cards, avatar circles with initials |
| Pricing | CSS grid, 3 cols, featured card highlighted with border |
| FAQ | Details/summary HTML elements, no JS needed for basic accordion |
| Waitlist form | Styled inputs, JS validation, localStorage mock submit |
| Footer | Flexbox row, stacked on mobile |

## Responsive Breakpoints
- Mobile: < 768px (1-col grids, smaller type)
- Tablet: 768-1023px (2-col grids)
- Desktop: >= 1024px (full layout)

## Performance Targets
- Lighthouse: 95+ Performance, 100 Accessibility
- Total page weight: < 150KB (including Google Fonts)
- No render-blocking resources beyond Inter font

## SEO
- Meta tags (description, OG tags)
- Semantic HTML structure (header, main, section, footer)
- Alt text on all images/illustrations
- robots.txt
