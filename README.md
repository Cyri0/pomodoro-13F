# Pomodoro Cube

A pomodoro timer modelled on the physical flip-cube timers in `design_ideas/`.
The face on top of the cube is the active preset — roll the cube to change it.

| Face   | Preset      | Minutes |
| ------ | ----------- | ------- |
| top    | Focus       | 25      |
| right  | Short break | 5       |
| bottom | Long break  | 15      |
| left   | Deep work   | 50      |

After a work session the cube rolls to a short break (a long break every 4th
session); after a break it rolls back to Focus.

**Controls:** `Space` start/pause · `←` `→` roll the cube · `R` reset · click
the screen to start/pause · click a side face to flip to it.

## Develop

```bash
npm install
npm run dev
```

- `src/store.ts` — timer state (Zustand), presets and pomodoro cycle logic
- `src/components/Cube.tsx` — CSS 3D cube and flip animation
- `src/components/Display.tsx` — round screen with tick ring and 7-segment digits
