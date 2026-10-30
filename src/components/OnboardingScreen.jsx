import { useState } from 'react';
import './OnboardingScreen.css';
import BluLogo from './BluLogo';

const onboardingSteps = [
  {
    step: 1,
    badge: '01 / 03 · CURIOSITY',
    title: 'Curiosity starts here.',
    description: "Ask what you've always wondered.",
    illustration: (
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="onboarding-svg"
        aria-hidden="true"
      >
        <circle cx="70" cy="70" r="58" fill="#f5f0ff" />
        <circle cx="56" cy="62" r="34" fill="#c4b5fd" fillOpacity="0.45" />
        <circle cx="84" cy="76" r="36" fill="#93c5fd" fillOpacity="0.45" style={{ mixBlendMode: 'multiply' }} />
        {/* Soft question mark curve */}
        <path
          d="M 64 54 C 64 47, 76 47, 76 54 C 76 61, 70 63, 70 72"
          stroke="#7354b8"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="70" cy="85" r="3" fill="#7354b8" />
      </svg>
    ),
  },
  {
    step: 2,
    badge: '02 / 03 · EXPERIENCE',
    title: 'Your experience matters.',
    description: "Share what you've learned, discovered, and experienced.",
    illustration: (
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="onboarding-svg"
        aria-hidden="true"
      >
        <circle cx="70" cy="70" r="58" fill="#eff6ff" />
        <ellipse cx="62" cy="68" rx="36" ry="28" fill="#93c5fd" fillOpacity="0.5" />
        <ellipse cx="78" cy="72" rx="36" ry="28" fill="#c4b5fd" fillOpacity="0.5" style={{ mixBlendMode: 'multiply' }} />
        {/* Open book / reflection wings */}
        <path
          d="M 50 82 C 60 76, 68 78, 70 85 C 72 78, 80 76, 90 82"
          stroke="#7354b8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 50 62 C 60 56, 68 58, 70 65 C 72 58, 80 56, 90 62"
          stroke="#7354b8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line x1="70" y1="65" x2="70" y2="85" stroke="#7354b8" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: 3,
    badge: '03 / 03 · CONNECTION',
    title: 'Find your people.',
    description: 'Connect through knowledge, interests, and different perspectives.',
    illustration: (
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="onboarding-svg"
        aria-hidden="true"
      >
        <circle cx="70" cy="70" r="58" fill="#faf5ff" />
        <circle cx="52" cy="72" r="28" fill="#c4b5fd" fillOpacity="0.55" />
        <circle cx="88" cy="72" r="28" fill="#93c5fd" fillOpacity="0.55" style={{ mixBlendMode: 'multiply' }} />
        <circle cx="70" cy="54" r="24" fill="#ddd6fe" fillOpacity="0.6" style={{ mixBlendMode: 'multiply' }} />
        {/* Connection nodes */}
        <circle cx="52" cy="72" r="4" fill="#7354b8" />
        <circle cx="88" cy="72" r="4" fill="#7354b8" />
        <circle cx="70" cy="54" r="4" fill="#7354b8" />
        <line x1="52" y1="72" x2="88" y2="72" stroke="#7354b8" strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="52" y1="72" x2="70" y2="54" stroke="#7354b8" strokeWidth="2.5" strokeDasharray="3 3" />
        <line x1="88" y1="72" x2="70" y2="54" stroke="#7354b8" strokeWidth="2.5" strokeDasharray="3 3" />
      </svg>
    ),
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  function handleNext() {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function finishOnboarding() {
    try {
      localStorage.setItem('blu_has_seen_onboarding', 'true');
    } catch {
      // Ignore storage errors in restricted contexts
    }
    onComplete();
  }

  const stepData = onboardingSteps[currentStep];
  const isLast = currentStep === onboardingSteps.length - 1;

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label="Welcome to blu">
      <div className="onboarding-card">
        {/* Header bar with brand and skip */}
        <div className="onboarding-header">
          <BluLogo size={28} showWordmark={true} wordmarkSize={20} />
          <button
            type="button"
            className="onboarding-skip-btn"
            onClick={finishOnboarding}
            aria-label="Skip introduction"
          >
            Skip
          </button>
        </div>

        {/* Dynamic visual illustration */}
        <div className="onboarding-illustration-container">
          {stepData.illustration}
        </div>

        {/* Step Badge */}
        <div className="onboarding-badge">{stepData.badge}</div>

        {/* Exact Approved Copy */}
        <h2 className="onboarding-title">{stepData.title}</h2>
        <p className="onboarding-description">{stepData.description}</p>

        {/* Step dots indicator */}
        <div className="onboarding-dots" aria-label={`Step ${currentStep + 1} of ${onboardingSteps.length}`}>
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`onboarding-dot ${index === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(index)}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="onboarding-actions">
          {currentStep > 0 ? (
            <button
              type="button"
              className="onboarding-back-btn"
              onClick={handleBack}
            >
              ← Back
            </button>
          ) : (
            <div style={{ width: '80px' }} />
          )}

          <button
            type="button"
            className="onboarding-primary-btn"
            onClick={handleNext}
          >
            {isLast ? 'Start exploring blu ↗' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

