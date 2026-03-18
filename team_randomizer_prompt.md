# 🎲 Team Randomizer — Full Product Specification
> A single-admin, game-inspired web app for generating balanced corporate teams with drag-and-drop interaction, constraint balancing, and Slack-ready export.

---

## 1. Product Overview

Build a **single-page web application** called **"Team Randomizer"** that allows one admin user to input a list of coworkers, assign optional metadata (skill level, department), configure team sizing rules, and generate visually balanced teams. The interface should feel like a **fun, lightweight 2D game** — not a spreadsheet. No data is persisted between sessions; every page load starts fresh.

---

## 2. Tech Stack

- **Framework:** React (with hooks)
- **Styling:** Tailwind CSS utility classes only (no custom CSS files)
- **Drag and Drop:** `@dnd-kit/core` and `@dnd-kit/sortable`
- **Icons:** `lucide-react`
- **No backend. No database. No authentication.** All state lives in React memory for the duration of the session.

---

## 3. Visual Design System

### 3.1 Vibe
Playful, colorful, 2D game aesthetic. Think a board game meets a corporate org chart. Bright but not garish. Clean pixel-inspired UI with rounded corners, bold colors, and subtle drop shadows.

### 3.2 Color Palette
| Role | Color |
|---|---|
| Background | `#1a1a2e` (deep navy) |
| Surface / Card | `#16213e` |
| Primary accent | `#e94560` (red-pink) |
| Secondary accent | `#0f3460` (dark blue) |
| Team colors (up to 8) | Bright distinct hues: `#FF6B6B`, `#FFD93D`, `#6BCB77`, `#4D96FF`, `#C77DFF`, `#FF9A3C`, `#00C9A7`, `#F72585` |
| Text primary | `#FFFFFF` |
| Text muted | `#8892a4` |

### 3.3 Typography
- Font: `'Press Start 2P'` from Google Fonts for headings/labels (pixel game feel)
- Body/UI text: `'Inter'` for readability
- All font imports must be included in the `<head>`

### 3.4 People Avatars
Each person is represented as a **minimal 2D pixel-art style SVG character** — a small figure (approximately 40×56px) with:
- A round head, simple body, arms, legs
- **Two variants:** male-presenting and female-presenting silhouettes (user assigns per person, defaults to random)
- The avatar's **shirt/body color** matches their assigned team color
- A small **name label** below the avatar (truncated at 10 chars)
- A small colored **skill badge** on the top-right corner (green = Senior, yellow = Mid, red = Junior, gray = unset)
- A small **department tag** pill below the name

---

## 4. Application Layout

The app has **three main screens/views** that transition smoothly (no page reloads):

```
[ Screen 1: Roster Setup ] → [ Screen 2: Team Arena ] → [ Screen 3: Export ]
```

A persistent top bar shows the app name ("🎲 Team Randomizer"), current screen indicator, and a "Start Over" button that resets all state.

---

## 5. Screen 1 — Roster Setup

### 5.1 Purpose
The user inputs all participants and their optional metadata before generating teams.

### 5.2 Layout
- Full-width centered card on dark background
- Title: "**Who's Playing?**"
- Subtitle: "Add your team members below. Skill level and department are optional but help balance teams."

### 5.3 Adding People

**Input Row (repeated per person):**
Each person entry is a horizontal row containing:
1. **Name field** — text input, placeholder: "Name"
2. **Gender toggle** — small icon button cycling through: 🧑 (neutral, default) → 👨 (male) → 👩 (female)
3. **Skill dropdown** — options: `— (unset)`, `Junior`, `Mid`, `Senior`
4. **Department field** — free-text input, placeholder: "Dept (optional)"
5. **Remove button** — small `×` icon, removes row

**Bulk add:** A textarea above the row list with placeholder:
> "Paste names here, one per line, then click Add All"

A button "**＋ Add All**" parses the textarea line-by-line, creates a row per name, and clears the textarea.

**"＋ Add Person" button** adds a single empty row at the bottom.

Minimum 2 people required to proceed.

### 5.4 Team Configuration Panel
Below the person list, a configuration panel titled "**Team Setup**":

- **Mode toggle:** Two large toggle buttons — "**By Number of Teams**" | "**By Team Size**"
  - If "By Number of Teams": show a number input (min 2, max 10), label: "How many teams?"
  - If "By Team Size": show a number input (min 2, max 20), label: "People per team?" — app auto-calculates number of teams and shows a note like "→ Creates ~4 teams"
- **Balance priority radio group:**
  - ○ Skill level first
  - ○ Department first
  - ○ Equal mix of both *(default)*
  - ○ Fully random (ignore constraints)

### 5.5 Generate Button
A large, prominent button at the bottom: "**🎲 Randomize Teams!**"
- Disabled with tooltip if fewer than 2 people are entered
- On click: runs the balancing algorithm, transitions to Screen 2 with a short animation (cards "fly in")

---

## 6. Balancing Algorithm

The algorithm must be implemented in a pure JavaScript function `generateTeams(people, config)`.

### Inputs
```js
people: [{ id, name, gender, skill, department }]
config: { mode: 'byCount' | 'bySize', value: number, priority: 'skill' | 'dept' | 'both' | 'random' }
```

### Logic

1. **Shuffle** the people array using Fisher-Yates shuffle.
2. **If priority is `random`:** distribute people round-robin into N teams. Done.
3. **If priority is `skill`:**
   - Sort people by skill (Senior → Mid → Junior → unset)
   - Use a **snake draft** pattern to distribute: assign person 1 to team 1, person 2 to team 2, ..., person N to team N, person N+1 to team N, person N+2 to team N-1, etc. (snake/zigzag order)
4. **If priority is `dept`:**
   - Group people by department
   - Distribute departments across teams so no team is majority one department
   - Within each department group, shuffle before distributing
5. **If priority is `both`:**
   - Run skill-based snake draft first
   - Then post-process: for each team, if two+ people share a department, attempt to swap one with a same-skill person from another team who has a different department
6. **Team size handling:** if people don't divide evenly, distribute remainder one per team starting from team 1 (some teams get +1 person)

### Output
```js
[{ teamId, teamName, color, members: [person] }]
```

Team names default to "Team 1", "Team 2", etc. They are editable.

---

## 7. Screen 2 — Team Arena

### 7.1 Purpose
The visual, game-like main view where the user sees their generated teams as **tables with chairs**, can drag people between tables, re-roll teams, and edit team names.

### 7.2 The Table Metaphor

Each team is represented as a **top-down 2D illustration of a round table with chairs**:
- The table is a filled circle in the team's assigned color (semi-transparent, e.g. 60% opacity), with a darker border
- Chairs are smaller circles arranged evenly around the table perimeter (one chair per team slot/max size)
- **Occupied chairs** show the person's avatar sitting in the chair
- **Empty chairs** (when team has fewer than max people) show a faint dashed circle outline
- The **team name** is displayed in the center of the table as editable text (click to rename)
- A small **balance score badge** sits above the table (e.g. "⚖️ Balanced" or "⚠️ Skewed") based on skill/dept distribution

Tables are laid out in a **grid** (max 3 per row, wrapping), with comfortable spacing on the dark background.

### 7.3 The Bench (Unassigned Pool)

At the bottom of the screen, a horizontal "**Bench**" zone labeled "🪑 Bench — Drag people here to remove from teams":
- Shows any unassigned people as draggable avatars
- Initially empty
- People dragged off a table land here

### 7.4 Drag and Drop Behavior

Using `@dnd-kit`:
- **Drag a person from a table** → they lift off their chair (chair becomes empty/dashed), follow cursor
- **Drop onto another table** → they sit in an empty chair. If the target table is full, the drop is rejected (table briefly flashes red)
- **Drop onto the bench** → person is unassigned
- **Drag from bench to table** → person takes an empty chair
- **Swap:** If user drops a person onto an *occupied* chair, the two people **swap teams** automatically
- Smooth CSS transition animations on all drag operations
- Avatar shows a slight scale-up and drop shadow while being dragged

### 7.5 Control Bar (above the arena)

A horizontal toolbar with:
- **"🔀 Re-roll All"** — re-runs the algorithm with the same config, replaces all teams (with confirmation modal: "This will reset all your manual swaps. Continue?")
- **"🔀 Re-roll Team ▾"** — dropdown to select a specific team to re-shuffle (only shuffles that team's members with random replacements from other teams)
- **"⚖️ Balance Check"** — opens a side panel showing balance metrics (see 7.6)
- **"👁 Toggle Names"** — show/hide name labels under avatars
- **"➡ Export"** — advances to Screen 3

### 7.6 Balance Check Side Panel

A slide-in panel from the right showing:
- Per-team breakdown table: Team Name | Members | Skill spread (e.g. "2 Senior, 1 Mid, 1 Junior") | Departments represented
- Overall score: color-coded "Balanced / Slightly Skewed / Unbalanced" with a simple bar chart per team showing skill composition
- A tip: "💡 Drag a Senior from Team 2 to Team 4 to improve balance"

---

## 8. Screen 3 — Export

### 8.1 Layout
Clean centered card. Title: "**📋 Your Teams Are Ready!**"

### 8.2 Visual Summary
A compact read-only grid of team cards (no drag/drop) showing each team with member names — a quick visual confirmation.

### 8.3 Export Formats

**Slack Format (Copy to Clipboard button):**
Generates a formatted plaintext block:

```
🎲 *Team Randomizer Results*
━━━━━━━━━━━━━━━━━━━━━━

🔴 *Team Phoenix*
• Alice (Senior · Engineering)
• Bob (Mid · Design)
• Carol (Junior · Product)

🟡 *Team Nova*
• Dan (Senior · Marketing)
• Eve (Mid · Engineering)
• Frank (unset · Sales)

━━━━━━━━━━━━━━━━━━━━━━
Generated by Team Randomizer
```

Each team uses a matching emoji circle color. On click, the text is copied to clipboard and the button briefly shows "✅ Copied!"

**CSV Format (Download button):**
Downloads a `.csv` file named `teams-YYYY-MM-DD.csv` with columns:
`Team Name, Member Name, Skill Level, Department`

### 8.4 Action Buttons
- **"← Back to Arena"** — returns to Screen 2 (state preserved)
- **"🔁 Start Over"** — resets everything, goes to Screen 1 (with confirmation)

---

## 9. Micro-interactions & Polish

- **Page transition:** screens slide in from the right, slide out to the left
- **Generate button:** brief "rolling dice" spinner animation (🎲 spins) for ~800ms before teams appear
- **Avatar hover:** tooltip showing full name, skill, department
- **Table hover:** subtle glow ring around the table
- **Re-roll animation:** avatars briefly scatter and re-settle (CSS keyframe)
- **Empty state:** if fewer than 2 people entered, show a friendly illustration with text "Add at least 2 people to get started!"
- **Confetti burst** (CSS only, no libraries) when clicking "Export" for the first time

---

## 10. Constraints & Edge Cases to Handle

| Scenario | Behavior |
|---|---|
| Odd number of people | Some teams get one extra person, noted with a "+1" badge on that table |
| All same department | Balance check shows warning but still generates teams |
| Only 1 skill level used | Skill balancing skips gracefully, uses random distribution |
| User sets team size larger than total people | Show validation error: "Not enough people for that team size" |
| User sets 1 team | Show validation error: "Need at least 2 teams" |
| Name is empty string | Row is ignored during generation, highlighted in red |
| Dragging to a full table | Table flashes red, drop rejected, person returns to origin |

---

## 11. Component Structure (suggested)

```
App
├── TopBar
├── Screen1_RosterSetup
│   ├── BulkAddTextarea
│   ├── PersonRow (×N)
│   └── TeamConfigPanel
├── Screen2_TeamArena
│   ├── ControlBar
│   ├── ArenaGrid
│   │   └── TeamTable (×N)
│   │       ├── TableSVG (the round table illustration)
│   │       ├── ChairSlot (×N) → PersonAvatar
│   │       └── TeamNameEditor
│   ├── Bench
│   ├── BalanceCheckPanel (slide-in)
│   └── ConfirmModal
└── Screen3_Export
    ├── TeamSummaryGrid
    ├── SlackExportBlock
    └── CSVDownloadButton
```

---

## 12. What NOT to Build

- No user accounts or login
- No cloud sync or database
- No real Slack API integration (copy-paste only)
- No mobile-first layout (desktop/tablet is the target)
- No CSV *import* (manual entry only)
- No dark/light mode toggle (dark only)
