import { useState, useEffect } from "react";
import BluLogo from "./BluLogo";
import { supabase } from "../lib/supabase";
import "./AuthModal.css";

function formatAuthError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";
  const msg = error.message || "";
  if (msg.includes("Invalid login credentials")) {
    return "Incorrect email or password. Please double-check and try again.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Please confirm your email address. Check your inbox for the confirmation link.";
  }
  if (msg.includes("User already registered") || msg.includes("already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (msg.includes("Password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("rate limit") || msg.includes("Too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
    return "Google sign-in is not enabled in your Supabase project yet. Please enable the Google provider in your Supabase Authentication settings.";
  }
  return msg;
}

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   initialMode?: string,
 *   onAuthSuccess?: (user?: any) => void
 * }} props
 */
export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onAuthSuccess = () => {},
}) {
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationPending, setConfirmationPending] = useState(false);

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

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
        setGoogleLoading(false);
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err));
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
            },
          },
        });

        if (error) {
          setErrorMessage(formatAuthError(error));
        } else if (data?.user && !data?.session) {
          // Email confirmation is required by Supabase project settings
          setConfirmationPending(true);
          setSuccessMessage(
            `Account created! A confirmation link has been sent to ${trimmedEmail}. Please check your inbox to activate your account.`
          );
        } else if (data?.session) {
          // Auto-signed in
          if (onAuthSuccess) onAuthSuccess(data.user);
          onClose();
        }
      } catch (err) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setErrorMessage(formatAuthError(error));
        } else if (data?.session) {
          if (onAuthSuccess) onAuthSuccess(data.user);
          onClose();
        }
      } catch (err) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setLoading(false);
      }
    }
  }

  function handleSwitchMode(newMode) {
    setMode(newMode);
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmationPending(false);
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          ✕
        </button>

        <div className="auth-modal-brand">
          <BluLogo size={42} showWordmark={true} wordmarkSize={30} gap={11} />
        </div>

        <div className="auth-modal-nav-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => handleSwitchMode("login")}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "signup" ? "active" : ""}`}
            onClick={() => handleSwitchMode("signup")}
          >
            Sign up
          </button>
        </div>

        <div className="auth-modal-heading">
          <h2 id="auth-modal-title">
            {mode === "login" ? "Welcome back" : "Join the blu community"}
          </h2>
          <p>
            {mode === "login"
              ? "Pick up where curiosity left off."
              : "Ask questions, share wisdom, and find your circle."}
          </p>
        </div>

        {errorMessage && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span className="auth-alert-icon">⚠️</span>
            <span className="auth-alert-text">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert-success" role="status">
            <span className="auth-alert-icon">✓</span>
            <span className="auth-alert-text">{successMessage}</span>
          </div>
        )}

        {confirmationPending ? (
          <div className="auth-confirmation-panel">
            <p className="auth-confirmation-note">
              Once you confirm your email, click below to log in.
            </p>
            <button
              type="button"
              className="auth-submit-btn"
              onClick={() => handleSwitchMode("login")}
            >
              Go to Log in
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              aria-label="Continue with Google"
            >
              {googleLoading ? (
                <span className="auth-spinner">
                  <span className="auth-spinner-dot" />
                  <span className="auth-spinner-dot" />
                  <span className="auth-spinner-dot" />
                </span>
              ) : (
                <>
                  <svg
                    className="auth-google-icon"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="auth-divider" role="separator" aria-label="or">
              <span>or</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="auth-form-field">
                <label htmlFor="auth-full-name">Full name</label>
                <input
                  id="auth-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  required
                  autoFocus
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            )}

            <div className="auth-form-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus={mode === "login"}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="auth-form-field">
              <label htmlFor="auth-password">Password</label>
              <div className="auth-password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === "signup" ? "At least 6 characters" : "Your password"
                  }
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner">
                  <span className="auth-spinner-dot" />
                  <span className="auth-spinner-dot" />
                  <span className="auth-spinner-dot" />
                </span>
              ) : mode === "login" ? (
                "Log in to blu"
              ) : (
                "Create blu account"
              )}
            </button>
          </form>
        </>
      )}

        <div className="auth-modal-footer">
          {mode === "login" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => handleSwitchMode("signup")}
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => handleSwitchMode("login")}
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
