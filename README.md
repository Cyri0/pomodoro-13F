# FOCUS CUBE

A production-style Pomodoro timer built with React, TypeScript, Vite, Zustand, and Tailwind CSS. The centerpiece is a genuine CSS 3D cube: each face maps to a period in the cycle, and the cube rotates to that face when a period ends.

## Scripts

```bash
npm install
npm run dev      # local development server
npm test         # Vitest unit and interaction tests
npm run build    # TypeScript check and production build
npm run preview  # preview the production build
```

Open the printed local URL (typically `http://localhost:5173`).

## Cycle

`Focus → Short Break → Focus → Short Break → … → Long Break → Repeat`

Defaults: 25-minute focus, 5-minute short break, 15-minute long break, and 4 focus sessions before a long break. Those values are configurable in Settings. Controls lock while the timer is running. Applying settings while paused restarts the current period with the new duration. Reset returns the cube to the first focus face and clears completed sessions for this run. Skip advances without counting a focus session as complete.

The countdown is deadline-based (`deadlineAt - now`) so background-tab throttling cannot display negative time or fire duplicate transitions.
