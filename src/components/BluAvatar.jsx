import React, { useState } from "react";
import { getAvatar, getDefaultAvatarId } from "./avatars";

/**
 * BluAvatar renders either a custom uploaded profile picture
 * or one of blu's original cute illustrated character avatars.
 *
 * Guarantees:
 * - Never shows broken image icons (gracefully falls back to cute character on onError).
 * - Never shows empty placeholders.
 * - Consistent look across navbar, profile page, cards, and discussions.
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
}) {
  // Derive photo URL - prioritizes explicit photoUrl if provided, then profile/user uploaded photo
  const resolvedPhoto =
    (photoUrl !== undefined && photoUrl !== null && photoUrl !== "")
      ? photoUrl
      : profile?.photoUrl ||
        profile?.avatarUrl ||
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        null;

  const [prevPhoto, setPrevPhoto] = useState(resolvedPhoto);
  const [imageError, setImageError] = useState(false);

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

  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
    border: showBorder ? "2px solid var(--border-soft)" : "none",
    ...style,
  };

  // If a valid photo is provided and hasn't failed loading, render the image
  if (resolvedPhoto && !imageError) {
    return (
      <span
        className={`blu-avatar blu-avatar-photo ${className}`}
        style={containerStyle}
        role="img"
        aria-label={alt}
      >
        <img
          key={resolvedPhoto}
          src={resolvedPhoto}
          alt={alt}
          onError={() => setImageError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
            display: "block",
          }}
        />
      </span>
    );
  }

  // Otherwise, render the cute illustrated SVG character
  return (
    <span
      className={`blu-avatar blu-avatar-illustrated ${className}`}
      style={containerStyle}
      role="img"
      aria-label={`${character.name} avatar`}
      title={`${character.name} · ${character.tag}`}
    >
      {character.svg}
    </span>
  );
}
