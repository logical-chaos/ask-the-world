import { useEffect } from "react";
import BluLogo from "./BluLogo";
import "./AuthModal.css";

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onLogin: () => void,
 *   onSignUp: () => void,
 *   actionTitle?: string,
 *   actionMessage?: string,
 *   actionReason?: string,
 *   actionIcon?: string
 * }} props
 */
export default function AuthPromptModal({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  actionTitle = "Join the conversation",
  actionMessage = "Sign in to participate in the blu community.",
  actionReason = "An account lets you save your answers, join circles, and track discussions.",
  actionIcon = "✦",
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
    >
      <div
        className="auth-modal-card auth-prompt-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close prompt"
        >
          ✕
        </button>

        <div className="auth-modal-brand">
          <BluLogo size={42} showWordmark={true} wordmarkSize={30} gap={11} />
        </div>

        <div className="auth-prompt-header">
          <div className="auth-prompt-badge">
            <span className="auth-prompt-badge-icon" aria-hidden="true">{actionIcon}</span>
            <span>Community Access</span>
          </div>
          <h2 id="auth-prompt-title" className="auth-prompt-title">
            {actionTitle}
          </h2>
          <p className="auth-prompt-subtitle">
            {actionMessage}
          </p>
        </div>

        {actionReason && (
          <div className="auth-prompt-reason-box">
            <div className="auth-prompt-reason-dot" aria-hidden="true">✦</div>
            <p className="auth-prompt-reason-text">{actionReason}</p>
          </div>
        )}

        <div className="auth-prompt-benefits">
          <div className="auth-benefit-item">
            <span className="benefit-icon" aria-hidden="true">💬</span>
            <span>Ask questions & share thoughtful answers</span>
          </div>
          <div className="auth-benefit-item">
            <span className="benefit-icon" aria-hidden="true">🌸</span>
            <span>Personalize your cute illustrated companion</span>
          </div>
          <div className="auth-benefit-item">
            <span className="benefit-icon" aria-hidden="true">🤝</span>
            <span>Join community circles & live discussions</span>
          </div>
        </div>

        <div className="auth-prompt-actions">
          <button
            type="button"
            className="auth-submit-btn auth-prompt-login-btn"
            onClick={onLogin}
          >
            Log in to continue
          </button>

          <button
            type="button"
            className="auth-prompt-signup-btn"
            onClick={onSignUp}
          >
            Create a free account
          </button>
        </div>

        <div className="auth-prompt-footer">
          <button
            type="button"
            className="auth-prompt-guest-link"
            onClick={onClose}
          >
            Continue browsing as guest
          </button>
        </div>
      </div>
    </div>
  );
}

