# Pomodoro Cube

Reszponzív Pomodoro-időzítő React, TypeScript, Vite és Zustand használatával. A kocka CSS 3D transzformációkkal készült; húzással vagy a módválasztóval forgatható.

## Indítás

```bash
npm install
npm run dev
```

Éles build és lint:

```bash
npm run build
npm run lint
```

## Használat

A kocka felhasználó felé néző oldala határozza meg az aktív módot. A váltás a forgatási animáció végén történik: az előző mód időzítője megáll és visszaáll a teljes időtartamára, az új mód időzítője pedig elindul. Egyszerre csak egy időzítő futhat.

| Oldal | Mód | Időtartam |
| --- | --- | ---: |
| Front | Focus | 50 perc |
| Right | Short Break | 5 perc |
| Back | Long Break | 15 perc |
| Left | Reset | 1 perc |
| Top | Deep Work | 25 perc |
| Bottom | Custom | 10 perc |

Az időzítőt a vezérlőpanelen indíthatod, szüneteltetheted vagy visszaállíthatod. A hatmódos gyorsválasztó animálva a megfelelő oldalra forgatja a kockát.
