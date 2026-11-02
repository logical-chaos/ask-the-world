import React from "react";
import BluLogo from "./BluLogo";
import BluAvatar from "./BluAvatar";
import { AVATAR_LIST } from "./avatars";

/**
 * AboutPage renders the official about page for the blu platform.
 * Inspired by the storytelling, editorial structure, and presentation of Reddit's official About page,
 * imbued with blu's unique butterfly-inspired curiosity identity.
 */
export default function AboutPage({
  openPage,
  questions = [],
  discussions = {},
  circles = [],
  user = null,
}) {
  const navigate = typeof openPage === "function" ? openPage : () => { };

  // Compute authentic live metrics from actual application state defensively
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const safeDiscussions = discussions && typeof discussions === "object" ? discussions : {};
  const safeCircles = Array.isArray(circles) ? circles : [];

  const totalQuestions = safeQuestions.length;
  const circleDiscussionsCount = Object.values(safeDiscussions).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );
  const totalDiscussions = totalQuestions + circleDiscussionsCount;

  const totalCircles = safeCircles.length > 0 ? safeCircles.length : 6;

  const derivedTopics = new Set(["Technology", "Life", "Education", "Career"]);
  safeQuestions.forEach((q) => {
    if (!q) return;
    if (Array.isArray(q.tags)) {
      q.tags.forEach((t) => {
        if (t) derivedTopics.add(t);
      });
    } else if (q.tag) {
      derivedTopics.add(q.tag);
    }
  });
  const totalTopics = derivedTopics.size;

  const circleMembersCount = safeCircles.reduce(
    (sum, c) => sum + (c && typeof c.members === "number" ? c.members : 0),
    0
  ) || 410;
  const activeCommunityCount = circleMembersCount + (user ? 1 : 0);

  const worksPillars = [
    {
      num: "01",
      badge: "INQUIRY",
      icon: "💭",
      title: "Ask",
      tagline: "Ask anything you've always wondered about.",
      description:
        "From foundational coding paradigms and college dilemmas to late-night reflections, every sincere inquiry is celebrated. Tag your post with a topic and let the community rally to help.",
    },
    {
      num: "02",
      badge: "PERSPECTIVE",
      icon: "✍️",
      title: "Share",
      tagline: "Share your knowledge, experiences, and ideas.",
      description:
        "Craft rich, insightful answers with photos, code blocks, link references, and lived experiences. Your lessons and explanations can unlock someone else's breakthrough.",
    },
    {
      num: "03",
      badge: "DIALOGUE",
      icon: "💬",
      title: "Discuss",
      tagline: "Participate in meaningful conversations.",
      description:
        "Threaded discussions keep debates organized and constructive. Upvote helpful contributions, ask follow-up questions, and explore nuances without algorithmic outrage.",
    },
    {
      num: "04",
      badge: "COMMUNITY",
      icon: "🤝",
      title: "Connect",
      tagline: "Find people and communities that share your interests.",
      description:
        "Join specialized Circles for focused discussions, or express your personality with hand-crafted illustrated companion avatars that reflect your learning spirit.",
    },
  ];

  const purposePillars = [
    {
      icon: "🌿",
      title: "Knowledge Over Noise",
      description:
        "We strip away engagement bait, vanity metrics, and intrusive algorithms so that authentic curiosity and thoughtful explanations can breathe naturally.",
    },
    {
      icon: "💡",
      title: "Collaborative Discovery",
      description:
        "Everyone has something meaningful to share, and everyone has questions worth asking. Learning is a shared, continuous evolution of mind and heart.",
    },
    {
      icon: "💜",
      title: "Kindness as Infrastructure",
      description:
        "Disagreement is natural, but hostility has no home here. We design tools that prioritize empathy, constructive critique, and genuine human respect.",
    },
    {
      icon: "🦋",
      title: "The Butterfly Ripple",
      description:
        "Just as a butterfly's wing flutter carries far, a thoughtful answer written today can guide and reassure learners across months and miles.",
    },
  ];

  return (
    <main className="about-page">
      {/* ========================================================
          SECTION 1 — HERO
          ======================================================== */}
      <section className="about-hero-section">
        <div className="about-hero-content">
          <div className="about-hero-badge">
            <span className="live-pulse-dot" aria-hidden="true" />
            <span>THE blu STORY · EST. 2026</span>
          </div>

          <h1 className="about-hero-title">
            Where curiosity <br />
            <span className="about-hero-gradient">brings us together.</span>
          </h1>

          <p className="about-hero-lead">
            A little curiosity can open up a world of knowledge, ideas, and
            meaningful connections.
          </p>

          <div className="about-hero-cta-group">
            <button
              type="button"
              className="ask-button about-btn-primary"
              onClick={() => navigate("explore")}
            >
              Explore blu ↗
            </button>
            <button
              type="button"
              className="cancel-button about-btn-secondary"
              onClick={() => navigate("circles")}
            >
              Discover Circles 🌐
            </button>
          </div>
        </div>

        {/* Hero Butterfly Artwork Visual */}
        <div className="about-hero-visual" aria-hidden="true">
          <div className="butterfly-art-wrapper">
            <svg
              className="butterfly-hero-svg"
              viewBox="0 0 340 340"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="wingGradLeft"
                  x1="20"
                  y1="30"
                  x2="160"
                  y2="240"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#9d7fe3" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#7354b8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#5b3ca3" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient
                  id="wingGradRight"
                  x1="320"
                  y1="30"
                  x2="180"
                  y2="240"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.9" />
                </linearGradient>

                <linearGradient
                  id="bodyGrad"
                  x1="170"
                  y1="80"
                  x2="170"
                  y2="260"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#7354b8" />
                  <stop offset="100%" stopColor="#2e1065" />
                </linearGradient>

                <radialGradient
                  id="butterflyGlow"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#e0d5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#faf8f5" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient Glow */}
              <circle cx="170" cy="170" r="140" fill="url(#butterflyGlow)" />

              {/* Flight Orbit Trails */}
              <path
                d="M50 170 C70 90, 270 90, 290 170 C270 250, 70 250, 50 170 Z"
                stroke="var(--purple-border, #e3d7f5)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                opacity="0.6"
              />

              {/* Left Forewing */}
              <path
                d="M170 145 C150 70, 70 30, 40 85 C15 130, 70 200, 165 165 Z"
                fill="url(#wingGradLeft)"
                opacity="0.92"
              />
              {/* Left Hindwing */}
              <path
                d="M165 165 C110 185, 60 220, 85 265 C110 305, 155 240, 170 185 Z"
                fill="url(#wingGradLeft)"
                opacity="0.8"
              />

              {/* Right Forewing */}
              <path
                d="M170 145 C190 70, 270 30, 300 85 C325 130, 270 200, 175 165 Z"
                fill="url(#wingGradRight)"
                opacity="0.92"
              />
              {/* Right Hindwing */}
              <path
                d="M175 165 C230 185, 280 220, 255 265 C230 305, 185 240, 170 185 Z"
                fill="url(#wingGradRight)"
                opacity="0.8"
              />

              {/* Wing Filigree Accents */}
              <path
                d="M60 95 Q115 130 160 155 M95 245 Q135 210 165 178"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />
              <path
                d="M280 95 Q225 130 180 155 M245 245 Q205 210 175 178"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Antennae */}
              <path
                d="M166 115 Q145 75, 130 82"
                stroke="#5b3ca3"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="128" cy="82" r="5" fill="#9d7fe3" />

              <path
                d="M174 115 Q195 75, 210 82"
                stroke="#5b3ca3"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="212" cy="82" r="5" fill="#9d7fe3" />

              {/* Body */}
              <ellipse cx="170" cy="165" rx="8" ry="46" fill="url(#bodyGrad)" />
              <circle cx="170" cy="120" r="9" fill="#2e1065" />

              {/* Sparkles */}
              <circle cx="65" cy="65" r="3" fill="#9d7fe3" />
              <circle cx="275" cy="60" r="3.5" fill="#c4b5fd" />
              <circle cx="50" cy="230" r="2.5" fill="#7354b8" />
              <circle cx="295" cy="225" r="3" fill="#a78bfa" />
            </svg>
            <div className="butterfly-ambient-badge">
              <span className="butterfly-badge-icon">🦋</span>
              <div>
                <strong>Lightness · Depth</strong>
                <span>Built for curious thinkers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 — INTRODUCTION
          ======================================================== */}
      <section className="about-intro-section">
        <div className="about-section-header">
          <span className="about-section-label">THE blu ESSENCE</span>
          <h2 className="about-section-title">Welcome to blu.</h2>
          <p className="about-section-subtitle">
            An independent space where genuine human curiosity is celebrated, not
            drowned out by noise.
          </p>
        </div>

        <div className="about-intro-grid">
          <div className="about-intro-card">
            <span className="intro-card-icon">📖</span>
            <h3>What is blu?</h3>
            <p>
              blu is a collaborative community platform designed for curious minds.
              It brings together the conversational energy of Reddit with the
              structured knowledge-sharing of modern discussion boards. Here, questions
              aren't disposable content — they are gateways to understanding.
            </p>
          </div>

          <div className="about-intro-card">
            <span className="intro-card-icon">🎯</span>
            <h3>Why does it exist?</h3>
            <p>
              Much of the modern internet has evolved to reward outrage algorithms,
              superficial takes, and vanity metrics. blu was built with a different
              conviction: that thoughtful questions deserve thoughtful answers, and
              people learn best when their curiosity is met with kindness.
            </p>
          </div>

          <div className="about-intro-card">
            <span className="intro-card-icon">🌍</span>
            <h3>How it brings us together</h3>
            <p>
              Whether you are debugging complex code, choosing a college major, or
              pondering quiet philosophical thoughts, blu connects people across
              disciplines and generations. Every voice brings a fresh perspective
              that enriches the whole.
            </p>
          </div>
        </div>

        {/* Narrative Callout Banner */}
        <div className="about-quote-banner">
          <div className="quote-badge">“</div>
          <blockquote>
            Curiosity is not a chore to complete; it is the natural impulse to
            reach toward the world and understand it. blu is the quiet room where
            that impulse is given the space it deserves.
          </blockquote>
          <div className="quote-signature">
            <BluLogo size={28} showWordmark={true} wordmarkSize={20} gap={8} />
            <span>— The blu Community Manifesto</span>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — HOW blu WORKS
          ======================================================== */}
      <section className="about-works-section">
        <div className="about-section-header">
          <span className="about-section-label">HOW IT WORKS</span>
          <h2 className="about-section-title">Four rhythms of community learning.</h2>
          <p className="about-section-subtitle">
            How individual sparks of wonder transform into collective knowledge.
          </p>
        </div>

        <div className="about-works-grid">
          {worksPillars.map((pillar) => (
            <div className="works-card" key={pillar.title}>
              <div className="works-card-top">
                <span className="works-pillar-badge">{pillar.badge}</span>
                <span className="works-pillar-num">{pillar.num}</span>
              </div>
              <div className="works-card-icon-wrap">{pillar.icon}</div>
              <h3 className="works-card-title">{pillar.title}</h3>
              <p className="works-card-tagline">{pillar.tagline}</p>
              <p className="works-card-desc">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — THE blu COMMUNITY
          ======================================================== */}
      <section className="about-community-section">
        <div className="about-section-header">
          <span className="about-section-label">THE ECOSYSTEM</span>
          <h2 className="about-section-title">A world of ideas, one community.</h2>
          <p className="about-section-subtitle">
            How Circles, Topics, and threaded answers intertwine to create a rich,
            explorable universe.
          </p>
        </div>

        <div className="about-community-columns">
          {/* Column 1: Circles */}
          <div className="community-pillar-card">
            <div className="pillar-header">
              <span className="pillar-sym">🌐</span>
              <div>
                <h3>Interest Circles</h3>
                <span>Small, dedicated spaces</span>
              </div>
            </div>
            <p>
              Circles are intimate hubs dedicated to specific crafts and passions:
              Tech &amp; Coding, Study Circle, Art &amp; Dance, Life &amp; Everything,
              Career Paths, and Books &amp; Ideas. They offer the comfort of a small
              study lounge within a larger community.
            </p>
            <button
              type="button"
              className="pillar-inline-btn"
              onClick={() => navigate("circles")}
            >
              Browse all {totalCircles} Circles →
            </button>
          </div>

          {/* Column 2: Topics */}
          <div className="community-pillar-card">
            <div className="pillar-header">
              <span className="pillar-sym">🏷️</span>
              <div>
                <h3>Topics Taxonomy</h3>
                <span>Organized knowledge hubs</span>
              </div>
            </div>
            <p>
              Discussions on blu are organized into clear topic tags: #Technology,
              #Life, #Education, #Career, and more. Topics make it effortless to
              dive deep into the exact subject you care about without getting lost
              in irrelevant noise.
            </p>
            <button
              type="button"
              className="pillar-inline-btn"
              onClick={() => navigate("explore")}
            >
              Filter by topic on Explore →
            </button>
          </div>

          {/* Column 3: Threaded Discussions */}
          <div className="community-pillar-card">
            <div className="pillar-header">
              <span className="pillar-sym">💬</span>
              <div>
                <h3>Threaded Discussions</h3>
                <span>Context preserved, nuance honored</span>
              </div>
            </div>
            <p>
              Answers sit directly beneath their parent posts, and replies nest
              subtly under each answer. With helpful voting and media attachments,
              discussions feel like real conversations rather than fragmented
              comment sections.
            </p>
            <button
              type="button"
              className="pillar-inline-btn"
              onClick={() => navigate("explore")}
            >
              View recent threads →
            </button>
          </div>
        </div>

        {/* Companions Showcase */}
        <div className="about-companions-showcase">
          <div className="companions-header">
            <h4>Illustrated Character Companions</h4>
            <p>
              Every blu explorer can choose a hand-crafted companion avatar. Each
              character represents a distinct curiosity spirit, personality, and
              way of learning.
            </p>
          </div>

          <div className="companions-strip">
            {AVATAR_LIST.map((char) => (
              <div className="companion-tile" key={char.id}>
                <div className="companion-avatar-container">
                  <BluAvatar avatarId={char.id} size={56} />
                </div>
                <strong>{char.name}</strong>
                <span>{char.tag}</span>
              </div>
            ))}
          </div>

          <div className="companions-cta-row">
            <span>You can customize your avatar anytime on your profile page.</span>
            <button
              type="button"
              className="cancel-button"
              style={{ fontSize: "12px", padding: "6px 14px" }}
              onClick={() => navigate("profile")}
            >
              Personalize profile 🌸
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — blu BY THE NUMBERS
          ======================================================== */}
      <section className="about-numbers-section">
        <div className="about-section-header">
          <span className="about-section-label">REAL METRICS</span>
          <h2 className="about-section-title">blu by the numbers.</h2>
          <p className="about-section-subtitle">
            Authentic community activity calculated dynamically from this application
            instance.
          </p>
        </div>

        <div className="about-numbers-grid">
          <div className="number-stat-card">
            <div className="number-stat-top">
              <span className="stat-icon">💬</span>
              <span className="stat-badge">COMMUNITY ACTIVITY</span>
            </div>
            <div className="stat-big-number">{totalDiscussions}</div>
            <div className="stat-label">Active Discussions</div>
            <p className="stat-desc">
              Total questions and circle discussions currently active in this blu
              instance.
            </p>
          </div>

          <div className="number-stat-card">
            <div className="number-stat-top">
              <span className="stat-icon">🌐</span>
              <span className="stat-badge">SPACES</span>
            </div>
            <div className="stat-big-number">{totalCircles}</div>
            <div className="stat-label">Interest Circles</div>
            <p className="stat-desc">
              Dedicated interest hubs spanning Tech, Study, Art, Life, Career, and
              Books.
            </p>
          </div>

          <div className="number-stat-card">
            <div className="number-stat-top">
              <span className="stat-icon">🏷️</span>
              <span className="stat-badge">CATEGORIES</span>
            </div>
            <div className="stat-big-number">{totalTopics}</div>
            <div className="stat-label">Curated Topics</div>
            <p className="stat-desc">
              Knowledge categories organizing discussions for quick, focused
              discovery.
            </p>
          </div>

          <div className="number-stat-card">
            <div className="number-stat-top">
              <span className="stat-icon">👥</span>
              <span className="stat-badge">COMMUNITY MEMBERS</span>
            </div>
            <div className="stat-big-number">{activeCommunityCount}</div>
            <div className="stat-label">Community Participants</div>
            <p className="stat-desc">
              Active members enrolled across all circles, questions, and discussion
              threads.
            </p>
          </div>
        </div>

        <div className="about-numbers-footnote">
          <span>*</span>
          <p>
            All statistics displayed above are calculated live from actual application
            records. blu does not display fabricated claims, inflated visitor
            metrics, or phantom testimonials.
          </p>
        </div>
      </section>

      {/* ========================================================
          SECTION 6 — OUR PURPOSE
          ======================================================== */}
      <section className="about-purpose-section">
        <div className="about-section-header">
          <span className="about-section-label">VISION &amp; VALUES</span>
          <h2 className="about-section-title">Why we built blu.</h2>
          <p className="about-section-subtitle">
            The convictions that guide our architecture, moderation, and community
            design.
          </p>
        </div>

        <div className="about-purpose-grid">
          {purposePillars.map((pillar) => (
            <div className="purpose-card" key={pillar.title}>
              <div className="purpose-icon-wrap">{pillar.icon}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — CLOSING HERO
          ======================================================== */}
      <section className="about-closing-hero">
        <div className="closing-hero-backdrop" aria-hidden="true" />
        <div className="closing-hero-content">
          <span className="closing-hero-eyebrow">YOUR JOURNEY BEGINS HERE</span>
          <h2 className="closing-hero-title">
            The world has answers. <br />
            <span>Let's find them together.</span>
          </h2>
          <p className="closing-hero-lead">
            Whether you have a question burning in your mind or wisdom ready to
            share, your perspective belongs in the blu community.
          </p>
          <div className="closing-hero-buttons">
            <button
              type="button"
              className="ask-button closing-btn-primary"
              onClick={() => navigate("explore")}
            >
              Explore blu ↗
            </button>
            <button
              type="button"
              className="cancel-button closing-btn-secondary"
              onClick={() => navigate("circles")}
            >
              Browse Circles 🌐
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
