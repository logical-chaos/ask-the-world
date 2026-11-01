import React, { useState, useRef } from "react";
import BluAvatar from "./BluAvatar";

export default function PostComposer({
  user,
  profile,
  onPublish,
  onRequireAuth,
  isOpen,
  onClose,
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = Boolean(isOpen || internalExpanded);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [customHashtags, setCustomHashtags] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [error, setError] = useState("");

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  function handleExpand() {
    if (!user) {
      onRequireAuth({
        action: "askQuestion",
        title: "Create a discussion",
        message: "Sign in to post questions, upload photos and share insights with the community.",
        reason: "An account links your posts to your profile so you can track answers.",
        actionIcon: "✦",
        payload: { title, body, customHashtags, photoUrl, videoUrl },
      });
      return;
    }
    setInternalExpanded(true);
  }

  function handlePhotoSelect(e) {
    if (!user) {
      onRequireAuth({
        action: "askQuestion",
        title: "Upload photo",
        message: "Sign in to attach photos and visuals to your questions.",
        reason: "Community safety guidelines require authenticated accounts for media uploads.",
        actionIcon: "📷",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be under 10MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/jpeg", 0.85);
            setPhotoUrl(compressed);
          } else {
            setPhotoUrl(event.target?.result);
          }
        } catch {
          setPhotoUrl(event.target?.result);
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleVideoSelect(e) {
    if (!user) {
      onRequireAuth({
        action: "askQuestion",
        title: "Upload video clip",
        message: "Sign in to attach video clips or screen recordings.",
        reason: "Authenticated profiles ensure authentic community content.",
        actionIcon: "🎥",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Video file is too large (maximum 50MB).");
      return;
    }

    setError("");
    try {
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
      setShowVideoInput(false);
    } catch {
      setError("Could not create local video preview.");
    }
    e.target.value = "";
  }

  function handleApplyVideoLink() {
    if (!videoLink.trim()) return;
    setVideoUrl(videoLink.trim());
    setShowVideoInput(false);
    setVideoLink("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const rawTags = customHashtags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#+/, "").trim())
      .filter(Boolean);

    // Deduplicate tags while preserving user casing and order
    const seen = new Set();
    const finalTags = [];
    for (const t of rawTags) {
      const lower = t.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        finalTags.push(t);
      }
    }

    if (finalTags.length === 0) {
      finalTags.push("General");
    }

    const primaryTag = finalTags[0];

    if (!user) {
      onRequireAuth({
        action: "askQuestion",
        title: "Publish post",
        message: "Sign in to publish your post and receive answers.",
        reason: "Your question draft has been saved. Sign in to post it immediately.",
        actionIcon: "✦",
        payload: { title, body, tag: primaryTag, tags: finalTags, customHashtags, photoUrl, videoUrl },
      });
      return;
    }

    if (!title.trim()) {
      setError("Please write a question title.");
      return;
    }

    onPublish({
      title: title.trim(),
      body: body.trim() || "A new discussion from the blu community.",
      tag: primaryTag,
      tags: finalTags,
      photoUrl,
      videoUrl,
    });

    // Reset composer
    setTitle("");
    setBody("");
    setCustomHashtags("");
    setPhotoUrl(null);
    setVideoUrl(null);
    setError("");
    setInternalExpanded(false);
    if (onClose) onClose();
  }

  function handleCancel() {
    setInternalExpanded(false);
    setError("");
    if (onClose) onClose();
  }

  return (
    <div className="post-composer-card" id="post-composer">
      {!isExpanded ? (
        <div className="post-composer-collapsed" onClick={handleExpand}>
          <BluAvatar
            user={user}
            profile={profile}
            name={user?.user_metadata?.full_name || profile?.name || ""}
            size={38}
          />
          <div className="post-composer-input-fake">
            {user
              ? `What's on your mind, ${user.user_metadata?.full_name?.split(" ")[0] || profile?.name?.split(" ")[0] || "Explorer"}?`
              : "What do you want to ask the world? Sign in to join the conversation..."}
          </div>
          <div className="post-composer-quick-actions">
            <button
              type="button"
              className="composer-quick-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleExpand();
                setTimeout(() => photoInputRef.current?.click(), 100);
              }}
              title="Add a photo"
            >
              <span>📷</span> Photo
            </button>
            <button
              type="button"
              className="composer-quick-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleExpand();
                setTimeout(() => videoInputRef.current?.click(), 100);
              }}
              title="Add a video"
            >
              <span>🎥</span> Video
            </button>
          </div>
        </div>
      ) : (
        <form className="post-composer-form" onSubmit={handleSubmit}>
          <div className="composer-header-row">
            <div className="composer-user-meta">
              <BluAvatar
                user={user}
                profile={profile}
                name={user?.user_metadata?.full_name || profile?.name || "You"}
                size={32}
              />
              <span className="composer-user-name">
                {user?.user_metadata?.full_name || profile?.name || "You"}
              </span>
            </div>

            <div className="composer-topics-wrap">
              <input
                type="text"
                className="composer-hashtag-input"
                placeholder="Add hashtags e.g. #Technology, #Life, #Education"
                value={customHashtags}
                onChange={(e) => setCustomHashtags(e.target.value)}
                aria-label="Add hashtags"
              />
            </div>
          </div>

          <input
            className="composer-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Question title (e.g., How do I start with Machine Learning?)"
            required
            autoFocus
          />

          <textarea
            className="composer-body-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add background, details, context, or code to help the community answer..."
            rows={3}
          />

          {error && (
            <div style={{ fontSize: "12px", color: "#dc2626", background: "#fef2f2", padding: "6px 12px", borderRadius: "8px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Photo Preview */}
          {photoUrl && (
            <div className="composer-media-preview-box">
              <img src={photoUrl} alt="Post attachment preview" />
              <button
                type="button"
                className="composer-media-remove-btn"
                onClick={() => setPhotoUrl(null)}
              >
                ✕ Remove Photo
              </button>
            </div>
          )}

          {/* Video Preview */}
          {videoUrl && (
            <div className="composer-media-preview-box">
              {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                <div style={{ color: "#fff", padding: "20px", textAlign: "center" }}>
                  <span>▶️ YouTube Video Attached:</span>
                  <div style={{ fontSize: "12px", color: "var(--purple-border)", marginTop: "4px" }}>{videoUrl}</div>
                </div>
              ) : (
                <video src={videoUrl} controls playsInline />
              )}
              <button
                type="button"
                className="composer-media-remove-btn"
                onClick={() => setVideoUrl(null)}
              >
                ✕ Remove Video
              </button>
            </div>
          )}

          {/* Video Link Input Drawer */}
          {showVideoInput && !videoUrl && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", background: "var(--bg)", padding: "8px 12px", borderRadius: "10px" }}>
              <input
                style={{ flex: 1, border: "1px solid var(--card-border)", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", background: "var(--bg-card)", color: "var(--ink)", outline: "none" }}
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="Paste video link (YouTube, MP4, Vimeo)..."
              />
              <button
                type="button"
                className="attachment-trigger-btn"
                onClick={handleApplyVideoLink}
              >
                Attach
              </button>
              <button
                type="button"
                style={{ border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: "12px" }}
                onClick={() => setShowVideoInput(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoSelect}
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            style={{ display: "none" }}
            onChange={handleVideoSelect}
          />

          <div className="composer-toolbar">
            <div className="composer-attachment-btns">
              <button
                type="button"
                className="attachment-trigger-btn"
                onClick={() => photoInputRef.current?.click()}
                title="Attach photo from device"
              >
                <span>📷</span> Photo
              </button>

              <button
                type="button"
                className="attachment-trigger-btn"
                onClick={() => videoInputRef.current?.click()}
                title="Attach video file from device"
              >
                <span>🎥</span> Video
              </button>

              <button
                type="button"
                className="attachment-trigger-btn"
                onClick={() => setShowVideoInput(!showVideoInput)}
                title="Attach video URL"
              >
                <span>🔗</span> Link
              </button>
            </div>

            <div className="composer-footer-actions">
              <button
                type="button"
                className="composer-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="composer-publish-btn"
              >
                Publish discussion ↗
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
