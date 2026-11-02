import React from "react";

export default function FeedSidebarLeft({
  activeTopic,
  setActiveTopic,
  topics,
  joinedCircles = [],
  initialCircles = [],
  openCircle,
  openPage,
  savedCount = 0,
  onOpenSaved,
}) {
  const myJoinedCircles = initialCircles.filter((c) =>
    joinedCircles.includes(c.id)
  );

  return (
    <aside className="feed-sidebar-left" aria-label="Community navigation">
      {/* Navigation Card */}
      <div className="sidebar-card">
        <div className="sidebar-title">Feeds & Shortcuts</div>
        <div className="sidebar-nav-list">
          <button
            type="button"
            className={`sidebar-nav-item ${activeTopic === "All" ? "active" : ""}`}
            onClick={() => {
              setActiveTopic("All");
              openPage("explore");
            }}
          >
            <span className="sidebar-nav-label">
              <span>🏠</span> Home Feed
            </span>
          </button>

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => openPage("circles")}
          >
            <span className="sidebar-nav-label">
              <span>🌐</span> Explore Circles
            </span>
            <span className="sidebar-badge">{initialCircles.length}</span>
          </button>

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={() => openPage("topics")}
          >
            <span className="sidebar-nav-label">
              <span>🏷️</span> Topics Directory
            </span>
          </button>

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={onOpenSaved}
          >
            <span className="sidebar-nav-label">
              <span>🔖</span> Saved Discussions
            </span>
            {savedCount > 0 && (
              <span className="sidebar-badge">{savedCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* My Circles Card */}
      <div className="sidebar-card">
        <div className="sidebar-title">My Circles</div>
        {myJoinedCircles.length > 0 ? (
          <div className="sidebar-circles-list">
            {myJoinedCircles.map((circle) => (
              <button
                key={circle.id}
                type="button"
                className="sidebar-circle-row"
                onClick={() => openCircle(circle.id)}
                title={`Open ${circle.name}`}
              >
                <div className="sidebar-circle-info">
                  <span className="sidebar-circle-icon">{circle.icon}</span>
                  <span>{circle.name}</span>
                </div>
                <span className="sidebar-badge">{circle.members}</span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
            You haven't joined any circles yet. Explore circles to find your people!
          </p>
        )}
      </div>

      {/* Topics Directory */}
      <div className="sidebar-card">
        <div className="sidebar-title">Topics</div>
        <div className="sidebar-nav-list">
          {topics
            .filter((t) => t !== "All")
            .map((topic) => (
              <button
                key={topic}
                type="button"
                className={`sidebar-nav-item ${activeTopic === topic ? "active" : ""}`}
                onClick={() => {
                  setActiveTopic(topic);
                  openPage("explore");
                }}
              >
                <span className="sidebar-nav-label">
                  <span>#</span> {topic}
                </span>
              </button>
            ))}
        </div>
      </div>

      {/* Community Charter */}
      <div className="sidebar-card" style={{ background: "var(--bg-subtle)" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--purple)", marginBottom: "4px" }}>
          ✦ blu Community Spirit
        </div>
        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Ask genuine questions, respect diverse perspectives, and share what you've learned.
        </p>
      </div>
    </aside>
  );
}
