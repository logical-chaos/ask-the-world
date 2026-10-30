
import { useState, useEffect } from "react";
import "./App.css";
import IntroScreen from "./IntroScreen";
import BluLogo from "./components/BluLogo";
import OnboardingScreen from "./components/OnboardingScreen";
import ThemeToggle from "./components/ThemeToggle";
import AuthModal from "./components/AuthModal";
import { supabase } from "./lib/supabase";

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

const initialAnswers = {
  1: [
    {
      id: 101,
      author: "Riya",
      body: "Start with one programming language, then learn arrays, strings, linked lists, stacks, queues, trees, and graphs. Practise easy problems consistently before moving to harder ones.",
      helpful: 12,
    },
    {
      id: 102,
      author: "Dev",
      body: "Understand time and space complexity early. It helps you compare solutions and choose efficient approaches. You can learn Big O notation alongside basic problems.",
      helpful: 8,
    },
    {
      id: 103,
      author: "Ananya",
      body: "Pick a roadmap and stick to it instead of switching resources every day. Solve a few problems regularly and review the ones you couldn't solve.",
      helpful: 6,
    },
  ],
  2: [
    {
      id: 201,
      author: "Ishita",
      body: "For me, friendship feels like home when I can be myself without worrying about being judged.",
      helpful: 18,
    },
    {
      id: 202,
      author: "Rehan",
      body: "I think it is consistency. Someone who shows up during ordinary days, not just special moments, makes a friendship feel safe.",
      helpful: 11,
    },
    {
      id: 203,
      author: "Meera",
      body: "It is being understood, but also being able to disagree and still respect each other.",
      helpful: 9,
    },
  ],
  3: [
    {
      id: 301,
      author: "Kabir",
      body: "Learn programming fundamentals first: variables, loops, functions, arrays, and problem-solving. Build small projects to put those concepts into practice.",
      helpful: 10,
    },
    {
      id: 302,
      author: "Sana",
      body: "Git and GitHub are useful early skills because they help you save your work, collaborate, and show projects to others.",
      helpful: 7,
    },
    {
      id: 303,
      author: "Arjun",
      body: "Start with one skill that interests you, practise it, and make something small. You don't need to learn every technology at once.",
      helpful: 5,
    },
  ],
};

const initialCircles = [
  {
    id: "tech",
    name: "Tech & Coding",
    icon: "💻",
    description: "Code, projects, DSA, debugging, and tech talk.",
    members: 120,
    color: "lavender",
  },
  {
    id: "study",
    name: "Study Circle",
    icon: "📚",
    description: "Study together, exchange notes, and learn.",
    members: 86,
    color: "peach",
  },
  {
    id: "art",
    name: "Art, Music & Dance",
    icon: "🎨",
    description: "Create, share your work, and find inspiration.",
    members: 74,
    color: "pink",
  },
  {
    id: "life",
    name: "Life & Everything",
    icon: "🌙",
    description: "Friendships, feelings, opinions, and everyday life.",
    members: 98,
    color: "blue",
  },
  {
    id: "career",
    name: "Careers & Growth",
    icon: "🚀",
    description: "Skills, opportunities, and career conversations.",
    members: 63,
    color: "green",
  },
  {
    id: "books",
    name: "Books & Ideas",
    icon: "💡",
    description: "Books, interesting ideas, and curious minds.",
    members: 51,
    color: "yellow",
  },
];

const initialMessages = {
  tech: [
    {
      id: 1,
      author: "Riya",
      text: "Hey everyone! What programming language are you learning right now?",
      time: "Sample message",
    },
    {
      id: 2,
      author: "Dev",
      text: "I'm working on Python and trying to solve one DSA problem every day.",
      time: "Sample message",
    },
  ],
  study: [
    {
      id: 3,
      author: "Anaya",
      text: "What subject is everyone revising this week?",
      time: "Sample message",
    },
  ],
  art: [
    {
      id: 4,
      author: "Meher",
      text: "Share what you've been creating lately. I'd love to see it!",
      time: "Sample message",
    },
  ],
  life: [
    {
      id: 5,
      author: "Ira",
      text: "What's one little thing that made your day better?",
      time: "Sample message",
    },
  ],
  career: [
    {
      id: 6,
      author: "Arjun",
      text: "How are you all preparing for internships?",
      time: "Sample message",
    },
  ],
  books: [
    {
      id: 7,
      author: "Naina",
      text: "Recommend me a book that made you think differently.",
      time: "Sample message",
    },
  ],
};

const initialDiscussions = {
  tech: [
    {
      id: 11,
      author: "Aarav",
      title: "How should beginners start with DSA?",
      body: "I'd love to hear about your learning roadmap and useful resources.",
      comments: 3,
    },
  ],
  study: [
    {
      id: 12,
      author: "Mira",
      title: "Let's make a study group",
      body: "Which subjects should we start with, and how should we organise sessions?",
      comments: 2,
    },
  ],
  art: [
    {
      id: 13,
      author: "Meher",
      title: "Share your creative journey",
      body: "What kind of art or dance are you learning at the moment?",
      comments: 4,
    },
  ],
  life: [
    {
      id: 14,
      author: "Ira",
      title: "What makes someone feel understood?",
      body: "Let's talk about the little things that make a friendship meaningful.",
      comments: 5,
    },
  ],
  career: [
    {
      id: 15,
      author: "Kabir",
      title: "What skills helped you land your first internship?",
      body: "Share practical advice for students who are just starting out.",
      comments: 2,
    },
  ],
  books: [
    {
      id: 16,
      author: "Naina",
      title: "Books that stayed with you",
      body: "Tell us about a book, a quote, or an idea you still think about.",
      comments: 6,
    },
  ],
};

function App() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showIntro, setShowIntro] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTopic, setActiveTopic] = useState("All");

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("blu_theme");
      return savedTheme === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  const [user, setUser] = useState(/** @type {any} */ (null));
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");

  function openAuthModal(mode = "login") {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
    } catch (err) {
      console.error("Logout exception:", err);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error restoring session:", error);
        }
        if (isMounted) {
          setUser(session?.user ?? null);
          setAuthLoading(false);
        }
      } catch (err) {
        console.error("Auth session restore exception:", err);
        if (isMounted) setAuthLoading(false);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("blu_theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }
  const [search, setSearch] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [votes, setVotes] = useState({});
  const [showAskForm, setShowAskForm] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(/** @type {any} */ (null));
  const [answersByQuestion, setAnswersByQuestion] = useState(initialAnswers);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [activePage, setActivePage] = useState("explore");
  const [selectedCircleId, setSelectedCircleId] = useState(/** @type {any} */ (null));
  const [joinedCircles, setJoinedCircles] = useState(/** @type {any[]} */ ([]));
  const [circleTab, setCircleTab] = useState("chat");

  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState("");

  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("bluProfile") || localStorage.getItem("askWorldProfile");

    return savedProfile
      ? JSON.parse(savedProfile)
      : {
        name: "Your Name",
        bio: "Curious mind exploring ideas, people, and possibilities.",
        interests: ["Technology", "Books", "Creative writing"],
        avatar: "🌷",
      };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);

  const filteredQuestions = questions.filter((q) => {
    const query = search.toLowerCase();

    const matchesSearch =
      q.title.toLowerCase().includes(query) ||
      q.body.toLowerCase().includes(query) ||
      q.tags.some((tag) => tag.toLowerCase().includes(query));

    const matchesTopic =
      activeTopic === "All" ||
      q.tags.some((tag) =>
        tag.toLowerCase().includes(activeTopic.toLowerCase())
      );

    return matchesSearch && matchesTopic;
  });

  const selectedCircle = initialCircles.find(
    (circle) => circle.id === selectedCircleId
  );

  function addQuestion(e) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQuestions((previous) => [
      {
        id: Date.now(),
        title: newQuestion.trim(),
        body: "A new discussion from the blu community.",
        tags: ["Community"],
        author: user ? (user.user_metadata?.full_name || user.email?.split("@")[0] || "You") : (profile.name || "You"),
        votes: 0,
        answers: 0,
      },
      ...previous,
    ]);

    setNewQuestion("");
    setShowAskForm(false);
    setActivePage("explore");
  }

  function toggleVote(id) {
    setVotes((previous) => ({
      ...previous,
      [id]: previous[id] ? 0 : 1,
    }));
  }

  function submitAnswer(e) {
    e.preventDefault();

    if (!newAnswerText.trim() || selectedQuestionId === null) return;

    const answer = {
      id: Date.now(),
      author: "You",
      body: newAnswerText.trim(),
      helpful: 0,
    };

    setAnswersByQuestion((previous) => ({
      ...previous,
      [selectedQuestionId]: [
        ...(previous[selectedQuestionId] || []),
        answer,
      ],
    }));

    setNewAnswerText("");
  }

  function toggleHelpful(answerId) {
    setHelpfulVotes((previous) => ({
      ...previous,
      [answerId]: !previous[answerId],
    }));
  }

  function openPage(page) {
    setActivePage(page);
    setSelectedCircleId(null);
    setShowAskForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  function saveProfile(e) {
    e.preventDefault();

    const updatedProfile = {
      ...profileDraft,
      interests: profileDraft.interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean),
    };

    setProfile(updatedProfile);
    localStorage.setItem("bluProfile", JSON.stringify(updatedProfile));
    localStorage.setItem("askWorldProfile", JSON.stringify(updatedProfile));
    setIsEditingProfile(false);
  }

  function startEditingProfile() {
    setProfileDraft({
      ...profile,
      interests: profile.interests.join(", "),
    });
    setIsEditingProfile(true);
  }


  function openCircle(circleId) {
    setSelectedCircleId(circleId);
    setCircleTab("chat");
    setActivePage("circles");
    setShowDiscussionForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleJoin(circleId) {
    setJoinedCircles((previous) =>
      previous.includes(circleId)
        ? previous.filter((id) => id !== circleId)
        : [...previous, circleId]
    );
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!messageText.trim() || !selectedCircleId) return;

    const newMessage = {
      id: Date.now(),
      author: "You",
      text: messageText.trim(),
      time: "Just now",
    };

    setMessages((previous) => ({
      ...previous,
      [selectedCircleId]: [
        ...(previous[selectedCircleId] || []),
        newMessage,
      ],
    }));

    setMessageText("");
  }

  function addDiscussion(e) {
    e.preventDefault();
    if (!discussionTitle.trim() || !discussionBody.trim()) return;

    const newPost = {
      id: Date.now(),
      author: "You",
      title: discussionTitle.trim(),
      body: discussionBody.trim(),
      comments: 0,
    };

    setDiscussions((previous) => ({
      ...previous,
      [selectedCircleId]: [
        newPost,
        ...(previous[selectedCircleId] || []),
      ],
    }));

    setDiscussionTitle("");
    setDiscussionBody("");
    setShowDiscussionForm(false);
  }

  function handleIntroComplete() {
    setShowIntro(false);
    try {
      const hasSeen = localStorage.getItem("blu_has_seen_onboarding");
      if (!hasSeen) {
        setShowOnboarding(true);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="app">
      {showIntro && (
        <IntroScreen onComplete={handleIntroComplete} />
      )}

      {showOnboarding && (
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      )}

      {showAuthModal && (
        <AuthModal
          key={`auth-${authModalMode}`}
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authModalMode}
        />
      )}

      <header className="navbar">
        <button
          className="brand brand-button"
          onClick={() => openPage("explore")}
          aria-label="blu home"
        >
          <BluLogo size={46} showWordmark={true} wordmarkSize={34} gap={12} className="navbar-logo" />
        </button>


        <nav>
          <button
            className={activePage === "explore" ? "nav-active" : ""}
            onClick={() => openPage("explore")}
          >
            Explore
          </button>

          <button
            className={activePage === "circles" ? "nav-active" : ""}
            onClick={() => openPage("circles")}
          >
            Circles
          </button>

          <a
            href="#topics"
            onClick={(e) => {
              e.preventDefault();
              openPage("explore");
            }}
          >
            Topics
          </a>

          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              openPage("explore");
            }}
          >
            About
          </a>

          <button
            className={activePage === "profile" ? "nav-active" : ""}
            onClick={() => openPage("profile")}
          >
            Profile
          </button>
        </nav>

        <div className="navbar-actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {user ? (
            <>
              <button
                type="button"
                className="user-nav-chip"
                onClick={() => openPage("profile")}
                title="View your profile"
              >
                <span className="user-nav-avatar">
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata.avatar_url || user.user_metadata.picture}
                      alt=""
                      className="user-nav-avatar-img"
                    />
                  ) : (
                    user.user_metadata?.avatar ||
                    (user.user_metadata?.full_name
                      ? user.user_metadata.full_name[0].toUpperCase()
                      : user.user_metadata?.name
                      ? user.user_metadata.name[0].toUpperCase()
                      : user.email
                      ? user.email[0].toUpperCase()
                      : "✦")
                  )}
                </span>
                <span className="user-nav-name">
                  {user.user_metadata?.full_name
                    ? user.user_metadata.full_name.split(" ")[0]
                    : user.user_metadata?.name
                    ? user.user_metadata.name.split(" ")[0]
                    : user.email
                    ? user.email.split("@")[0]
                    : "Profile"}
                </span>
              </button>
              <button
                type="button"
                className="auth-nav-btn auth-nav-logout"
                onClick={handleLogout}
                title="Log out of blu"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="auth-nav-btn auth-nav-login"
                onClick={() => openAuthModal("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className="auth-nav-btn auth-nav-signup"
                onClick={() => openAuthModal("signup")}
              >
                Sign up
              </button>
            </>
          )}

          <button
            className="ask-button"
            onClick={() => {
              openPage("explore");
              setShowAskForm(true);
            }}
          >
            + Ask a question
          </button>
        </div>
      </header>

      {activePage === "explore" ? (
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
                onChangeCapture={undefined}
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
                <h2>
                  Ideas worth exploring<span>.</span>
                </h2>
              </div>
              <span className="question-count">
                {filteredQuestions.length} discussions
              </span>
            </div>

            <div className="topic-row" id="topics">
              {topics.map((topic) => (
                <button
                  key={topic}
                  className={`topic-chip ${activeTopic === topic ? "selected" : ""
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
                      className={`vote-button ${votes[q.id] ? "voted" : ""
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

                      <div className="answer-actions">
                        <span className="answer-count">
                          ♧ {(answersByQuestion[q.id] || []).length} answers
                        </span>

                        <button
                          className="view-answers-button"
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            setNewAnswerText("");
                          }}
                        >
                          View answers ↗
                        </button>
                      </div>

                    </div>
                  </div>

                  <div className="card-arrow">↗</div>
                </article>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="empty-state">
                  <span>✳</span>
                  <h3>No discussions found yet.</h3>
                  <p>
                    Try another search or start the conversation yourself.
                  </p>
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

          {selectedQuestionId !== null && (
            <section className="answers-section">
              {questions
                .filter((question) => question.id === selectedQuestionId)
                .map((question) => (
                  <div key={question.id}>
                    <button
                      className="back-button"
                      onClick={() => setSelectedQuestionId(null)}
                    >
                      â† Back to questions
                    </button>

                    <div className="section-label">THE DISCUSSION</div>
                    <h2>{question.title}</h2>
                    <p>{question.body}</p>

                    <h3>
                      {(answersByQuestion[question.id] || []).length} Answers
                    </h3>

                    {(answersByQuestion[question.id] || []).map((answer) => (
                      <article className="answer-card" key={answer.id}>
                        <div className="author-row">
                          <span className="avatar">
                            {answer.author.charAt(0)}
                          </span>
                          <strong>{answer.author}</strong>
                          {answer.author === "You" && (
                            <span className="tag">Your answer</span>
                          )}
                        </div>

                        <p>{answer.body}</p>

                        <button
                          className={`helpful-button ${helpfulVotes[answer.id] ? "is-helpful" : ""
                            }`}
                          onClick={() => toggleHelpful(answer.id)}
                        >
                          {helpfulVotes[answer.id] ? "✓ Helpful" : "♡ Helpful"}
                          {" · "}
                          {answer.helpful + (helpfulVotes[answer.id] ? 1 : 0)}
                        </button>
                      </article>
                    ))}

                    <form className="answer-form" onSubmit={submitAnswer}>
                      <h3>Share your perspective</h3>
                      <textarea
                        value={newAnswerText}
                        onChange={(e) => setNewAnswerText(e.target.value)}
                        placeholder="Write an answer that could help someone..."
                        rows={4}
                        required
                      />
                      <button className="ask-button" type="submit">
                        Post your answer ↗
                      </button>
                    </form>
                  </div>
                ))}
            </section>
          )}

          <section className="community-banner" id="about">
            <span className="banner-symbol">✳</span>
            <div>
              <h2>A question can bring us closer.</h2>
              <p>
                Different minds. Shared curiosity. A world of possibilities.
              </p>
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
      ) : activePage === "circles" ? (
        <main className="circles-page">
          {!selectedCircle ? (
            <>
              <section className="hero">
                <div className="eyebrow">
                  <span className="live-dot" />
                  FIND YOUR PEOPLE
                </div>

                <h1>
                  Small circles.
                  <br />
                  <span>Big conversations.</span>
                </h1>

                <p>
                  Find people who love what you love.
                  <br className="desktop-break" />
                  Chat, exchange ideas, and learn together.
                </p>
              </section>

              <section className="feed-section">
                <div className="feed-heading">
                  <div>
                    <div className="section-label">YOUR COMMUNITIES</div>
                    <h2>
                      Explore Circles<span>.</span>
                    </h2>
                  </div>
                  <span className="question-count">
                    {joinedCircles.length} joined
                  </span>
                </div>

                <div className="circles-grid">
                  {initialCircles.map((circle) => {
                    const joined = joinedCircles.includes(circle.id);

                    return (
                      <article
                        className="question-card circle-card"
                        key={circle.id}
                      >
                        <div
                          className={`circle-icon ${circle.color}`}
                        >
                          {circle.icon}
                        </div>
                        <h3>{circle.name}</h3>
                        <p>{circle.description}</p>

                        <div className="circle-card-meta">
                          <span className="muted">
                            {circle.members +
                              (joined ? 1 : 0)} members
                          </span>
                        </div>

                        <div className="circle-card-actions">
                          <button
                            className="ask-button"
                            onClick={() => openCircle(circle.id)}
                          >
                            Open Circle ↗
                          </button>
                          <button
                            className={
                              joined
                                ? "joined-button"
                                : "cancel-button"
                            }
                            onClick={() => toggleJoin(circle.id)}
                          >
                            {joined ? "✓ Joined" : "Join"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="circle-room-hero">
                <button
                  className="back-button"
                  onClick={() => setSelectedCircleId(null)}
                >
                  â† All Circles
                </button>

                <div
                  className={`circle-icon large ${selectedCircle.color}`}
                >
                  {selectedCircle.icon}
                </div>

                <div className="eyebrow">YOUR COMMUNITY SPACE</div>
                <h1>{selectedCircle.name}</h1>
                <p>{selectedCircle.description}</p>

                <button
                  className={
                    joinedCircles.includes(selectedCircle.id)
                      ? "joined-button"
                      : "ask-button"
                  }
                  onClick={() => toggleJoin(selectedCircle.id)}
                >
                  {joinedCircles.includes(selectedCircle.id)
                    ? "✓ Joined"
                    : "Join this Circle"}
                </button>
              </section>

              <section className="feed-section circle-room-content">
                <div className="circle-tabs">
                  <button
                    className={
                      circleTab === "chat" ? "circle-tab active" : "circle-tab"
                    }
                    onClick={() => setCircleTab("chat")}
                  >
                    💬 Chat room
                  </button>
                  <button
                    className={
                      circleTab === "discussions"
                        ? "circle-tab active"
                        : "circle-tab"
                    }
                    onClick={() => setCircleTab("discussions")}
                  >
                    âœï¸ Discussions
                  </button>
                </div>

                {circleTab === "chat" ? (
                  <div className="chat-panel">
                    <div className="chat-heading">
                      <div>
                        <h2>Community chat</h2>
                        <p>
                          Say hello, share an idea, or ask the Circle.
                        </p>
                      </div>
                      <span className="online-label">
                        <span className="live-dot" /> Open room
                      </span>
                    </div>

                    <div className="chat-messages">
                      {(messages[selectedCircle.id] || []).map((message) => (
                        <article className="chat-message" key={message.id}>
                          <div className="avatar">
                            {message.author.charAt(0)}
                          </div>
                          <div className="chat-message-content">
                            <div className="chat-message-meta">
                              <strong>{message.author}</strong>
                              <span>{message.time}</span>
                            </div>
                            <p>{message.text}</p>
                          </div>
                        </article>
                      ))}

                      {(messages[selectedCircle.id] || []).length === 0 && (
                        <div className="empty-state">
                          <span>💬</span>
                          <h3>Start the conversation</h3>
                          <p>Be the first to say hello in this Circle.</p>
                        </div>
                      )}
                    </div>

                    <form className="chat-composer" onSubmit={sendMessage}>
                      <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Write a message..."
                        aria-label="Write a chat message"
                        required
                      />
                      <button className="ask-button" type="submit">
                        Send ↗
                      </button>
                    </form>

                    <p className="prototype-note">
                      This is a local demo. Messages aren't sent to other
                      members yet.
                    </p>
                  </div>
                ) : (
                  <div className="discussion-panel">
                    <div className="chat-heading">
                      <div>
                        <h2>Longer conversations</h2>
                        <p>
                          Share a question or an idea worth exploring.
                        </p>
                      </div>
                      <button
                        className="ask-button"
                        onClick={() =>
                          setShowDiscussionForm(!showDiscussionForm)
                        }
                      >
                        + New post
                      </button>
                    </div>

                    {showDiscussionForm && (
                      <form
                        className="ask-form discussion-form"
                        onSubmit={addDiscussion}
                      >
                        <h3>Start a discussion</h3>
                        <input
                          value={discussionTitle}
                          onChange={(e) =>
                            setDiscussionTitle(e.target.value)
                          }
                          placeholder="Give your post a title..."
                          required
                        />
                        <textarea
                          value={discussionBody}
                          onChange={(e) =>
                            setDiscussionBody(e.target.value)
                          }
                          placeholder="Share more details..."
                          rows={4}
                          required
                        />
                        <div className="form-actions">
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() => setShowDiscussionForm(false)}
                          >
                            Cancel
                          </button>
                          <button className="ask-button" type="submit">
                            Publish post ↗
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="discussion-list">
                      {(discussions[selectedCircle.id] || []).map((post) => (
                        <article className="discussion-card" key={post.id}>
                          <div className="author-row">
                            <span className="avatar">
                              {post.author.charAt(0)}
                            </span>
                            <span>{post.author}</span>
                            <span className="author-separator">·</span>
                            <span className="muted">Community member</span>
                          </div>
                          <h3>{post.title}</h3>
                          <p>{post.body}</p>
                          <div className="discussion-card-footer">
                            <span className="muted">
                              💬 {post.comments} comments
                            </span>
                            <span className="tag">Discussion</span>
                          </div>
                        </article>
                      ))}

                      {(discussions[selectedCircle.id] || []).length ===
                        0 && (
                          <div className="empty-state">
                            <span>âœï¸</span>
                            <h3>No posts yet</h3>
                            <p>Start a conversation for this Circle.</p>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>


      ) : (
        <main className="profile-page">
          <section className="profile-hero">
            <div className="section-label">YOUR SPACE</div>
            <h1>Your profile<span>.</span></h1>
            <p>A little introduction to the person behind the questions.</p>
          </section>

          <section className="profile-card">
            {!user && !authLoading && (
              <div className="profile-guest-banner">
                <div className="profile-guest-info">
                  <strong>Welcome to your space on blu</strong>
                  <span>Sign in or create an account to personalize your profile and participate in circles.</span>
                </div>
                <div className="profile-guest-actions">
                  <button
                    type="button"
                    className="auth-nav-btn auth-nav-login"
                    onClick={() => openAuthModal("login")}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className="auth-nav-btn auth-nav-signup"
                    onClick={() => openAuthModal("signup")}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            <div className="profile-top">
              <div className="profile-avatar">
                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                  <img
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt=""
                    className="profile-avatar-img"
                  />
                ) : (
                  user ? (user.user_metadata?.avatar || "✨") : profile.avatar
                )}
              </div>

              <div className="profile-heading">
                <h2>{user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || profile.name) : (profile.name || "Your Name")}</h2>
                <p>{user ? `${user.email} · blu community member` : "blu community member"}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                  <button
                    type="button"
                    className="cancel-button"
                    style={{ fontSize: "12px", color: "var(--purple)", padding: "4px 10px" }}
                    onClick={() => setShowOnboarding(true)}
                  >
                    Welcome guide ↗
                  </button>
                  {user && (
                    <button
                      type="button"
                      className="cancel-button profile-logout-btn"
                      style={{ fontSize: "12px", padding: "4px 10px" }}
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  )}
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  className="ask-button"
                  onClick={startEditingProfile}
                >
                  Edit profile ✎
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form className="profile-form" onSubmit={saveProfile}>
                <label htmlFor="profile-name">Your name</label>
                <input
                  id="profile-name"
                  value={profileDraft.name}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      name: e.target.value,
                    })
                  }
                  required
                />

                <label htmlFor="profile-avatar">Choose an avatar</label>
                <input
                  id="profile-avatar"
                  value={profileDraft.avatar}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      avatar: e.target.value,
                    })
                  }
                  maxLength={8}
                  required
                />

                <label htmlFor="profile-bio">About you</label>
                <textarea
                  id="profile-bio"
                  value={profileDraft.bio}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      bio: e.target.value,
                    })
                  }
                  rows={3}
                  maxLength={250}
                  placeholder="Tell the community a little about yourself..."
                />

                <label htmlFor="profile-interests">
                  Interests (separate with commas)
                </label>
                <input
                  id="profile-interests"
                  value={profileDraft.interests}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      interests: e.target.value,
                    })
                  }
                  placeholder="Technology, Books, Music"
                />

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>

                  <button className="ask-button" type="submit">
                    Save profile ↗
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-bio">
                  <h3>About me</h3>
                  <p>
                    {profile.bio || "Add a little introduction about yourself."}
                  </p>
                </div>

                <div className="profile-interests">
                  <h3>Things I love</h3>
                  <div className="tag-list">
                    {profile.interests.length > 0 ? (
                      profile.interests.map((interest) => (
                        <span className="tag" key={interest}>
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="muted">No interests added yet.</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="profile-stats">
              <div>
                <strong>{questions.filter((q) => q.author === "You").length}</strong>
                <span>Questions</span>
              </div>
              <div>
                <strong>
                  {Object.values(answersByQuestion)
                    .flat()
                    .filter((answer) => answer.author === "You").length}
                </strong>
                <span>Answers</span>
              </div>
              <div>
                <strong>{joinedCircles.length}</strong>
                <span>Circles joined</span>
              </div>
            </div>

            <div className="profile-interests">
              <h3>My Circles</h3>
              {joinedCircles.length > 0 ? (
                <div className="joined-circles-list">
                  {initialCircles
                    .filter((circle) => joinedCircles.includes(circle.id))
                    .map((circle) => (
                      <button
                        className="profile-circle-link"
                        key={circle.id}
                        onClick={() => openCircle(circle.id)}
                      >
                        {circle.icon} {circle.name} ↗
                      </button>
                    ))}
                </div>
              ) : (
                <p className="muted">
                  You haven't joined a Circle yet. Explore Circles to find your people!
                </p>
              )}

              <button
                className="cancel-button profile-circles-button"
                onClick={() => openPage("circles")}
              >
                Explore Circles
              </button>
            </div>
          </section>
        </main>
      )}



      <footer>
        <button
          className="brand brand-button footer-brand"
          onClick={() => openPage("explore")}
          aria-label="blu home"
        >
          <BluLogo size={24} showWordmark={true} wordmarkSize={18} />
        </button>
        <span>Where curiosity, experience, and people meet.</span>
        <span>© 2026 blu</span>
      </footer>
    </div>
  );
}

export default App;
