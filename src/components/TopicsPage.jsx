import React, { useState } from "react";

const TOPIC_CATEGORIES = [
  {
    id: "Technology",
    name: "Technology & Coding",
    icon: "💻",
    tagline: "Code, systems, architectures & AI",
    description:
      "Explore algorithms, web development, data structures, open-source software, and modern artificial intelligence innovations.",
    tags: ["DSA", "Technology", "WebDev", "Programming", "AI"],
    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))",
    borderAccent: "rgba(99, 102, 241, 0.3)",
  },
  {
    id: "Life",
    name: "Life & Reflections",
    icon: "🌱",
    tagline: "Personal growth, relationships & mindfulness",
    description:
      "Quiet late-night thoughts, meaningful friendships, campus memories, well-being, and honest reflections on everyday living.",
    tags: ["Life", "Relationships", "Thoughts", "Reflections"],
    gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(56, 189, 248, 0.08))",
    borderAccent: "rgba(34, 197, 94, 0.3)",
  },
  {
    id: "Education",
    name: "Education & Learning",
    icon: "📚",
    tagline: "Study roadmaps, university life & mastery",
    description:
      "Effective study routines, coursework guidance, university experiences, exam preparation, and self-directed learning strategies.",
    tags: ["Education", "Students", "Learning", "Exams"],
    gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(234, 88, 12, 0.08))",
    borderAccent: "rgba(245, 158, 11, 0.3)",
  },
  {
    id: "Career",
    name: "Career & Mentorship",
    icon: "🚀",
    tagline: "Internships, industry advice & growth",
    description:
      "Resume guidance, technical interviews, internship preparation, career transitions, and insights from seasoned practitioners.",
    tags: ["Career", "Technology", "Internships", "Mentorship"],
    gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(236, 72, 153, 0.08))",
    borderAccent: "rgba(168, 85, 247, 0.3)",
  },
  {
    id: "Creative",
    name: "Creative & Design",
    icon: "🎨",
    tagline: "UI/UX craft, writing & artistic expression",
    description:
      "Visual design, typography, storytelling, digital art, creative writing, and inspiring aesthetic works from the community.",
    tags: ["Design", "Writing", "Art", "Inspiration"],
    gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(139, 92, 246, 0.08))",
    borderAccent: "rgba(236, 72, 153, 0.3)",
  },
  {
    id: "Science",
    name: "Science & Curiosity",
    icon: "✨",
    tagline: "Astronomy, physics, biology & the unknown",
    description:
      "Questions about cosmic phenomena, physics principles, human biology, nature, and the ideas that push human knowledge forward.",
    tags: ["Science", "Curiosity", "Physics", "Discovery"],
    gradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(99, 102, 241, 0.08))",
    borderAccent: "rgba(56, 189, 248, 0.3)",
  },
];

export default function TopicsPage({
  questions = [],
  onSelectTopic,
  onOpenAsk,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = TOPIC_CATEGORIES.filter((category) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query) ||
      category.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // Calculate live question count for each topic
  function getTopicCount(topicId) {
    return questions.filter((q) => {
      const tags = Array.isArray(q.tags) ? q.tags : [];
      return (
        tags.some((t) => t.toLowerCase() === topicId.toLowerCase()) ||
        q.title.toLowerCase().includes(topicId.toLowerCase()) ||
        q.body.toLowerCase().includes(topicId.toLowerCase())
      );
    }).length;
  }

  return (
    <main className="topics-page">
      {/* Topics Hero Section */}
      <section className="topics-hero">
        <div className="eyebrow">
          <span className="live-dot" />
          DISCOVER CONVERSATIONS BY THEME
        </div>

        <h1>
          Explore Topics<span>.</span>
        </h1>

        <p>
          Browse questions and knowledge shared across the community. Find your
          curiosity or start a new thread.
        </p>

        {/* Real-time topic filter */}
        <div className="topics-search-wrap">
          <span className="topics-search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            className="topics-search-input"
            placeholder="Search topics, hashtags, or keywords (e.g. Technology, DSA, Career)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter topic categories"
          />
          {searchQuery && (
            <button
              type="button"
              className="topics-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      {/* Topics Grid */}
      <section className="topics-grid-section">
        <div className="topics-grid">
          {filteredTopics.map((category) => {
            const count = getTopicCount(category.id);

            return (
              <div
                key={category.id}
                className="topic-card"
                style={{
                  background: `var(--bg-card), ${category.gradient}`,
                  borderColor: category.borderAccent,
                }}
              >
                <div className="topic-card-header">
                  <div className="topic-icon-badge">{category.icon}</div>
                  <div className="topic-meta">
                    <span className="topic-hashtag">#{category.id}</span>
                    <span className="topic-count-pill">
                      {count} {count === 1 ? "discussion" : "discussions"}
                    </span>
                  </div>
                </div>

                <h3 className="topic-title">{category.name}</h3>
                <p className="topic-tagline">{category.tagline}</p>
                <p className="topic-description">{category.description}</p>

                {/* Tags List */}
                <div className="topic-tags-row">
                  {category.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="topic-subtag-btn"
                      onClick={() => onSelectTopic(category.id)}
                      title={`Browse #${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                {/* Card Actions */}
                <div className="topic-card-actions">
                  <button
                    type="button"
                    className="topic-explore-btn"
                    onClick={() => onSelectTopic(category.id)}
                  >
                    <span>Browse feed</span>
                    <span className="btn-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </button>

                  <button
                    type="button"
                    className="topic-ask-btn"
                    onClick={() => {
                      if (onOpenAsk) onOpenAsk(category.id);
                      else onSelectTopic(category.id);
                    }}
                    title={`Ask a question in #${category.id}`}
                  >
                    + Ask here
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="topics-empty-state">
            <span className="topics-empty-icon">🦋</span>
            <h3>No matching topics found</h3>
            <p>We couldn't find any topics matching "{searchQuery}".</p>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setSearchQuery("")}
            >
              Show all topics
            </button>
          </div>
        )}
      </section>

      {/* Community Charter Banner */}
      <section className="topics-charter-banner">
        <div className="charter-icon">✦</div>
        <div className="charter-text">
          <strong>Looking for a specific subject not listed here?</strong>
          <span>
            You can type any custom hashtag in the post composer (e.g. #Design, #Music,
            #Neuroscience) and it will appear directly on your discussion.
          </span>
        </div>
      </section>
    </main>
  );
}

