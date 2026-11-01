import React from "react";

export default function NotificationsModal({
  isOpen,
  onClose,
  user,
  onOpenAuth,
}) {
  if (!isOpen) return null;

  const mockNotifs = user
    ? [
        {
          id: 1,
          icon: "💡",
          title: "New helpful answer",
          text: "Dev's answer in Tech & Coding is trending with 8 helpful votes.",
          time: "10m ago",
        },
        {
          id: 2,
          icon: "🌸",
          title: "Profile personalized",
          text: "Your cute companion avatar is active across blu communities.",
          time: "1h ago",
        },
        {
          id: 3,
          icon: "🦋",
          title: "Welcome to blu Expo Edition",
          text: "Explore communities, join circles, and share what you've learned.",
          time: "Today",
        },
      ]
    : [
        {
          id: 1,
          icon: "👋",
          title: "Welcome, Guest Explorer!",
          text: "You are browsing blu in guest mode. Sign in to post, vote, and receive notifications.",
          time: "Just now",
        },
      ];

  return (
    <div className="notif-popover" role="dialog" aria-label="Notifications">
      <div className="notif-header">
        <span>🔔 Community Updates</span>
        <button
          type="button"
          onClick={onClose}
          style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)", fontSize: "16px" }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {mockNotifs.map((n) => (
          <div key={n.id} className="notif-item">
            <span className="notif-icon">{n.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "600", color: "var(--ink)", marginBottom: "2px" }}>
                {n.title}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                {n.text}
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <div style={{ paddingTop: "8px", borderTop: "1px solid var(--line)", textAlign: "center" }}>
          <button
            type="button"
            className="sidebar-join-chip"
            style={{ width: "100%", padding: "6px" }}
            onClick={() => {
              onClose();
              onOpenAuth("signup");
            }}
          >
            Sign in for personal alerts
          </button>
        </div>
      )}
    </div>
  );
}
