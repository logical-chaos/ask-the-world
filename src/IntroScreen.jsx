
import { useEffect, useState } from "react";
import "./IntroScreen.css";

export default function IntroScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 1900);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`intro-screen ${exiting ? "intro-exit" : ""}`}
      aria-label="Ask the World loading"
    >
      <div className="intro-content">
        <div className="intro-symbol" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <g className="intro-rays">
              <path d="M50 10 V90 M10 50 H90 M22 22 L78 78 M78 22 L22 78" />
              <path d="M50 3 V17 M50 83 V97 M3 50 H17 M83 50 H97" />
            </g>
            <circle cx="50" cy="50" r="8" />
            <circle className="intro-center" cx="50" cy="50" r="3" />
          </svg>
        </div>

        <h1 className="intro-title">
          ask the world<span>.</span>
        </h1>

        <p className="intro-tagline">
          Every question opens a world of possibilities.
        </p>

        <div className="intro-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
