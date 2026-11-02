import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAvatar, getDefaultAvatarId } from "./avatars";

/**
 * BluAvatar renders either a custom uploaded profile picture
 * or one of blu's original cute illustrated character avatars.
 *
 * Guarantees:
 * 1. If a valid uploaded photo exists and there is no image error, render the photo avatar with the preview modal.
 * 2. Otherwise, render the cute illustrated companion avatar with the preview modal.
 * 3. Preserve all existing props, click handlers, styles, and photo-preview functionality.
 */
export default function BluAvatar({
  user = null,
  profile = null,
  photoUrl = null,
  avatarId = null,
  name = "",
  size = 40,
  className = "",
  style = {},
  alt = "Profile avatar",
  showBorder = false,
  clickable = true,
  onClick = null,
}) {
  // Derive photo URL - prioritizes explicit photoUrl if passed as string, then profile custom photo, then user OAuth photo
  let resolvedPhoto = null;
  if (typeof photoUrl === "string" && photoUrl.trim() !== "") {
    resolvedPhoto = photoUrl.trim();
  } else if (photoUrl === false || photoUrl === null) {
    resolvedPhoto = null;
  } else if (typeof profile?.photoUrl === "string" && profile.photoUrl.trim() !== "") {
    resolvedPhoto = profile.photoUrl.trim();
  } else if (typeof profile?.avatarUrl === "string" && profile.avatarUrl.trim() !== "") {
    resolvedPhoto = profile.avatarUrl.trim();
  } else if (typeof user?.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url.trim() !== "") {
    resolvedPhoto = user.user_metadata.avatar_url.trim();
  } else if (typeof user?.user_metadata?.picture === "string" && user.user_metadata.picture.trim() !== "") {
    resolvedPhoto = user.user_metadata.picture.trim();
  }

  const [prevPhoto, setPrevPhoto] = useState(resolvedPhoto);
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (prevPhoto !== resolvedPhoto) {
    setPrevPhoto(resolvedPhoto);
    setImageError(false);
  }

  // Derive illustrated character avatar
  const seedString =
    name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    profile?.name ||
    "blu";

  const resolvedAvatarId =
    avatarId ||
    profile?.avatarId ||
    user?.user_metadata?.avatar_id ||
    getDefaultAvatarId(seedString);

  const character = getAvatar(resolvedAvatarId);

  // Close preview on Escape key
  useEffect(() => {
    if (!showPreview) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowPreview(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreview]);

  // Prevent background scrolling while preview modal is open
  useEffect(() => {
    if (showPreview) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showPreview]);

  function handleClick(e) {
    if (onClick) {
      onClick(e);
      return;
    }
    if (clickable) {
      e.stopPropagation();
      setShowPreview(true);
    }
  }

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    maxWidth: `${size}px`,
    maxHeight: `${size}px`,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
    border: showBorder ? "2px solid var(--border-soft, #e3d7f5)" : "none",
    cursor: clickable ? "pointer" : "default",
    ...style,
  };

  const displayName = name || profile?.name || user?.user_metadata?.full_name || "";

  const previewModal =
    showPreview && typeof document !== "undefined"
      ? createPortal(
          <div
            className="blu-avatar-modal-overlay"
            onClick={() => setShowPreview(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${displayName || character.name} profile preview`}
          >
            <div
              className="blu-avatar-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="blu-avatar-modal-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close photo preview"
                title="Close (Esc)"
              >
                ✕
              </button>

              <div className="blu-avatar-modal-body">
                {resolvedPhoto && !imageError ? (
                  <div className="blu-avatar-modal-img-wrap">
                    <img
                      src={resolvedPhoto}
                      alt={alt || `${displayName || "User"}'s profile picture`}
                      className="blu-avatar-modal-img"
                    />
                  </div>
                ) : (
                  <div className="blu-avatar-modal-companion-card">
                    <div className="blu-avatar-modal-svg-wrap">
                      {character.svg}
                    </div>
                    <div className="blu-avatar-modal-info">
                      <h3 className="blu-avatar-modal-name">
                        {displayName ? `${displayName}'s companion: ${character.name}` : character.name}
                      </h3>
                      <span className="blu-avatar-modal-tag">
                        {character.name} · {character.tag}
                      </span>
                      <p className="blu-avatar-modal-desc">
                        {character.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {resolvedPhoto && displayName && (
                <div className="blu-avatar-modal-footer">
                  <span className="blu-avatar-modal-user-name">{displayName}</span>
                </div>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  // 1. If a valid photo is provided and hasn't failed loading, render the image with the preview modal
  if (resolvedPhoto && !imageError) {
    return (
      <>
        <span
          className={`blu-avatar blu-avatar-photo ${className} ${clickable ? "blu-avatar-clickable" : ""}`}
          style={containerStyle}
          role="img"
          aria-label={alt}
          onClick={handleClick}
          title={clickable ? `View ${displayName || "profile"} photo` : undefined}
        >
          <img
            key={resolvedPhoto}
            src={resolvedPhoto}
            alt={alt}
            onError={() => setImageError(true)}
            className="blu-avatar-img"
            style={{
              width: "100%",
              height: "100%",
              minWidth: "100%",
              minHeight: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              display: "block",
            }}
          />
        </span>
        {previewModal}
      </>
    );
  }

  // 2. Otherwise, render the cute illustrated SVG character with the preview modal
  return (
    <>
      <span
        className={`blu-avatar blu-avatar-illustrated ${className} ${clickable ? "blu-avatar-clickable" : ""}`}
        style={containerStyle}
        role="img"
        aria-label={`${character.name} avatar`}
        title={clickable ? `View ${character.name} avatar` : `${character.name} · ${character.tag}`}
        onClick={handleClick}
      >
        {character.svg}
      </span>
      {previewModal}
    </>
  );
}
