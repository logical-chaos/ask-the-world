import AuthModal from "./AuthModal";

/**
 * ResetPasswordModal renders the password reset screen where users
 * can enter and confirm their new password.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onSuccess?: (user?: any) => void,
 *   initialError?: string
 * }} props
 */
export default function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  initialError = "",
}) {
  return (
    <AuthModal
      isOpen={isOpen}
      onClose={onClose}
      initialMode="reset"
      initialError={initialError}
      onAuthSuccess={onSuccess}
    />
  );
}

