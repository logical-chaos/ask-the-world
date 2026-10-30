import { useEffect, useState } from "react";
import "./IntroScreen.css";
import BluLogo from "./components/BluLogo";

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
      aria-label="blu loading"
    >
      <div className="intro-content">
        <div className="intro-symbol" aria-hidden="true">
          <BluLogo size={80} showWordmark={false} animated={true} />
        </div>

        <h1 className="intro-title">
          blu
        </h1>

        <p className="intro-tagline">
          Where curiosity, experience, and people meet.
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
