<div align="center">

# ⏱️ Employee Time Tracker

### A modern, role-aware weekly timesheet — built as an Airtable Custom Extension

[![Airtable Blocks SDK](https://img.shields.io/badge/Airtable-Blocks_SDK_1.18-2d7ff9?logo=airtable&logoColor=white)](https://airtable.com/developers/extensions)
[![React](https://img.shields.io/badge/React-16.14-61dafb?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-10b981.svg)](./LICENSE.md)

*Log hours per task, per day, per week — straight into your Airtable base.*

</div>

---

## ✨ Overview

**Employee Time Tracker** is a polished Airtable extension that turns any base into a weekly
timesheet. Team members log in automatically via their Airtable identity, see only what their
role allows, and record hours against tasks — every keystroke synced to a real Airtable table.

No REST API, no external backend. Everything runs inside Airtable through the **Blocks SDK**, so
your data never leaves your base.

---

## 🎯 Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Automatic auth** | Detects the signed-in Airtable collaborator and matches them to a `Users` table by email — no passwords. |
| 🧭 | **Role-based access** | `Employee` / `Admin` get the tracker; `Manager` gets a dashboard placeholder; unknown roles are gated. |
| 👋 | **Welcome screen** | A branded identity-confirmation gate showing name, email, role, and avatar before entering. |
| 🗓️ | **Weekly timesheet** | One row per task × seven day columns, with live per-row and weekly totals. |
| ✅ | **Smart validation** | Numbers only, `0–24` range, no negatives, inline errors — commits on blur (one write, not per keystroke). |
| 🔄 | **Live two-way sync** | Reads and writes the `Time Entries` table in real time via the SDK. |
| 🧱 | **Zero-config-code mapping** | Map your tables/fields visually with `TablePicker` / `FieldPicker`; stored in `GlobalConfig`. |
| 🏷️ | **Rich records** | Optionally stamps **Project** and **logged-by user** onto every entry. |
| ◀ ▶ | **Week navigation** | Jump between weeks or pick a date; data reloads per week. |
| 🌱 | **Sample-data seeder** | One click populates demo Projects, Tasks, and a week of entries for testing. |
| 🎨 | **Modern UI** | Gradient design system, glassy cards, responsive layout, and full dark-mode support. |

---

## 🖼️ Screens

> _Add screenshots/GIFs here once running (`block run`)._

```
┌──────────────────────────────────────────────────────────┐
│  ⏱  Employee Time Tracker            👤 Logged in as Rahat │
├──────────────────────────────────────────────────────────┤
│  Project ▾   Task ▾                          [ + Add Task ]│
├──────────────────────────────────────────────────────────┤
│  Weekly Timesheet · Jun 22–28        Logged by Rahat       │
│  Project   Task        Mon Tue Wed Thu Fri Sat Sun  Total  │
│  Website   Design        4   6   3   5   2   0   0    20   │
│  Mobile    QA & Testing  2   3   4   3   5   0   0    17   │
├──────────────────────────────────────────────────────────┤
│                          Weekly Total: 37 Hours            │
│  ◀ Previous Week     📅  Jun 22 – Jun 28, 2026   Next ▶    │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data model

The extension expects four tables. Field/table **names are flexible** — you map them in Settings
(except `Users`, which is matched by name for authentication).

| Table | Fields | Purpose |
|---|---|---|
| **Users** | `Name` (text), `Email` (email), `Role` (single select: `Employee` / `Manager` / `Admin`) | Auth & role gating |
| **Projects** | `Name` (text) | Project list (auto-detected from the Tasks link) |
| **Tasks** | `Name` (text), `Project` (link → Projects) | The work being tracked |
| **Time Entries** | `Task` (link → Tasks), `Date` (date), `Hours` (number) | One record per task per day |

**Optional** `Time Entries` fields — map them to enrich each record:

| Field | Type | Stores |
|---|---|---|
| `Project` | link → Projects | The task's project |
| `Logged By` | link → Users | The logged-in user |

---

## 🚀 Getting started

### Prerequisites
- An Airtable base with the tables above
- [Airtable Blocks CLI](https://airtable.com/developers/extensions/guides/getting-started) — `npm install -g @airtable/blocks-cli`
- Node.js 16+

### Install & run
```bash
# 1. Install dependencies
npm install

# 2. Start the local dev server
block run

# 3. In Airtable: Extensions → Edit extension → point at the localhost URL shown
```

### First-time configuration
1. **Register yourself** — add a row to the `Users` table where `Email` equals your Airtable
   login email and `Role` is `Employee` or `Admin`. _(The "not registered" screen shows the exact
   email to use.)_
2. Click **Continue** on the welcome screen.
3. Open ⚙️ **Settings** and map your **Tasks** / **Time Entries** tables and fields → **Done**.
4. _(Optional)_ Click **Load sample data** to populate demo records, then start logging hours.

---

## 🧩 Architecture

Clean separation between Airtable data logic and presentational UI.

```
frontend/
├── index.tsx                 # Block entry point
├── settings.ts               # GlobalConfig keys + useSettings() resolver
├── constants.ts              # Weekdays, hour bounds, shared constants
├── types.ts                  # Shared TypeScript interfaces
│
├── hooks/
│   └── useCurrentUser.ts     # 🔐 Auth: session → Users-table lookup (SDK only)
│
├── utils/
│   ├── dateUtils.ts          # Timezone-safe week math
│   └── seedSampleData.ts     # Dev-only sample-data generator
│
└── components/
    ├── App.tsx               # Root: auth gate → role routing → tracker
    ├── WelcomeScreen.tsx     # Identity confirmation
    ├── Header.tsx            # Brand + logged-in user
    ├── SettingsForm.tsx      # Table/field pickers (GlobalConfig)
    ├── SampleDataButton.tsx  # Seeder trigger
    ├── TimeTrackerApp.tsx    # 🧠 Connected timesheet (read/write records)
    ├── Filters.tsx           # Project / Task dropdowns + Add Task
    ├── TimesheetTable.tsx    # Grid: Project · Task · Mon–Sun · Total
    ├── HourInput.tsx         # Validated numeric cell
    ├── WeeklyTotal.tsx       # Auto-computed total banner
    ├── WeekNavigation.tsx    # Prev / next / date picker
    └── CenteredMessage.tsx   # Loading / error / gating states
```

**Design principles**
- 🧠 **Logic in hooks/utils** — components stay presentational.
- 🔒 **Type-safe** — discriminated unions model every auth/loading state.
- 🎛️ **Config over code** — tables/fields mapped via UI, persisted in `GlobalConfig`.
- 🎨 **Styling in one place** — all CSS in `style.css`; components carry class names only.

---

## 🔁 How it works

```
Airtable session
   └─▶ useCurrentUser()  ── matches email ──▶  Users table
          │
          ├─ loading      → spinner
          ├─ unregistered → "contact your administrator"
          └─ ready ─▶ Welcome ─▶ role?
                                  ├─ Manager           → dashboard (coming soon)
                                  └─ Employee / Admin   → Time Tracker
                                                            ├─ read  Time Entries  → grid
                                                            └─ write Time Entries  ← hour edits
```

Editing a cell creates, updates, or deletes a `Time Entries` record — and the live `useRecords`
subscription re-renders the grid automatically.

---

## 🛠️ Tech stack

- **[Airtable Blocks SDK](https://airtable.com/developers/extensions) 1.18** — data, session, UI primitives
- **React 16.14** with Hooks
- **TypeScript 5.4** — strict, modular types
- **CSS custom properties** — gradient design system + dark mode

---

## 🧪 Scripts

```bash
npm run lint        # ESLint over the frontend
block run           # Local dev server
block release       # Publish the extension to your base
```

---

## 🗺️ Roadmap

- [ ] Manager dashboard (team rollups & approvals)
- [ ] Filter entries to the logged-in user
- [ ] Monthly / custom date ranges
- [ ] CSV export
- [ ] Per-user "remember welcome" preference

---

## 📄 License

Released under the [MIT License](./LICENSE.md).

<div align="center">

Built with ❤️ on the Airtable Blocks SDK

</div>
