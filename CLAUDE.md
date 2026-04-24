# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mission
Build a single-page personal portfolio website for a data engineer.
Target audience: hiring managers, recruiters, and technical peers.
Goal: strong first impression, communicates expertise quickly.
Aesthetic: warm and editorial — think a well-designed print magazine, not a tech startup landing page.

---

## Sections (in order, no others)
1. **Masthead** — name, title ("Data Engineer"), contact strip (email + LinkedIn)
2. **About** — 2–3 sentence editorial intro describing what the person does and why it matters
3. **Work experience** — timeline, most recent first. Each entry: year range, title, company, 1–2 sentence description
4. **Skills** — grouped grid: Languages / Platforms & Tools / Infrastructure

No projects section. No contact form. No blog. Do not add sections not listed here.

---

## Tech stack
- Plain HTML + CSS + minimal vanilla JS only — no framework, no npm, no bundler
- Output: single `index.html` + `style.css` (linked, not inline)
- Fonts: Google Fonts — use Playfair Display (headings) + DM Sans (body)
- Responsive via CSS Grid and media queries only
- Must open correctly by double-clicking `index.html` — no dev server required

---

## Design constraints
- Background: warm off-white (#FAF8F4 or similar) — not white, not dark
- Do NOT use: purple gradients, glassmorphism, card-heavy layouts, generic dev-portfolio aesthetics
- Typography-led design — let the type do the work
- Spacing: generous. Whitespace is intentional
- Animations: none, or subtle scroll fade-in only

---

## Content placeholders
Mark all personal content clearly so the user can fill it in:
- `[YOUR NAME]`
- `[YOUR EMAIL]`
- `[YOUR LINKEDIN URL]`
- `[COMPANY NAME]`, `[YEAR RANGE]` — repeat per job
- `[YOUR BIO]` — 2–3 sentences

---

## CSS file structure
Four linked CSS files — do not consolidate into one:

| File | Owns |
|------|------|
| `typography.css` | Fonts, heading scale, body text, editorial type system |
| `layout.css` | Page grid, masthead, section spacing |
| `components.css` | Timeline, skills grid, specific UI pieces |
| `responsive.css` | All media queries, mobile breakpoints |

**Shared CSS class contract — do not rename these:**
`.masthead`, `.about`, `.timeline`, `.job`, `.job-year`, `.job-content`, `.skills-grid`, `.skill-group`

All four CSS files must be linked in `index.html` `<head>` in this order:
`typography.css` → `layout.css` → `components.css` → `responsive.css`
