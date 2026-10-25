
import { useState } from "react";
import "./App.css";

const initialQuestions = [
  {
    id: 1,
    title: "How do I start learning Data Structures and Algorithms?",
    body: "I'm a first-year student and want to build a strong foundation. Which topics should I start with?",
    tags: ["DSA", "Programming", "Students"],
    author: "Aarav",
    votes: 24,
    answers: 8,
  },
  {
    id: 2,
    title: "What makes a friendship feel like home?",
    body: "Is it the time you spend together, or the feeling of being understood without explaining everything?",
    tags: ["Life", "Relationships", "Thoughts"],
    author: "Mira",
    votes: 41,
    answers: 12,
  },
  {
    id: 3,
    title: "Which skill should a CS student learn first?",
    body: "Share your experiences and help someone decide where to begin.",
    tags: ["Career", "Learning"],
    author: "Kabir",
    votes: 17,
    answers: 5,
  },
];

const topics = ["All", "Technology", "Life", "Education", "Career"];

function App() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeTopic, setActiveTopic] = useState("All");
  const [search, setSearch] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [votes, setVotes] = useState({});
  const [showAskForm, setShowAskForm] = useState(false);

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.body.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );

    const matchesTopic =
      activeTopic === "All" ||
      q.tags.some((tag) =>
        tag.toLowerCase().includes(activeTopic.toLowerCase())
      );

    return matchesSearch && matchesTopic;
  });

  function addQuestion(e) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQuestions([
      {
        id: Date.now(),
        title: newQuestion.trim(),
        body: "A new discussion from the Ask the World community.",
        tags: ["Community"],
        author: "You",
        votes: 0,
        answers: 0,
      },
      ...questions,
    ]);

    setNewQuestion("");
    setShowAskForm(false);
  }

  function toggleVote(id) {
    setVotes((previous) => ({
      ...previous,
      [id]: previous[id] ? 0 : 1,
    }));
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">✳</span>
          ask the world<span className="brand-dot">.</span>
        </a>

        <nav>
          <a className="nav-active" href="#feed">Explore</a>
          <a href="#topics">Topics</a>
          <a href="#about">About</a>
        </nav>

        <button
          className="ask-button"
          onClick={() => setShowAskForm(!showAskForm)}
        >
          + Ask a question
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">
            <span className="live-dot" />
            A LITTLE CURIOSITY CONNECTS US ALL
          </div>

          <h1>
            The world has answers.
            <br />
            <span>Let's find them together.</span>
          </h1>

          <p>
            Ask what you've always wondered. Share what you've learned.
            <br className="desktop-break" />
            Find people who see the world a little differently.
          </p>

          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, ideas, or topics..."
            />
            <span className="search-hint">↵</span>
          </div>

          <div className="hero-note">
            <span>✦</span> Every question is worth asking.
          </div>
        </section>

        {showAskForm && (
          <form className="ask-form" onSubmit={addQuestion}>
            <h2>What's on your mind?</h2>
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Write your question..."
              required
              autoFocus
            />
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowAskForm(false)}
              >
                Cancel
              </button>
              <button className="ask-button" type="submit">
                Publish question ↗
              </button>
            </div>
          </form>
        )}

        <section className="feed-section" id="feed">
          <div className="feed-heading">
            <div>
              <div className="section-label">THE COMMUNITY</div>
              <h2>Ideas worth exploring<span>.</span></h2>
            </div>
            <span className="question-count">
              {filteredQuestions.length} discussions
            </span>
          </div>

          <div className="topic-row" id="topics">
            {topics.map((topic) => (
              <button
                key={topic}
                className={`topic-chip ${
                  activeTopic === topic ? "selected" : ""
                }`}
                onClick={() => setActiveTopic(topic)}
              >
                {topic === "All" ? "✳ " : "# "}
                {topic}
              </button>
            ))}
          </div>

          <div className="question-list">
            {filteredQuestions.map((q) => (
              <article className="question-card" key={q.id}>
                <div className="vote-column">
                  <button
                    className={`vote-button ${
                      votes[q.id] ? "voted" : ""
                    }`}
                    onClick={() => toggleVote(q.id)}
                    aria-label={`Upvote ${q.title}`}
                    title="Upvote this question"
                  >
                    ↑
                  </button>
                  <span>{q.votes + (votes[q.id] || 0)}</span>
                  <small>votes</small>
                </div>

                <div className="question-content">
                  <div className="author-row">
                    <span className="avatar">
                      {q.author.charAt(0)}
                    </span>
                    <span>{q.author}</span>
                    <span className="author-separator">·</span>
                    <span className="muted">Community member</span>
                  </div>

                  <h3>{q.title}</h3>
                  <p>{q.body}</p>

                  <div className="card-bottom">
                    <div className="tag-list">
                      {q.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="answer-count">
                      ♧ {q.answers} answers
                    </span>
                  </div>
                </div>

                <div className="card-arrow">↗</div>
              </article>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="empty-state">
                <span>✳</span>
                <h3>No discussions found yet.</h3>
                <p>Try another search or start the conversation yourself.</p>
                <button
                  className="ask-button"
                  onClick={() => setShowAskForm(true)}
                >
                  Ask the first question
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="community-banner" id="about">
          <span className="banner-symbol">✳</span>
          <div>
            <h2>A question can bring us closer.</h2>
            <p>Different minds. Shared curiosity. A world of possibilities.</p>
          </div>
          <button
            className="banner-button"
            onClick={() => {
              setShowAskForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Join the conversation ↗
          </button>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#">
          ✳ ask the world<span className="brand-dot">.</span>
        </a>
        <span>Built on curiosity, powered by people.</span>
        <span>© 2026 Ask the World</span>
      </footer>
    </div>
  );
}

export default App;
