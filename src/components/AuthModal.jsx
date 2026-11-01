import { useState, useEffect } from "react";
import BluLogo from "./BluLogo";
import { supabase } from "../lib/supabase";
import "./AuthModal.css";

function formatAuthError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";
  const msg = typeof error === "string" ? error : (error.message || "");
  if (msg.includes("Invalid login credentials")) {
    return "Incorrect email or password. Please double-check and try again.";
  }
  if (msg.includes("Email not confirmed")) {
    return "Please confirm your email address. Check your inbox for the confirmation link.";
  }
  if (msg.includes("User already registered") || msg.includes("already registered")) {
    return "This email may already be registered. Try logging in.";
  }
  if (msg.includes("Password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (msg.includes("New password should be different")) {
    return "New password should be different from your previous password.";
  }
  if (msg.includes("rate limit") || msg.includes("Too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (msg.includes("provider is not enabled") || msg.includes("Unsupported provider")) {
    return "Google sign-in is not enabled in your Supabase project yet. Please enable the Google provider in your Supabase Authentication settings.";
  }
  if (
    msg.includes("otp_expired") ||
    msg.includes("Email link is invalid or has expired") ||
    msg.includes("token has expired") ||
    msg.includes("invalid token")
  ) {
    return "This password reset link has expired or has already been used. Please request a new one.";
  }
  if (msg.includes("User not found")) {
    return "No account found with this email address.";
  }
  return msg;
}

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   initialMode?: string,
 *   initialError?: string,
 *   contextNotice?: string,
 *   onAuthSuccess?: (user?: any) => void
 * }} props
 */
export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  initialError = "",
  contextNotice = "",
  onAuthSuccess = () => { },
}) {
  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password reset states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Forgot password states
  const [forgotSent, setForgotSent] = useState(false);

  // Shared UI states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialError || "");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [existingUserDetected, setExistingUserDetected] = useState(false);

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

  function handleSwitchMode(newMode) {
    setMode(newMode);
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmationPending(false);
    setExistingUserDetected(false);
    setForgotSent(false);
    setResetComplete(false);
  }

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
          const isAlreadyRegistered =
            error.message?.includes("already registered") ||
            error.message?.includes("already in use") ||
            error.message?.includes("User already registered");

          if (isAlreadyRegistered) {
            setExistingUserDetected(true);
            setConfirmationPending(false);
          } else {
            setErrorMessage(formatAuthError(error));
          }
        } else if (data?.user) {
          // Check if Supabase returned an empty identities array (user already exists)
          const isExistingUser =
            Array.isArray(data.user.identities) && data.user.identities.length === 0;

          if (isExistingUser) {
            // Existing user: never falsely claim a new account was created
            setExistingUserDetected(true);
            setConfirmationPending(false);
          } else if (data?.session) {
            // Auto-signed in
            if (onAuthSuccess) onAuthSuccess(data.user);
            onClose();
          } else {
            // Genuinely new user with email confirmation required
            setConfirmationPending(true);
            setExistingUserDetected(false);
            setSuccessMessage(
              `Account created! A confirmation link has been sent to ${trimmedEmail}. Please check your inbox to activate your account.`
            );
          }
        } else if (data?.session) {
          // Auto-signed in fallback
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

  async function handleForgotSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
      } else {
        setForgotSent(true);
        setSuccessMessage(
          `Password reset link sent! If an account exists for ${trimmedEmail}, you will receive a reset email shortly.`
        );
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword) {
      setErrorMessage("Please enter your new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (!confirmPassword) {
      setErrorMessage("Please confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
      } else {
        setResetComplete(true);
        setSuccessMessage("Your password has been successfully updated!");
        // Clear recovery hash from URL
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        if (onAuthSuccess) {
          onAuthSuccess(data?.user);
        }
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  // Derive heading title and subtitle safely without complex inline JSX ternaries
  let headingTitle = "Welcome back";
  let headingSubtitle = "Pick up where curiosity left off.";

  if (existingUserDetected) {
    headingTitle = "Account found";
    headingSubtitle = "This email may already be registered. Try logging in.";
  } else if (confirmationPending) {
    headingTitle = "Check your email";
    headingSubtitle = `We sent an activation link to ${email.trim()}.`;
  } else if (mode === "signup") {
    headingTitle = "Join the blu community";
    headingSubtitle = "Ask questions, share wisdom, and find your circle.";
  } else if (mode === "forgot") {
    headingTitle = "Reset your password";
    headingSubtitle = "Enter your email and we'll send you a password reset link.";
  } else if (mode === "reset") {
    headingTitle = "Create new password";
    headingSubtitle = "Choose a strong password to secure your blu account.";
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

        {mode === "forgot" && (
          <button
            type="button"
            className="auth-back-link"
            onClick={() => handleSwitchMode("login")}
            aria-label="Back to log in"
          >
            ← Back to log in
          </button>
        )}

        <div className="auth-modal-brand">
          <BluLogo size={42} showWordmark={true} wordmarkSize={30} gap={11} />
        </div>

        {/* Tab switcher: Only shown in standard login / signup mode */}
        {(mode === "login" || mode === "signup") && !confirmationPending && !existingUserDetected && (
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
        )}

        {contextNotice && !confirmationPending && !existingUserDetected && (
          <div className="auth-context-notice-pill" role="status">
            <span className="auth-notice-sparkle" aria-hidden="true">✦</span>
            <span>{contextNotice}</span>
          </div>
        )}

        {/* Dynamic Headings */}
        <div className="auth-modal-heading">
          <h2 id="auth-modal-title">{headingTitle}</h2>
          <p>{headingSubtitle}</p>
        </div>

        {errorMessage && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span className="auth-alert-icon">⚠️</span>
            <span className="auth-alert-text">{errorMessage}</span>
          </div>
        )}

        {successMessage && !forgotSent && !resetComplete && !confirmationPending && (
          <div className="auth-alert auth-alert-success" role="status">
            <span className="auth-alert-icon">✓</span>
            <span className="auth-alert-text">{successMessage}</span>
          </div>
        )}

        {/* ----------------- FORGOT PASSWORD: CONFIRMATION SENT ----------------- */}
        {mode === "forgot" && forgotSent && (
          <div className="auth-status-card">
            <div className="auth-status-icon" aria-hidden="true">✉️</div>
            <h3>Check your email</h3>
            <p>
              We sent a password reset link to{" "}
              <strong className="auth-highlight">{email.trim()}</strong>.
              Click the link in the email to set a new password.
            </p>
            <p className="auth-status-subnote">
              If you don't see the email within a minute or two, check your spam or junk folder.
            </p>
            <div className="auth-status-actions">
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => handleSwitchMode("login")}
              >
                Back to log in
              </button>
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={handleForgotSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner">
                    <span className="auth-spinner-dot" />
                    <span className="auth-spinner-dot" />
                    <span className="auth-spinner-dot" />
                  </span>
                ) : (
                  "Resend reset link"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ----------------- FORGOT PASSWORD: FORM ----------------- */}
        {mode === "forgot" && !forgotSent && (
          <form className="auth-form" onSubmit={handleForgotSubmit} noValidate>
            <div className="auth-form-field">
              <label htmlFor="auth-forgot-email">Email address</label>
              <input
                id="auth-forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
                disabled={loading}
              />
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
              ) : (
                "Send reset link"
              )}
            </button>

            <div className="auth-modal-footer">
              <p>
                Remember your password?{" "}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => handleSwitchMode("login")}
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ----------------- RESET PASSWORD: COMPLETE ----------------- */}
        {mode === "reset" && resetComplete && (
          <div className="auth-status-card">
            <div className="auth-status-icon success" aria-hidden="true">✓</div>
            <h3>Password updated!</h3>
            <p>
              Your password has been changed successfully. You are now signed in and ready to explore blu.
            </p>
            <div className="auth-status-actions">
              <button
                type="button"
                className="auth-submit-btn"
                onClick={onClose}
              >
                Continue to blu ↗
              </button>
            </div>
          </div>
        )}

        {/* ----------------- RESET PASSWORD: FORM ----------------- */}
        {mode === "reset" && !resetComplete && (
          <form className="auth-form" onSubmit={handleResetPassword} noValidate>
            <div className="auth-form-field">
              <label htmlFor="auth-new-password">New password</label>
              <div className="auth-password-wrapper">
                <input
                  id="auth-new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoFocus
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  tabIndex={-1}
                >
                  {showNewPassword ? "👁" : "👁‍🗨"}
                </button>
              </div>
              <span className="auth-form-hint">Must be at least 6 characters.</span>
            </div>

            <div className="auth-form-field">
              <label htmlFor="auth-confirm-password">Confirm new password</label>
              <div className="auth-password-wrapper">
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? "👁" : "👁‍🗨"}
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
              ) : (
                "Update password"
              )}
            </button>

            <div className="auth-modal-footer">
              <p>
                Back to{" "}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => handleSwitchMode("login")}
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* ----------------- LOGIN / SIGNUP: CONFIRMATION PENDING ----------------- */}
        {(mode === "login" || mode === "signup") && confirmationPending && (
          <div className="auth-confirmation-panel">
            <div className="auth-status-icon" aria-hidden="true">✉️</div>
            <p className="auth-confirmation-note">
              Account created! A confirmation link has been sent to{" "}
              <strong className="auth-highlight">{email.trim()}</strong>.
              Please check your inbox to activate your account.
            </p>
            <div className="auth-status-actions">
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => handleSwitchMode("login")}
              >
                Go to Log in
              </button>
            </div>
          </div>
        )}

        {/* ----------------- LOGIN / SIGNUP: EXISTING USER GUIDANCE ----------------- */}
        {(mode === "login" || mode === "signup") && !confirmationPending && existingUserDetected && (
          <div className="auth-existing-user-panel">
            <div className="auth-status-icon" aria-hidden="true">💡</div>

            <div className="auth-status-actions">
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => handleSwitchMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => handleSwitchMode("forgot")}
              >
                Forgot password?
              </button>
            </div>
            <div className="auth-modal-footer">
              <p>
                Need to use a different email?{" "}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => {
                    setExistingUserDetected(false);
                    setErrorMessage("");
                    setEmail("");
                  }}
                >
                  Try another email
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ----------------- LOGIN / SIGNUP: MAIN FORM ----------------- */}
        {(mode === "login" || mode === "signup") && !confirmationPending && !existingUserDetected && (
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
                <div className="auth-field-header">
                  <label htmlFor="auth-password">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => handleSwitchMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
          </>
        )}
      </div>
    </div>
  );
}
