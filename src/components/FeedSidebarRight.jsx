import React from "react";

export default function FeedSidebarRight({
  questions = [],
  initialCircles = [],
  joinedCircles = [],
  toggleJoin,
  openCircle,
  onSelectQuestion,
}) {
  // Top 3 trending questions
  const trending = [...questions]
    .sort((a, b) => (b.votes + b.answers) - (a.votes + a.answers))
    .slice(0, 3);

  // Recommended circles (unjoined or popular)
  const recommendedCircles = initialCircles
    .filter((c) => !joinedCircles.includes(c.id))
    .slice(0, 4);

  return (
    <aside className="feed-sidebar-right" aria-label="Community highlights">
      {/* Community Showcase Banner */}
      <div className="expo-showcase-card">
        <div className="expo-badge">
          <span>🦋</span> THE blu COMMUNITY
        </div>
        <h3 className="expo-title">A space for curious minds</h3>
        <p className="expo-desc">
          Ask questions, share ideas, and learn from different perspectives.
        </p>
        <div className="expo-metrics">
          <div className="expo-metric-item">
            <span className="expo-metric-val">{questions.length}</span>
            <span className="expo-metric-lbl">Discussions</span>
          </div>
          <div className="expo-metric-item">
            <span className="expo-metric-val">{initialCircles.length}</span>
            <span className="expo-metric-lbl">Circles</span>
          </div>
          <div className="expo-metric-item">
            <span className="expo-metric-val">{joinedCircles.length}</span>
            <span className="expo-metric-lbl">Joined</span>
          </div>
        </div>
      </div>

      {/* Trending Discussions */}
      <div className="sidebar-card">
        <div className="sidebar-title">🔥 Trending on blu</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {trending.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              style={{
                cursor: "pointer",
                padding: "6px 0",
                borderBottom: idx < trending.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--ink)",
                  lineHeight: 1.35,
                  marginBottom: "4px",
                }}
              >
                {q.title}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", display: "flex", gap: "8px" }}>
                <span>↑ {q.votes} votes</span>
                <span>·</span>
                <span>💬 {q.answers} answers</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Communities */}
      {recommendedCircles.length > 0 && (
        <div className="sidebar-card">
          <div className="sidebar-title">Discover Circles</div>
          <div className="sidebar-circles-list">
            {recommendedCircles.map((circle) => (
              <div
                key={circle.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  gap: "8px",
                }}
              >
                <div
                  onClick={() => openCircle(circle.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                >
                  <span className="sidebar-circle-icon">{circle.icon}</span>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--ink)",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {circle.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {circle.members} members
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="sidebar-join-chip"
                  onClick={() => toggleJoin(circle.id)}
                >
                  + Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
