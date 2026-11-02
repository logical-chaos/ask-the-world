import React, { useState, useRef } from "react";
import BluAvatar from "./BluAvatar";
import { POPULAR_REACTIONS } from "./stickers";

function renderVideoPlayer(url, title = "Video attachment", height = "320px", className = "rich-post-video") {
  if (!url) return null;
  const isYt = url.includes("youtube.com") || url.includes("youtu.be");
  if (isYt) {
    const embedUrl = url.includes("watch?v=") ? url.replace("watch?v=", "embed/") : url;
    return (
      <iframe
        title={title}
        src={embedUrl}
        style={{ width: "100%", height, border: "none", borderRadius: "10px" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return <video src={url} controls playsInline className={className} />;
}

export default function PostCard({
  question,
  user,
  profile,
  isVoted = false,
  voteCount = 0,
  onVote,
  answerCount = 0,
  answers = [],
  onAddAnswer,
  onAddReply,
  helpfulVotes = {},
  onToggleHelpful,
  isSaved = false,
  onToggleSave,
  onEditPost,
  onDeletePost,
  onRequireAuth,
  onOpenProfile = null,
}) {
  const [copied, setCopied] = useState(false);
  const [showThread, setShowThread] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit post state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editBody, setEditBody] = useState(question.body);
  const [editCustomTags, setEditCustomTags] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState(question.photoUrl || null);
  const [editVideoUrl, setEditVideoUrl] = useState(question.videoUrl || null);
  const [editLinkUrl, setEditLinkUrl] = useState(question.linkUrl || "");
  const [showEditVideoInput, setShowEditVideoInput] = useState(false);
  const editPhotoInputRef = useRef(null);
  const editVideoInputRef = useRef(null);

  // Top-level Answer composer state
  const [answerInput, setAnswerInput] = useState("");
  const [answerPhoto, setAnswerPhoto] = useState(null);
  const [answerVideo, setAnswerVideo] = useState(null);
  const [answerLink, setAnswerLink] = useState("");
  const [showAnswerLinkInput, setShowAnswerLinkInput] = useState(false);
  const [answerGif, setAnswerGif] = useState(null);
  const [showAnswerGifPicker, setShowAnswerGifPicker] = useState(false);
  const answerPhotoInputRef = useRef(null);
  const answerVideoInputRef = useRef(null);

  // Reply composer state (keyed by parent answer ID to preserve drafts)
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [showReplyGifPicker, setShowReplyGifPicker] = useState(false);
  const replyPhotoInputRef = useRef(null);
  const replyVideoInputRef = useRef(null);

  const isAuthor = Boolean(
    question.author === "You" ||
      (user &&
        (question.author_id === user.id ||
          question.authorId === user.id ||
          question.author === user.user_metadata?.full_name ||
          question.author === user.user_metadata?.name ||
          question.author === user.email?.split("@")[0] ||
          (profile && question.author === profile.name)))
  );

  function handleShare(e) {
    e.stopPropagation();
    try {
      const shareUrl = `${window.location.origin}#question-${question.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // --- Photo File Reader Helper ---
  function readFileAsImage(file, callback) {
    if (!file || !file.type.startsWith("image/")) return;
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
            callback(canvas.toDataURL("image/jpeg", 0.85));
          } else {
            callback(event.target?.result);
          }
        } catch {
          callback(event.target?.result);
        }
      };
      if (typeof event.target?.result === "string") {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  // File input change handlers (extracted to avoid inline JSX syntax complexities)
  function handleEditPhotoSelect(e) {
    const f = e.target.files?.[0];
    if (f) readFileAsImage(f, (url) => setEditPhotoUrl(url));
    e.target.value = "";
  }

  function handleEditVideoSelect(e) {
    const f = e.target.files?.[0];
    if (f) {
      try {
        setEditVideoUrl(URL.createObjectURL(f));
      } catch (err) {
        console.error("Video preview failed", err);
      }
    }
    e.target.value = "";
  }

  function handleAnswerPhotoSelect(e) {
    const f = e.target.files?.[0];
    if (f) readFileAsImage(f, (url) => setAnswerPhoto(url));
    e.target.value = "";
  }

  function handleAnswerVideoSelect(e) {
    const f = e.target.files?.[0];
    if (f) {
      try {
        setAnswerVideo(URL.createObjectURL(f));
      } catch (err) {
        console.error("Video preview failed", err);
      }
    }
    e.target.value = "";
  }

  function handleReplyPhotoSelect(ansId, e) {
    const f = e.target.files?.[0];
    if (f) readFileAsImage(f, (url) => updateReplyDraft(ansId, { photo: url }));
    e.target.value = "";
  }

  function handleReplyVideoSelect(ansId, e) {
    const f = e.target.files?.[0];
    if (f) {
      try {
        updateReplyDraft(ansId, { video: URL.createObjectURL(f) });
      } catch (err) {
        console.error("Video preview failed", err);
      }
    }
    e.target.value = "";
  }

  // --- Edit Handlers ---
  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const extraTags = editCustomTags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#+/, "").trim())
      .filter(Boolean);

    const seen = new Set();
    const finalTags = [];
    for (const t of extraTags) {
      const lower = t.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        finalTags.push(t);
      }
    }
    if (finalTags.length === 0) finalTags.push("General");

    if (onEditPost) {
      onEditPost(question.id, {
        title: editTitle.trim(),
        body: editBody.trim(),
        tags: finalTags,
        photoUrl: editPhotoUrl,
        videoUrl: editVideoUrl,
        linkUrl: editLinkUrl.trim() || null,
        isEdited: true,
      });
    }
    setIsEditing(false);
  }

  // --- Answer Submission ---
  function handleSubmitAnswer(e) {
    e.preventDefault();
    const media = {
      photoUrl: answerPhoto,
      videoUrl: answerVideo,
      linkUrl: answerLink.trim() || null,
      gifUrl: answerGif,
    };

    if (!user && onRequireAuth) {
      onRequireAuth({
        action: "submitAnswer",
        title: "Share your perspective",
        message: "Sign in to answer questions and contribute to the community.",
        reason: "Your answer links to your profile so people can thank you.",
        actionIcon: "💬",
        payload: { questionId: question.id, text: answerInput, media },
      });
      return;
    }

    if (!answerInput.trim() && !answerPhoto && !answerVideo && !answerLink.trim() && !answerGif) return;

    if (onAddAnswer) {
      onAddAnswer(question.id, answerInput.trim(), media);
    }

    // Reset answer composer
    setAnswerInput("");
    setAnswerPhoto(null);
    setAnswerVideo(null);
    setAnswerLink("");
    setShowAnswerLinkInput(false);
    setAnswerGif(null);
    setShowAnswerGifPicker(false);
  }

  // --- Reply Helpers & Submission ---
  function getReplyDraft(ansId) {
    return replyDrafts[ansId] || { text: "", photo: null, video: null, link: "", gif: null, replyToAuthor: "" };
  }

  function updateReplyDraft(ansId, fields) {
    setReplyDrafts((prev) => ({
      ...prev,
      [ansId]: { ...getReplyDraft(ansId), ...fields },
    }));
  }

  function handleOpenReply(ansId, targetAuthor) {
    if (!user && onRequireAuth) {
      onRequireAuth({
        action: "submitReply",
        title: "Reply to answer",
        message: "Sign in to reply and participate in this thread.",
        reason: "Connecting your account enables you to reply directly.",
        actionIcon: "↳",
      });
      return;
    }
    setReplyingToId(ansId);
    setShowReplyGifPicker(false);
    const existing = getReplyDraft(ansId);
    if (!existing.text && targetAuthor) {
      updateReplyDraft(ansId, { text: `@${targetAuthor} `, replyToAuthor: targetAuthor });
    }
  }

  function handleSubmitReply(ansId, e) {
    e.preventDefault();
    const draft = getReplyDraft(ansId);
    const media = {
      photoUrl: draft.photo,
      videoUrl: draft.video,
      linkUrl: draft.link?.trim() || null,
      gifUrl: draft.gif,
    };

    if (!user && onRequireAuth) {
      onRequireAuth({
        action: "submitReply",
        title: "Reply to answer",
        message: "Sign in to reply and participate in this thread.",
        reason: "Connecting your account enables you to reply directly.",
        actionIcon: "↳",
        payload: {
          questionId: question.id,
          parentAnswerId: ansId,
          text: draft.text,
          media,
          replyToAuthor: draft.replyToAuthor,
        },
      });
      return;
    }

    if (!draft.text.trim() && !draft.photo && !draft.video && !draft.link?.trim() && !draft.gif) return;

    if (onAddReply) {
      onAddReply(question.id, ansId, draft.text.trim(), media, draft.replyToAuthor || null);
    }

    updateReplyDraft(ansId, { text: "", photo: null, video: null, link: "", gif: null, replyToAuthor: "" });
    setReplyingToId(null);
    setShowReplyGifPicker(false);
  }

  const primaryTopic = question.tags?.[0] || "General";

  const displayTags = Array.isArray(question.tags)
    ? Array.from(
      new Set(
        question.tags
          .map((t) => String(t || "").replace(/^#+/, "").trim())
          .filter(Boolean)
      )
    )
    : [];

  const answerPlaceholder = user
    ? "Share your perspective, solution, photo or explanation..."
    : "Sign in to write an answer that could help someone...";

  return (
    <article className="rich-post-card" id={`question-${question.id}`}>
      {/* Vote Column */}
      <div className="rich-vote-col">
        <button
          type="button"
          className={`rich-vote-btn ${isVoted ? "voted" : ""}`}
          onClick={() => onVote(question.id)}
          aria-label={`Upvote ${question.title}`}
          title="Upvote discussion"
        >
          ▲
        </button>
        <span className="rich-vote-count">{voteCount}</span>
      </div>

      {/* Main Post Content */}
      <div className="rich-post-main">
        {/* Author Header */}
        <div className="rich-post-header">
          <div className="rich-post-author-row">
            <BluAvatar
              name={question.author}
              user={isAuthor ? user : null}
              profile={isAuthor ? profile : null}
              photoUrl={isAuthor ? (profile?.photoUrl || user?.user_metadata?.avatar_url || question.authorPhoto || null) : (question.authorPhoto || null)}
              avatarId={isAuthor ? (profile?.avatarId || user?.user_metadata?.avatar_id || question.authorAvatarId) : question.authorAvatarId}
              size={24}
              className={`author-avatar-img ${onOpenProfile ? "author-avatar-clickable" : ""}`}
              onClick={onOpenProfile ? (e) => { e.stopPropagation(); onOpenProfile(question.author, question); } : null}
            />
            {onOpenProfile ? (
              <button
                type="button"
                className="rich-author-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfile(question.author, question);
                }}
                title={`View ${question.author}'s profile`}
              >
                {question.author}
              </button>
            ) : (
              <span className="rich-author-name">{question.author}</span>
            )}
            <span className="author-separator">·</span>
            <span className="rich-post-time">
              {question.time || "Just now"}
              {question.isEdited && <span className="post-edited-badge"> · Edited</span>}
            </span>
            <span className="rich-topic-badge">#{primaryTopic}</span>
          </div>

          {/* Post Author Options Menu */}
          {isAuthor && (
            <div className="post-author-options">
              <button
                type="button"
                className="post-options-trigger-btn"
                onClick={() => setShowMenu((prev) => !prev)}
                aria-label="Post options"
                title="Post options"
              >
                ⋮
              </button>
              {showMenu && (
                <div
                  className="post-options-dropdown"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="post-option-item"
                    onClick={() => {
                      setIsEditing(true);
                      setEditTitle(question.title);
                      setEditBody(question.body);
                      setEditCustomTags(
                        Array.isArray(question.tags)
                          ? question.tags.map((t) => `#${String(t).replace(/^#+/, "")}`).join(" ")
                          : ""
                      );
                      setEditPhotoUrl(question.photoUrl || null);
                      setEditVideoUrl(question.videoUrl || null);
                      setEditLinkUrl(question.linkUrl || "");
                      setShowMenu(false);
                    }}
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className="post-option-item delete"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowMenu(false);
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inline Edit Form OR Display View */}
        {isEditing ? (
          <form className="post-edit-container" onSubmit={handleSaveEdit}>
            <input
              className="post-edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Question title"
              required
            />
            <textarea
              className="post-edit-textarea"
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              placeholder="Question description..."
              rows={3}
            />

            {/* Edit Attachments Controls */}
            <div className="post-edit-attachments-bar">
              <input
                type="file"
                ref={editPhotoInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleEditPhotoSelect}
              />
              <input
                type="file"
                ref={editVideoInputRef}
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleEditVideoSelect}
              />

              <button
                type="button"
                className="edit-attach-trigger-btn"
                onClick={() => editPhotoInputRef.current?.click()}
                title="Attach photo"
              >
                <span>📷</span> Photo
              </button>

              <button
                type="button"
                className="edit-attach-trigger-btn"
                onClick={() => editVideoInputRef.current?.click()}
                title="Attach video file"
              >
                <span>🎥</span> Video
              </button>

              <button
                type="button"
                className="edit-attach-trigger-btn"
                onClick={() => setShowEditVideoInput(!showEditVideoInput)}
                title="Attach video URL or web link"
              >
                <span>🔗</span> Link
              </button>
            </div>

            {/* Edit Link input drawer */}
            {showEditVideoInput && (
              <div style={{ display: "flex", gap: "8px", margin: "6px 0" }}>
                <input
                  className="post-edit-input"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                  placeholder="Paste YouTube or video link..."
                  value={editVideoUrl || ""}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="post-edit-cancel-btn"
                  onClick={() => setShowEditVideoInput(false)}
                >
                  Done
                </button>
              </div>
            )}

            {/* Edit Media Previews */}
            {editPhotoUrl && (
              <div className="thread-media-preview-box">
                <img src={editPhotoUrl} alt="Attached photo" className="thread-attachment-img" />
                <button
                  type="button"
                  className="thread-media-remove-btn"
                  onClick={() => setEditPhotoUrl(null)}
                >
                  ✕ Remove Photo
                </button>
              </div>
            )}

            {editVideoUrl && (
              <div className="thread-media-preview-box">
                {editVideoUrl.includes("youtube.com") || editVideoUrl.includes("youtu.be") ? (
                  <div style={{ padding: "8px", color: "var(--purple)", fontSize: "12px" }}>
                    ▶ YouTube Video attached: {editVideoUrl}
                  </div>
                ) : (
                  <video src={editVideoUrl} controls className="thread-attachment-video" />
                )}
                <button
                  type="button"
                  className="thread-media-remove-btn"
                  onClick={() => setEditVideoUrl(null)}
                >
                  ✕ Remove Video
                </button>
              </div>
            )}

            <div className="post-edit-actions">
              <div style={{ display: "flex", gap: "8px", flex: 1, flexWrap: "wrap" }}>
                <input
                  type="text"
                  className="post-edit-input"
                  style={{ flex: 1, minWidth: "160px", padding: "6px 10px", fontSize: "12px" }}
                  placeholder="Add hashtags e.g. #Technology, #Life, #Education"
                  value={editCustomTags}
                  onChange={(e) => setEditCustomTags(e.target.value)}
                />
              </div>

              <div className="post-edit-btns">
                <button
                  type="button"
                  className="post-edit-cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="post-edit-save-btn">
                  Save changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="rich-post-content-view">
            <h3
              className="rich-post-title"
              onClick={() => setShowThread((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              {question.title}
            </h3>
            <p className="rich-post-body">{question.body}</p>
          </div>
        )}

        {/* Media Attachment: Photo */}
        {question.photoUrl && (
          <div className="rich-post-media-wrap">
            <img
              src={question.photoUrl}
              alt={question.title}
              className="rich-post-image"
              loading="lazy"
            />
          </div>
        )}

        {/* Media Attachment: Video */}
        {question.videoUrl && (
          <div className="rich-post-media-wrap">
            {renderVideoPlayer(question.videoUrl, question.title, "320px", "rich-post-video")}
          </div>
        )}

        {/* Tags */}
        {
          displayTags.length > 0 && (
            <div className="rich-post-tags">
              {displayTags.map((tag) => (
                <span className="rich-post-tag" key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )
        }

        {/* Post Actions Footer: Answer Count button itself expands/collapses the thread */}
        <div className="rich-post-actions">
          <div className="rich-action-btns-group">
            <button
              type="button"
              className={`rich-action-btn ${showThread ? "saved" : ""}`}
              onClick={() => setShowThread((prev) => !prev)}
              title={showThread ? "Collapse answers" : "View and write answers"}
            >
              <span>💬</span>
              <span>{answerCount} {answerCount === 1 ? "Answer" : "Answers"} {showThread ? "▲" : "▼"}</span>
            </button>

            <button
              type="button"
              className={`rich-action-btn ${isSaved ? "saved" : ""}`}
              onClick={() => onToggleSave(question.id)}
              title={isSaved ? "Remove bookmark" : "Save this post"}
            >
              <span>{isSaved ? "🔖" : "📑"}</span>
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <button
              type="button"
              className="rich-action-btn"
              onClick={handleShare}
              title="Share link"
            >
              <span>{copied ? "✓" : "🔗"}</span>
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Reddit-Style Inline Threaded Answers Section */}
        {showThread && (
          <div className="post-thread-wrap">
            {/* Inline Top-Level Answer Composer */}
            <form className="thread-composer-box" onSubmit={handleSubmitAnswer}>
              <textarea
                className="thread-composer-textarea"
                placeholder={answerPlaceholder}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                rows={2}
              />

              {/* Hidden file inputs for answer attachments */}
              <input
                type="file"
                ref={answerPhotoInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAnswerPhotoSelect}
              />
              <input
                type="file"
                ref={answerVideoInputRef}
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleAnswerVideoSelect}
              />

              {/* Answer Link Input Drawer */}
              {showAnswerLinkInput && (
                <div style={{ display: "flex", gap: "6px", margin: "6px 0" }}>
                  <input
                    className="reply-composer-input"
                    placeholder="Attach link URL (e.g. https://...)..."
                    value={answerLink}
                    onChange={(e) => setAnswerLink(e.target.value)}
                  />
                  <button
                    type="button"
                    className="post-edit-cancel-btn"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => setShowAnswerLinkInput(false)}
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Answer GIF Picker Popover */}
              {showAnswerGifPicker && (
                <div className="thread-gif-picker-popover">
                  <div className="thread-gif-picker-header">
                    <span>✨ Select a reaction or sticker</span>
                    <button
                      type="button"
                      className="thread-gif-close"
                      onClick={() => setShowAnswerGifPicker(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="thread-gif-grid">
                    {POPULAR_REACTIONS.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="thread-gif-btn"
                        onClick={() => {
                          setAnswerGif(item.url);
                          setShowAnswerGifPicker(false);
                        }}
                        title={item.label}
                      >
                        <img src={item.url} alt={item.label} className="thread-gif-thumbnail" />
                        <span className="thread-gif-label">{item.emoji} {item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Previews for Answer */}
              {answerPhoto && (
                <div className="thread-media-preview-box">
                  <img src={answerPhoto} alt="Attached photo" className="thread-attachment-img" />
                  <button
                    type="button"
                    className="thread-media-remove-btn"
                    onClick={() => setAnswerPhoto(null)}
                  >
                    ✕ Remove Photo
                  </button>
                </div>
              )}

              {answerVideo && (
                <div className="thread-media-preview-box">
                  <video src={answerVideo} controls className="thread-attachment-video" />
                  <button
                    type="button"
                    className="thread-media-remove-btn"
                    onClick={() => setAnswerVideo(null)}
                  >
                    ✕ Remove Video
                  </button>
                </div>
              )}

              {answerLink && (
                <div className="thread-media-preview-box">
                  <span style={{ fontSize: "12px", color: "var(--purple-border)" }}>🔗 {answerLink}</span>
                  <button
                    type="button"
                    className="thread-media-remove-btn"
                    onClick={() => setAnswerLink("")}
                  >
                    ✕ Remove Link
                  </button>
                </div>
              )}

              {answerGif && (
                <div className="thread-media-preview-box">
                  <img src={answerGif} alt="Attached sticker" className="thread-attachment-img" />
                  <button
                    type="button"
                    className="thread-media-remove-btn"
                    onClick={() => setAnswerGif(null)}
                  >
                    ✕ Remove Sticker
                  </button>
                </div>
              )}

              <div className="thread-composer-footer">
                <div className="thread-attach-btns">
                  <button
                    type="button"
                    className="thread-attach-trigger"
                    onClick={() => answerPhotoInputRef.current?.click()}
                    title="Attach photo"
                  >
                    <span>📷</span> Photo
                  </button>
                  <button
                    type="button"
                    className="thread-attach-trigger"
                    onClick={() => answerVideoInputRef.current?.click()}
                    title="Attach video file"
                  >
                    <span>🎥</span> Video
                  </button>
                  <button
                    type="button"
                    className="thread-attach-trigger"
                    onClick={() => setShowAnswerLinkInput(!showAnswerLinkInput)}
                    title="Attach web link"
                  >
                    <span>🔗</span> Link
                  </button>
                  <button
                    type="button"
                    className="thread-attach-trigger"
                    onClick={() => setShowAnswerGifPicker(!showAnswerGifPicker)}
                    title="Add reaction sticker / GIF"
                  >
                    <span>✨</span> Sticker
                  </button>
                </div>

                <button type="submit" className="thread-post-btn">
                  Post answer ↗
                </button>
              </div>
            </form>

            {/* Answers & Replies List */}
            <div className="thread-answers-list">
              {answers.map((ans) => {
                const isAnsAuthor =
                  ans.author === "You" ||
                  (user &&
                    (ans.author === user.user_metadata?.full_name ||
                      ans.author === user.user_metadata?.name ||
                      ans.author === user.email?.split("@")[0] ||
                      (profile && ans.author === profile.name)));
                const isHelpful = Boolean(helpfulVotes[ans.id]);
                const helpfulCount = (ans.helpful || 0) + (isHelpful ? 1 : 0);
                const isReplying = replyingToId === ans.id;
                const replyDraft = getReplyDraft(ans.id);

                return (
                  <div className="thread-answer-card" key={ans.id}>
                    <div className="thread-author-row">
                      <BluAvatar
                        name={ans.author}
                        user={isAnsAuthor ? user : null}
                        profile={isAnsAuthor ? profile : null}
                        photoUrl={isAnsAuthor ? (profile?.photoUrl || user?.user_metadata?.avatar_url || ans.authorPhoto || null) : (ans.authorPhoto || null)}
                        avatarId={isAnsAuthor ? (profile?.avatarId || user?.user_metadata?.avatar_id || ans.authorAvatarId) : ans.authorAvatarId}
                        size={22}
                        className={onOpenProfile ? "author-avatar-clickable" : ""}
                        onClick={onOpenProfile ? (e) => { e.stopPropagation(); onOpenProfile(ans.author, ans); } : null}
                      />
                      {onOpenProfile ? (
                        <button
                          type="button"
                          className="thread-author-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProfile(ans.author, ans);
                          }}
                          title={`View ${ans.author}'s profile`}
                        >
                          {ans.author}
                        </button>
                      ) : (
                        <span className="thread-author-name">{ans.author}</span>
                      )}
                      {isAnsAuthor && (
                        <span className="thread-author-badge">Your answer</span>
                      )}
                      <span className="thread-time">· {ans.time || "Earlier"}</span>
                    </div>

                    <p className="thread-body">{ans.body}</p>

                    {/* Media attached to answer */}
                    {(ans.photoUrl || ans.gifUrl) && (
                      <div className="thread-media-rendered">
                        <img
                          src={ans.photoUrl || ans.gifUrl}
                          alt="Answer attachment"
                          className="thread-attachment-img"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {ans.videoUrl && (
                      <div className="thread-media-rendered">
                        {renderVideoPlayer(ans.videoUrl, "Answer video attachment", "260px", "thread-attachment-video")}
                      </div>
                    )}

                    {ans.linkUrl && (
                      <div className="thread-media-rendered">
                        <a
                          href={ans.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="thread-attachment-link-card"
                        >
                          <span>🔗</span> {ans.linkUrl}
                        </a>
                      </div>
                    )}

                    <div className="thread-actions-bar">
                      <button
                        type="button"
                        className={`thread-helpful-btn ${isHelpful ? "is-helpful" : ""}`}
                        onClick={() => {
                          if (onToggleHelpful) onToggleHelpful(ans.id);
                        }}
                      >
                        <span>{isHelpful ? "✓" : "♡"}</span>
                        <span>Helpful</span>
                        <span>· {helpfulCount}</span>
                      </button>

                      <button
                        type="button"
                        className="thread-reply-trigger"
                        onClick={() => handleOpenReply(ans.id, ans.author)}
                      >
                        ↳ Reply
                      </button>
                    </div>

                    {/* Inline reply composer with rich attachments */}
                    {isReplying && (
                      <form
                        className="reply-composer-inline"
                        onSubmit={(e) => handleSubmitReply(ans.id, e)}
                      >
                        {replyDraft.replyToAuthor && (
                          <div className="reply-to-badge">
                            Replying to @{replyDraft.replyToAuthor}
                          </div>
                        )}

                        <input
                          className="reply-composer-input"
                          placeholder={`Reply to @${replyDraft.replyToAuthor || ans.author}...`}
                          value={replyDraft.text}
                          onChange={(e) => updateReplyDraft(ans.id, { text: e.target.value })}
                          autoFocus
                          required
                        />

                        {/* Hidden file inputs for reply */}
                        <input
                          type="file"
                          ref={replyPhotoInputRef}
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleReplyPhotoSelect(ans.id, e)}
                        />
                        <input
                          type="file"
                          ref={replyVideoInputRef}
                          accept="video/*"
                          style={{ display: "none" }}
                          onChange={(e) => handleReplyVideoSelect(ans.id, e)}
                        />

                        {/* Reply GIF Picker Popover */}
                        {showReplyGifPicker && (
                          <div className="thread-gif-picker-popover" style={{ marginTop: "6px" }}>
                            <div className="thread-gif-picker-header">
                              <span>✨ Select sticker</span>
                              <button
                                type="button"
                                className="thread-gif-close"
                                onClick={() => setShowReplyGifPicker(false)}
                              >
                                ✕
                              </button>
                            </div>
                            <div className="thread-gif-grid">
                              {POPULAR_REACTIONS.map((item) => (
                                <button
                                  type="button"
                                  key={item.id}
                                  className="thread-gif-btn"
                                  onClick={() => {
                                    updateReplyDraft(ans.id, { gif: item.url });
                                    setShowReplyGifPicker(false);
                                  }}
                                  title={item.label}
                                >
                                  <img src={item.url} alt={item.label} className="thread-gif-thumbnail" />
                                  <span className="thread-gif-label">{item.emoji} {item.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reply Attachment Previews */}
                        {replyDraft.photo && (
                          <div className="thread-media-preview-box" style={{ marginTop: "4px" }}>
                            <img src={replyDraft.photo} alt="Reply photo" className="thread-attachment-img" style={{ maxHeight: "120px" }} />
                            <button
                              type="button"
                              className="thread-media-remove-btn"
                              onClick={() => updateReplyDraft(ans.id, { photo: null })}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        )}

                        {replyDraft.video && (
                          <div className="thread-media-preview-box" style={{ marginTop: "4px" }}>
                            <video src={replyDraft.video} controls className="thread-attachment-video" style={{ maxHeight: "120px" }} />
                            <button
                              type="button"
                              className="thread-media-remove-btn"
                              onClick={() => updateReplyDraft(ans.id, { video: null })}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        )}

                        {replyDraft.gif && (
                          <div className="thread-media-preview-box" style={{ marginTop: "4px" }}>
                            <img src={replyDraft.gif} alt="Reply sticker" className="thread-attachment-img" style={{ maxHeight: "100px" }} />
                            <button
                              type="button"
                              className="thread-media-remove-btn"
                              onClick={() => updateReplyDraft(ans.id, { gif: null })}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        )}

                        <div className="reply-composer-actions">
                          <div className="reply-attach-group">
                            <button
                              type="button"
                              className="reply-icon-btn"
                              onClick={() => replyPhotoInputRef.current?.click()}
                              title="Attach photo"
                            >
                              📷
                            </button>
                            <button
                              type="button"
                              className="reply-icon-btn"
                              onClick={() => replyVideoInputRef.current?.click()}
                              title="Attach video"
                            >
                              🎥
                            </button>
                            <button
                              type="button"
                              className="reply-icon-btn"
                              onClick={() => setShowReplyGifPicker(!showReplyGifPicker)}
                              title="Add reaction sticker"
                            >
                              ✨
                            </button>
                          </div>

                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              className="post-edit-cancel-btn"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => {
                                setReplyingToId(null);
                                setShowReplyGifPicker(false);
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="thread-post-btn"
                              style={{ padding: "4px 10px", fontSize: "11px" }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Nested Replies (Reddit-style vertical guide line) */}
                    {Boolean(ans.replies && ans.replies.length) && (
                      <div className="replies-indent-tree">
                        {ans.replies.map((reply) => {
                          const isReplyAuthor =
                            reply.author === "You" ||
                            (user &&
                              (reply.author === user.user_metadata?.full_name ||
                                reply.author === user.user_metadata?.name ||
                                reply.author === user.email?.split("@")[0] ||
                                (profile && reply.author === profile.name)));
                          const isReplyHelpful = Boolean(helpfulVotes[reply.id]);
                          const replyHelpfulCount =
                            (reply.helpful || 0) + (isReplyHelpful ? 1 : 0);

                          return (
                            <div className="thread-reply-card" key={reply.id}>
                              <div className="thread-author-row">
                                <BluAvatar
                                  name={reply.author}
                                  user={isReplyAuthor ? user : null}
                                  profile={isReplyAuthor ? profile : null}
                                  photoUrl={isReplyAuthor ? (profile?.photoUrl || user?.user_metadata?.avatar_url || reply.authorPhoto || null) : (reply.authorPhoto || null)}
                                  avatarId={isReplyAuthor ? (profile?.avatarId || user?.user_metadata?.avatar_id || reply.authorAvatarId) : reply.authorAvatarId}
                                  size={18}
                                  className={onOpenProfile ? "author-avatar-clickable" : ""}
                                  onClick={onOpenProfile ? (e) => { e.stopPropagation(); onOpenProfile(reply.author, reply); } : null}
                                />
                                {onOpenProfile ? (
                                  <button
                                    type="button"
                                    className="thread-author-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenProfile(reply.author, reply);
                                    }}
                                    title={`View ${reply.author}'s profile`}
                                  >
                                    {reply.author}
                                  </button>
                                ) : (
                                  <span className="thread-author-name">
                                    {reply.author}
                                  </span>
                                )}
                                {isReplyAuthor && (
                                  <span className="thread-author-badge">You</span>
                                )}
                                <span className="thread-time">
                                  · {reply.time || "Just now"}
                                </span>
                              </div>

                              {reply.replyToAuthor && (
                                <div className="reply-to-tag">
                                  Replying to @{reply.replyToAuthor}
                                </div>
                              )}

                              <p className="thread-body" style={{ fontSize: "12px" }}>
                                {reply.body}
                              </p>

                              {/* Media in replies */}
                              {(reply.photoUrl || reply.gifUrl) && (
                                <div className="thread-media-rendered">
                                  <img
                                    src={reply.photoUrl || reply.gifUrl}
                                    alt="Reply attachment"
                                    className="thread-attachment-img"
                                    style={{ maxHeight: "160px" }}
                                    loading="lazy"
                                  />
                                </div>
                              )}

                              {reply.videoUrl && (
                                <div className="thread-media-rendered">
                                  <video src={reply.videoUrl} controls className="thread-attachment-video" style={{ maxHeight: "160px" }} />
                                </div>
                              )}

                              {reply.linkUrl && (
                                <div className="thread-media-rendered">
                                  <a
                                    href={reply.linkUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="thread-attachment-link-card"
                                    style={{ fontSize: "11px" }}
                                  >
                                    <span>🔗</span> {reply.linkUrl}
                                  </a>
                                </div>
                              )}

                              <div className="thread-actions-bar">
                                <button
                                  type="button"
                                  className={`thread-helpful-btn ${isReplyHelpful ? "is-helpful" : ""
                                    }`}
                                  style={{ padding: "2px 6px", fontSize: "10px" }}
                                  onClick={() => {
                                    if (onToggleHelpful) onToggleHelpful(reply.id);
                                  }}
                                >
                                  <span>{isReplyHelpful ? "✓" : "♡"}</span>
                                  <span>{replyHelpfulCount}</span>
                                </button>

                                <button
                                  type="button"
                                  className="thread-reply-trigger"
                                  style={{ fontSize: "10px", padding: "2px 6px" }}
                                  onClick={() => handleOpenReply(ans.id, reply.author)}
                                >
                                  ↳ Reply
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {answers.length === 0 && (
                <p
                  style={{
                    margin: "4px 0",
                    fontSize: "13px",
                    color: "var(--muted)",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
                  No answers yet. Be the first to share your perspective!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="delete-dialog-overlay"
          onClick={() => setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="delete-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="delete-dialog-title">Delete discussion?</h3>
            <p className="delete-dialog-desc">
              Are you sure you want to delete this discussion? All community
              answers and replies will also be removed. This action cannot be
              undone.
            </p>
            <div className="delete-dialog-actions">
              <button
                type="button"
                className="delete-dialog-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-dialog-confirm"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDeletePost) onDeletePost(question.id);
                }}
              >
                Delete discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
