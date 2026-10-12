import { useEffect, useRef } from "react";
import Cube from "./components/Cube/Cube";
import { useTimerStore } from "./store/useTimerStore";
import "./App.css";

const statusLabels = {
  idle: "Készen áll",
  running: "Fókuszban",
  paused: "Szüneteltetve",
  finished: "Lejárt az idő",
};

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}

export default function App() {
  const status = useTimerStore((s) => s.timerStatus);
  const remaining = useTimerStore((s) => s.remainingSeconds);
  const rotating = useTimerStore((s) => s.isRotating);
  const topDuration = useTimerStore((s) => s.topDuration);
  const rotateCube = useTimerStore((s) => s.rotateCube);
  const startTimer = useTimerStore((s) => s.startTimer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const resetTimer = useTimerStore((s) => s.resetTimer);
  const tick = useTimerStore((s) => s.tick);
  const audioContextRef = useRef(null);
  const previousStatus = useRef(status);

  useEffect(() => {
    if (status !== "running") return undefined;
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [status, tick]);

  useEffect(() => {
    if (status === "finished" && previousStatus.current !== "finished") {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const context = audioContextRef.current || new AudioContextClass();
          audioContextRef.current = context;
          if (context.state === "suspended") context.resume().catch(() => {});
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(660, context.currentTime);
          oscillator.frequency.setValueAtTime(880, context.currentTime + 0.16);
          gain.gain.setValueAtTime(0.0001, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.12,
            context.currentTime + 0.02
          );
          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + 0.45
          );
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.46);
        }
      } catch {
        // Audio may be unavailable or blocked; visual completion state remains.
      }
    }
    previousStatus.current = status;
  }, [status]);

  useEffect(
    () => () => {
      if (audioContextRef.current)
        audioContextRef.current.close().catch(() => {});
    },
    []
  );

  const handleStart = () => {
    if (status === "paused") resumeTimer();
    else startTimer();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Forma kezdőlap">
          <span className="brand-icon">
            <span />
          </span>
          <span>
            forma<span className="brand-period">.</span>
          </span>
        </a>
        <div className="topbar-note">
          <span className="live-dot" /> MINDFUL TIME, MADE TANGIBLE
        </div>
        <div className="topbar-index">FT—001</div>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow">
          <span>01</span>
          <span className="eyebrow-line" /> A FÓKUSZ ÚJ FORMÁJA
        </div>
        <h1>
          Találd meg a<br />
          <em>saját ritmusod.</em>
        </h1>
        <p className="hero-description">
          Egyetlen mozdulat. Egy tiszta szándék.
          <br className="desktop-break" /> Hagyd, hogy az idő a fókuszodhoz
          igazodjon.
        </p>
      </section>

      <section className="workspace" aria-label="Időzítő">
        <div className="side-note side-note-left">
          <span className="side-note-number">01 / 04</span>
          <span className="side-note-rule" />
          <span>TAKTIKUS IDŐKEZELÉS</span>
        </div>
        <Cube />
        <div className="side-note side-note-right">
          <span className="side-note-number">EST. 2026</span>
          <span className="side-note-rule" />
          <span>KEVESEBB ZAJ. TÖBB JELENLÉT.</span>
        </div>
      </section>

      <section className="controls-panel">
        <div
          className={`timer-status ${
            status === "finished" ? "status-finished" : ""
          }`}
        >
          <span className="status-indicator" />
          <span>{statusLabels[status]}</span>
          <span className="status-divider">/</span>
          <span className="status-time">{formatTime(remaining)}</span>
        </div>
        <div className="controls">
          <button
            className="button button-secondary rotate-button"
            onClick={rotateCube}
            disabled={rotating}
            type="button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.5 8.5A8 8 0 0 1 18 5.2L20 7.5M20 3.5v4h-4M19.5 15.5A8 8 0 0 1 6 18.8L4 16.5M4 20.5v-4h4" />
            </svg>
            Forgatás
          </button>
          {status === "running" ? (
            <button
              className="button button-primary"
              onClick={pauseTimer}
              type="button"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5v14M15 5v14" />
              </svg>
              Szüneteltetés
            </button>
          ) : (
            <button
              className="button button-primary"
              onClick={handleStart}
              disabled={rotating || status === "finished"}
              type="button"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 5 11 7-11 7z" />
              </svg>
              {status === "paused" ? "Folytatás" : "Indítás"}
            </button>
          )}
          <button
            className="button button-icon"
            onClick={resetTimer}
            disabled={rotating}
            type="button"
            aria-label="Időzítő újraindítása"
            title="Újraindítás"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 4v6h6M5.6 15a7 7 0 1 0 .6-7.5L4 10" />
            </svg>
          </button>
        </div>
        <p className="controls-hint">
          {status === "finished"
            ? "A kör véget ért. Állítsd vissza az időzítőt, és kezdj egy új fókuszblokkot."
            : status === "running"
            ? "Maradj a jelenben. A hátralévő idő már csak magáért beszél."
            : status === "paused"
            ? "A szünet bármikor folytatható, pontosan innen."
            : `Fordítsd el a kockát, válassz időtartamot, majd indítsd el a ${topDuration} perces fókuszblokkot.`}
        </p>
      </section>

      <footer className="footer">
        <span>FORMA® — TUDATOS IDŐHASZNÁLAT</span>
        <span className="footer-center">
          DESIGNED TO SLOW YOU DOWN <span>✳</span>
        </span>
        <span>© 2026 / FOCUS SERIES</span>
      </footer>
    </main>
  );
}
