import React from "react";
import BluAvatar from "./BluAvatar";

export default function SavedPostsModal({
  isOpen,
  onClose,
  savedPostIds = [],
  questions = [],
  user,
  profile,
  onViewAnswers,
  onToggleSave,
}) {
  if (!isOpen) return null;

  const savedQuestions = questions.filter((q) => savedPostIds.includes(q.id));

  return (
    <div
      className="saved-posts-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Saved Discussions"
    >
      <div className="saved-posts-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="saved-posts-header">
          <div className="saved-posts-header-title">
            <span>🔖</span>
            <span>Saved Discussions ({savedQuestions.length})</span>
          </div>
          <button
            type="button"
            className="saved-posts-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="saved-posts-body">
          {savedQuestions.length > 0 ? (
            savedQuestions.map((q) => (
              <div className="saved-post-item" key={q.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="saved-post-meta">
                    <BluAvatar
                      name={q.author}
                      user={user && (q.author === user.user_metadata?.full_name || q.author === user.email?.split("@")[0] || (profile && q.author === profile.name)) ? user : null}
                      profile={profile && (q.author === profile.name || q.author === "You" || (user && q.author === user.user_metadata?.full_name)) ? profile : null}
                      photoUrl={q.authorPhoto || null}
                      size={20}
                    />
                    <span>{q.author}</span>
                    <span>·</span>
                    <span>{q.time || "Recently"}</span>
                    {q.tags?.[0] && (
                      <span className="rich-topic-badge">#{q.tags[0]}</span>
                    )}
                  </div>

                  <div
                    className="saved-post-title"
                    onClick={() => {
                      onClose();
                      if (onViewAnswers) onViewAnswers(q.id);
                    }}
                  >
                    {q.title}
                  </div>

                  <div className="saved-post-body-preview">{q.body}</div>
                </div>

                <div className="saved-post-actions">
                  <button
                    type="button"
                    className="saved-post-open-btn"
                    onClick={() => {
                      onClose();
                      if (onViewAnswers) onViewAnswers(q.id);
                    }}
                  >
                    View ↗
                  </button>
                  <button
                    type="button"
                    className="saved-post-remove-btn"
                    onClick={() => onToggleSave(q.id)}
                    title="Remove from bookmarks"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "12px" }}>
                📑
              </span>
              <h3 style={{ margin: "0 0 8px 0", color: "var(--heading)", fontSize: "17px" }}>
                No saved discussions yet
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--muted)", maxWidth: "340px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
                Bookmark questions and answers from your feed using the save icon to quickly find them later.
              </p>
              <button
                type="button"
                className="saved-post-open-btn"
                style={{ padding: "8px 18px", fontSize: "13px" }}
                onClick={onClose}
              >
                Explore Discussions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
