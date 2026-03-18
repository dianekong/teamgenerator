# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

There is no test suite configured.

## Architecture

Single-page React app (React 19, Vite 7, Tailwind CSS v4, JavaScript/JSX — no TypeScript). All state lives in React memory; no backend or persistence.

**Three screens** managed by `src/App.jsx`:
- `roster` → `src/screens/RosterSetup.jsx` — person input, bulk add, team config
- `arena` → `src/screens/TeamArena.jsx` — drag-and-drop table view
- `export` → `src/screens/Export.jsx` — Slack copy + CSV download

**Key dependencies:**
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop across tables and bench
- `lucide-react` — icons
- `@tailwindcss/vite` — Tailwind v4 via Vite plugin (no `tailwind.config.js` needed; theme tokens defined in `src/index.css` under `@theme`)

**Data flow:**
- `people` (roster) and `config` (team settings) live in `App.jsx`, passed down as props
- On generate: `generateTeams(people, config)` from `src/utils/generateTeams.js` returns `teams[]`, which replaces arena state
- `teams[]` shape: `[{ teamId, teamName, color, members: [person] }]` — `members` is a plain array, no fixed chair slots; the arena renders empty chairs for `maxSize - members.length` extra slots
- `bench` is a separate array of unassigned people

**DnD architecture (TeamArena):**
- Each person is `useDraggable({ id: person.id })`
- Each chair slot is `useDroppable({ id: \`${teamId}::slot-${i}\` })`
- Table center circle is `useDroppable({ id: \`${teamId}::table\` })` — dropping here appends to team; rejects with red flash if team is full
- Bench is `useDroppable({ id: 'bench' })`
- `onDragEnd` in `TeamArena` resolves moves/swaps by mutating copies of `teams` and `bench`

**Team name editing:** inline input inside the table circle; commits via `onRename` callback that calls `setTeams` in the parent — do not mutate the `team` prop directly (ESLint `react-hooks/immutability` will flag it).

**Styling:** Tailwind utility classes only. Custom design tokens (`--color-navy`, `--color-surface`, etc.) are in `src/index.css @theme`. Team colors are dynamic inline styles from `TEAM_COLORS` in `generateTeams.js`. Dark-only UI — no light mode.

**Confetti:** CSS-only in `src/screens/Export.jsx`. Confetti piece data is pre-generated at module level (not inside a component) to avoid the `react-hooks/purity` ESLint rule.
