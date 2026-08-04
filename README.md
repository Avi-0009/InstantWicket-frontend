# 🏏 InstantWicket Frontend

The modern, interactive web client for **InstantWicket**—a real-time cricket scoring and analytics application designed for fast, intuitive ball-by-ball updates and detailed match insights.

Live Application: [instant-wicket-stryker.vercel.app](https://instant-wicket-stryker.vercel.app/)

---

## 🚀 Tech Stack

*   **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + Shadcn UI
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Data Fetching & Caching:** [TanStack React Query](https://tanstack.com/query/latest)
*   **Form & Schema Validation:** Zod
*   **Deployment:** Vercel

---

## ✨ Features

*   **⚡ Real-Time Live Scoring:** Interactive scoring pad for recording runs, extras, wickets, and overs with instant UI updates.
*   **📊 Match & Player Analytics:** Visual breakdown of run rates, partnerships, bowling figures, and player career statistics.
*   **🎯 Match Setup Wizard:** Multi-step workflow to configure teams, select playing XIs, assign captains, and set up match rules.
*   **📱 Responsive & Adaptive UI:** Mobile-first layout with smooth transitions, custom dark/light theme support, and splash overlays.
*   **🔐 Authentication:** Secure JWT-based login and sign-up with protected routes.

---

## 📁 Project Structure

```text
src/
├── Api/            # API client configurations (Auth, Match, Scoring)
├── assets/         # Static images, graphics, and branding icons
├── components/     # Reusable UI components
│   ├── auth/       # Login and sign-up overlays & forms
│   ├── common/     # Header, navbar, and protected route wrappers
│   ├── matches/    # Match cards, summaries, and innings views
│   ├── scoring/    # Scoring pad, over timeline, and analytics widgets
│   └── ui/         # Base UI elements (buttons, selects, modals)
├── hooks/          # React Query hooks for queries & mutations
├── layouts/        # Page layout wrappers
├── pages/          # Application views (Dashboard, LiveScoring, Stats, Settings)
├── schemas/        # Zod validation schemas
├── store/          # Zustand global stores (Auth, Theme, MatchWizard)
└── utils/          # Helper functions and formatters
