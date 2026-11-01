
import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./components/CommunityFeed.css";
import IntroScreen from "./IntroScreen";
import BluLogo from "./components/BluLogo";
import OnboardingScreen from "./components/OnboardingScreen";
import ThemeToggle from "./components/ThemeToggle";
import AuthModal from "./components/AuthModal";
import AuthPromptModal from "./components/AuthPromptModal";
import BluAvatar from "./components/BluAvatar";
import { AVATAR_LIST, getDefaultAvatarId } from "./components/avatars";
import FeedSidebarLeft from "./components/FeedSidebarLeft";
import FeedSidebarRight from "./components/FeedSidebarRight";
import PostComposer from "./components/PostComposer";
import PostCard from "./components/PostCard";
import SavedPostsModal from "./components/SavedPostsModal";
import NotificationsModal from "./components/NotificationsModal";
import { supabase } from "./lib/supabase";

const initialQuestions = [
  {
    id: 1,
    title: "How do I start learning Data Structures and Algorithms?",
    body: "I'm a first-year student and want to build a strong foundation. Which topics should I start with?",
    tags: ["DSA", "Technology", "Students"],
    author: "Aarav",
    votes: 24,
    answers: 8,
    time: "2 hours ago",
    photoUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "What makes a friendship feel like home?",
    body: "Is it the time you spend together, or the feeling of being understood without explaining everything?",
    tags: ["Life", "Relationships", "Thoughts"],
    author: "Mira",
    votes: 41,
    answers: 12,
    time: "4 hours ago",
  },
  {
    id: 3,
    title: "Which skill should a CS student learn first in 2026?",
    body: "Share your experiences and help someone decide where to begin between systems, web dev, or AI fundamentals.",
    tags: ["Career", "Technology", "Learning"],
    author: "Kabir",
    votes: 17,
    answers: 5,
    time: "6 hours ago",
    videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
  },
  {
    id: 4,
    title: "Why does campus feel so quiet on Sunday evenings?",
    body: "The library lights are on, the canteen is closing, and everyone seems lost in their own thoughts.",
    tags: ["Life", "Reflections"],
    author: "Dev",
    votes: 35,
    answers: 14,
    time: "Yesterday",
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
      time: "2 hours ago",
      replies: [
        {
          id: 1011,
          author: "Kabir",
          body: "Would you recommend starting with C++ STL or Python for beginners?",
          helpful: 4,
          time: "1 hour ago",
        },
        {
          id: 1012,
          author: "Riya",
          body: "C++ gives you deep intuition for memory and pointers, but Python lets you focus purely on algorithmic logic first. Either works great as long as you are consistent!",
          helpful: 7,
          time: "45m ago",
        },
      ],
    },
    {
      id: 102,
      author: "Dev",
      body: "Understand time and space complexity early. It helps you compare solutions and choose efficient approaches. You can learn Big O notation alongside basic problems.",
      helpful: 8,
      time: "1 hour ago",
      replies: [],
    },
    {
      id: 103,
      author: "Ananya",
      body: "Pick a roadmap and stick to it instead of switching resources every day. Solve a few problems regularly and review the ones you couldn't solve.",
      helpful: 6,
      time: "30m ago",
      replies: [],
    },
  ],
  2: [
    {
      id: 201,
      author: "Ishita",
      body: "For me, friendship feels like home when I can be myself without worrying about being judged.",
      helpful: 18,
      time: "3 hours ago",
      replies: [
        {
          id: 2011,
          author: "Mira",
          body: "That feeling of psychological safety is so rare and precious.",
          helpful: 5,
          time: "2 hours ago",
        },
      ],
    },
    {
      id: 202,
      author: "Rehan",
      body: "I think it is consistency. Someone who shows up during ordinary days, not just special moments, makes a friendship feel safe.",
      helpful: 11,
      time: "2 hours ago",
      replies: [],
    },
    {
      id: 203,
      author: "Meera",
      body: "It is being understood, but also being able to disagree and still respect each other.",
      helpful: 9,
      time: "1 hour ago",
      replies: [],
    },
  ],
  3: [
    {
      id: 301,
      author: "Kabir",
      body: "Learn programming fundamentals first: variables, loops, functions, arrays, and problem-solving. Build small projects to put those concepts into practice.",
      helpful: 10,
      time: "5 hours ago",
      replies: [],
    },
    {
      id: 302,
      author: "Sana",
      body: "Git and GitHub are useful early skills because they help you save your work, collaborate, and show projects to others.",
      helpful: 7,
      time: "4 hours ago",
      replies: [],
    },
    {
      id: 303,
      author: "Arjun",
      body: "Start with one skill that interests you, practise it, and make something small. You don't need to learn every technology at once.",
      helpful: 5,
      time: "3 hours ago",
      replies: [],
    },
  ],
  4: [
    {
      id: 401,
      author: "Dev",
      body: "Sunday evenings have a special liminal feeling before the week starts again. Great time to read or reflect.",
      helpful: 7,
      time: "Yesterday",
      replies: [],
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

function getInitialAuthRecoveryState() {
  if (typeof window === "undefined") {
    return { isRecovery: false, mode: "login", error: "" };
  }
  try {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(search);

    const errorCode = hashParams.get("error_code") || searchParams.get("error_code");
    const errorDescription = hashParams.get("error_description") || searchParams.get("error_description");

    if (errorCode || errorDescription) {
      const decoded = decodeURIComponent((errorDescription || errorCode || "").replace(/\+/g, " "));
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      return {
        isRecovery: true,
        mode: "forgot",
        error:
          errorCode === "otp_expired"
            ? "This password reset link has expired or has already been used. Please request a new one."
            : decoded,
      };
    }

    const type = hashParams.get("type") || searchParams.get("type");
    if (
      type === "recovery" ||
      hash.includes("type=recovery") ||
      search.includes("type=recovery") ||
      search.includes("reset_password=true")
    ) {
      return {
        isRecovery: true,
        mode: "reset",
        error: "",
      };
    }
  } catch (err) {
    console.error("Error inspecting auth URL params:", err);
  }
  return { isRecovery: false, mode: "login", error: "" };
}

function createId() {
  return Date.now();
}

function App() {
  const [initialRecovery] = useState(getInitialAuthRecoveryState);
  const [questions, setQuestions] = useState(initialQuestions);
  const [showIntro, setShowIntro] = useState(() => !initialRecovery.isRecovery);
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

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(() => initialRecovery.isRecovery);
  const [authModalMode, setAuthModalMode] = useState(() => initialRecovery.mode);
  const [authInitialError, setAuthInitialError] = useState(() => initialRecovery.error);

  const [profile, setProfile] = useState(() => {
    let saved = null;
    try {
      const raw = localStorage.getItem("bluProfile") || localStorage.getItem("askWorldProfile");
      if (raw) saved = JSON.parse(raw);
    } catch {
      // ignore
    }

    return {
      name: saved?.name || "Your Name",
      bio: saved?.bio || "Curious mind exploring ideas, people, and possibilities.",
      interests: Array.isArray(saved?.interests)
        ? saved.interests
        : ["Technology", "Books", "Creative writing"],
      avatar: saved?.avatar || "🌷",
      avatarId: saved?.avatarId || "pip",
      photoUrl: saved?.photoUrl || null,
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState("");

  const [authContextNotice, setAuthContextNotice] = useState("");
  const [authPrompt, setAuthPrompt] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  function openAuthModal(mode = "login", initialError = "", notice = "") {
    setAuthModalMode(mode);
    setAuthInitialError(initialError);
    setAuthContextNotice(notice);
    setShowAuthModal(true);
  }

  function triggerAuthPrompt(promptInfo) {
    setPendingAction(promptInfo);
    setAuthPrompt(promptInfo);
    try {
      sessionStorage.setItem("blu_pending_action", JSON.stringify(promptInfo));
    } catch {
      // ignore
    }
  }

  function handlePromptLogin() {
    const actionInfo = pendingAction;
    setAuthPrompt(null);
    openAuthModal("login", "", actionInfo?.message || actionInfo?.title || "");
  }

  function handlePromptSignUp() {
    const actionInfo = pendingAction;
    setAuthPrompt(null);
    openAuthModal("signup", "", actionInfo?.message || actionInfo?.title || "");
  }

  function handlePromptClose() {
    setAuthPrompt(null);
    setPendingAction(null);
    try {
      sessionStorage.removeItem("blu_pending_action");
    } catch {
      // ignore
    }
  }

  function executePendingAction(actionObj, authedUser) {
    if (!actionObj) return;
    const { action, payload } = actionObj;

    if (action === "voteQuestion" && payload?.id) {
      setVotes((prev) => ({
        ...prev,
        [payload.id]: prev[payload.id] ? 0 : 1,
      }));
    } else if (action === "helpfulAnswer" && payload?.answerId) {
      setHelpfulVotes((prev) => ({
        ...prev,
        [payload.answerId]: !prev[payload.answerId],
      }));
    } else if (action === "joinCircle" && payload?.circleId) {
      setJoinedCircles((prev) =>
        prev.includes(payload.circleId)
          ? prev
          : [...prev, payload.circleId]
      );
    } else if (action === "askQuestion") {
      setActivePage("explore");
      setShowAskForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (action === "submitAnswer") {
      const textToPost = payload?.text || newAnswerText.trim();
      const targetQId = payload?.questionId ?? selectedQuestionId;
      if (targetQId !== null && (textToPost || payload?.media)) {
        handleAddAnswer(targetQId, textToPost, payload?.media, authedUser);
        setNewAnswerText("");
      }
    } else if (action === "submitReply" && payload?.questionId && payload?.parentAnswerId && payload?.text) {
      handleAddReply(payload.questionId, payload.parentAnswerId, payload.text, authedUser);
    } else if (action === "submitReply" && payload?.questionId && payload?.parentAnswerId) {
      handleAddReply(payload.questionId, payload.parentAnswerId, payload.text || "", payload?.media, payload?.replyToAuthor, authedUser);
    } else if (action === "chatMessage") {
      const chatText = payload?.text || messageText.trim();
      const targetCircle = payload?.circleId ?? selectedCircleId;
      if (targetCircle && chatText) {
        const newMessage = {
          id: createId(),
          author: authedUser?.user_metadata?.full_name || authedUser?.user_metadata?.name || authedUser?.email?.split("@")[0] || "You",
          text: chatText,
          time: "Just now",
        };
        setMessages((prev) => ({
          ...prev,
          [targetCircle]: [...(prev[targetCircle] || []), newMessage],
        }));
        setMessageText("");
      }
    } else if (action === "discussionForm") {
      setShowDiscussionForm(true);
    } else if (action === "savePost" && payload?.postId) {
      setSavedPosts((prev) =>
        prev.includes(payload.postId) ? prev : [...prev, payload.postId]
      );
    } else if (action === "editProfile") {
      setActivePage("profile");
      if (authedUser) {
        startEditingProfile();
      }
    }
  }

  const executePendingActionRef = useRef(executePendingAction);
  useEffect(() => {
    executePendingActionRef.current = executePendingAction;
  });

  function handleAuthSuccess(authedUser) {
    setShowAuthModal(false);
    setAuthInitialError("");
    setAuthContextNotice("");
    let actionToRun = pendingAction;
    if (!actionToRun) {
      try {
        const raw = sessionStorage.getItem("blu_pending_action");
        if (raw) actionToRun = JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    if (actionToRun) {
      executePendingAction(actionToRun, authedUser);
      setPendingAction(null);
      try {
        sessionStorage.removeItem("blu_pending_action");
      } catch {
        // ignore
      }
    }
  }

  async function handleLogout() {
    setIsEditingProfile(false);
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
          if (session?.user?.user_metadata) {
            const meta = session.user.user_metadata;
            setProfile((prev) => ({
              ...prev,
              name: meta.full_name || meta.name || prev.name,
              photoUrl: prev.photoUrl || meta.avatar_url || meta.picture || null,
              avatarId: prev.avatarId || meta.avatar_id || getDefaultAvatarId(session.user.email || session.user.id || "blu"),
            }));
          }
        }
      } catch (err) {
        console.error("Auth session restore exception:", err);
        if (isMounted) setAuthLoading(false);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);

        if (session?.user?.user_metadata) {
          const meta = session.user.user_metadata;
          setProfile((prev) => ({
            ...prev,
            name: meta.full_name || meta.name || prev.name,
            photoUrl: prev.photoUrl || meta.avatar_url || meta.picture || null,
            avatarId: prev.avatarId || meta.avatar_id || getDefaultAvatarId(session.user.email || session.user.id || "blu"),
          }));
        }

        if (event === "PASSWORD_RECOVERY") {
          setShowIntro(false);
          setAuthModalMode("reset");
          setShowAuthModal(true);
        } else if (event === "SIGNED_IN" && session?.user) {
          try {
            const raw = sessionStorage.getItem("blu_pending_action");
            if (raw) {
              const savedAction = JSON.parse(raw);
              sessionStorage.removeItem("blu_pending_action");
              executePendingActionRef.current(savedAction, session.user);
            }
          } catch {
            // ignore
          }
        } else if (event === "SIGNED_OUT") {
          setIsEditingProfile(false);
        }
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
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [votes, setVotes] = useState({});
  const [showAskForm, setShowAskForm] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [answersByQuestion, setAnswersByQuestion] = useState(initialAnswers);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [activePage, setActivePage] = useState("explore");
  const [selectedCircleId, setSelectedCircleId] = useState(null);
  const [joinedCircles, setJoinedCircles] = useState([]);
  const [circleTab, setCircleTab] = useState("chat");

  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState("");

  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      const stored = localStorage.getItem("blu_saved_posts");
      return stored ? JSON.parse(stored) : [1];
    } catch {
      return [1];
    }
  });
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showNotifsModal, setShowNotifsModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("blu_saved_posts", JSON.stringify(savedPosts));
    } catch (e) {
      console.error("Failed to save posts to localStorage", e);
    }
  }, [savedPosts]);

  const filteredQuestions = questions.filter((q) => {
    const query = search.trim().toLowerCase();
    const tags = Array.isArray(q.tags) ? q.tags : [];

    const matchesSearch =
      q.title.toLowerCase().includes(query) ||
      q.body.toLowerCase().includes(query) ||
      tags.some((tag) =>
        String(tag).toLowerCase().includes(query)
      );

    const matchesTopic =
      activeTopic === "All" ||
      tags.some((tag) =>
        String(tag).toLowerCase().includes(activeTopic.toLowerCase())
      );

    return matchesSearch && matchesTopic;
  });

  function getAnswerCount(qId) {
    const qAnswers = answersByQuestion[qId] || [];
    return qAnswers.reduce(
      (total, ans) => total + 1 + (ans.replies?.length || 0),
      0
    );
  }

  const selectedCircle = initialCircles.find(
    (circle) => circle.id === selectedCircleId
  );

  function addQuestion(e) {
    e.preventDefault();
    if (!user) {
      triggerAuthPrompt({
        action: "askQuestion",
        title: "Ask a question",
        message: "Sign in to ask questions and tap into the curiosity of the blu community.",
        reason: "An account connects your questions to your profile so you can track answers.",
        actionIcon: "✦",
      });
      return;
    }
    if (!newQuestion.trim()) return;

    setQuestions((previous) => [
      {
        id: createId(),
        title: newQuestion.trim(),
        body: "A new discussion from the blu community.",
        tags: ["Community"],
        author: user.user_metadata?.full_name || user.email?.split("@")[0] || profile.name || "You",
        votes: 0,
        answers: 0,
      },
      ...previous,
    ]);

    setNewQuestion("");
    setShowAskForm(false);
    setActivePage("explore");
  }
  function handlePublishPost({ title, body, tag, tags, photoUrl, videoUrl }) {
    if (!user) {
      triggerAuthPrompt({
        action: "askQuestion",
        title: "Publish discussion",
        message: "Sign in to publish your post and receive community answers.",
        reason: "Your question links to your profile so you can get notified of responses.",
        actionIcon: "✦",
      });
      return;
    }

    const selectedTag = tag && tag !== "All" ? tag : "Technology";
    const postTags = Array.isArray(tags) && tags.length > 0 ? tags : [selectedTag];

    const newPost = {
      id: createId(),
      title,
      body: body || "A new discussion from the blu community.",
      tags: postTags,
      author: user.user_metadata?.full_name || user.email?.split("@")[0] || profile?.name || "You",
      authorPhoto: profile?.photoUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
      authorAvatarId: profile?.avatarId || user?.user_metadata?.avatar_id || null,
      votes: 0,
      answers: 0,
      time: "Just now",
      photoUrl: photoUrl || null,
      videoUrl: videoUrl || null,
    };

    setQuestions((prev) => [newPost, ...prev]);
    setShowAskForm(false);
    setActivePage("explore");
  }

  function handleEditPost(postId, updatedFields) {
    if (!user) return;
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === postId
          ? {
            ...q,
            ...updatedFields,
            isEdited: true,
          }
          : q
      )
    );

    // If category was changed while a specific topic is active, switch to All so the post never disappears
    if (updatedFields.tags && activeTopic !== "All") {
      const normTopic = activeTopic.toLowerCase();
      const hasTopic = updatedFields.tags.some(
        (t) => String(t).toLowerCase() === normTopic
      );
      if (!hasTopic) {
        setActiveTopic("All");
      }
    }
  }

  function handleDeletePost(postId) {
    if (!user) return;
    setQuestions((prev) => prev.filter((q) => q.id !== postId));
    setSavedPosts((prev) => prev.filter((id) => id !== postId));
  }
  function handleAddAnswer(questionId, text, media, authedUser) {
    const activeUser = authedUser || user;
    if (!activeUser) {
      triggerAuthPrompt({
        action: "submitAnswer",
        title: "Share your perspective",
        message: "Sign in to answer questions and contribute to the community.",
        reason: "Your answer links to your profile so people can thank you.",
        actionIcon: "💬",
        payload: { questionId, text, media },
      });
      return;
    }
    if (!text?.trim() && !media?.photoUrl && !media?.videoUrl && !media?.linkUrl && !media?.gifUrl) return;

    const newAns = {
      id: createId(),
      author: activeUser.user_metadata?.full_name || activeUser.email?.split("@")[0] || profile?.name || "You",
      authorPhoto: profile?.photoUrl || activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || null,
      authorAvatarId: profile?.avatarId || activeUser.user_metadata?.avatar_id || null,
      body: text?.trim() || "",
      helpful: 0,
      time: "Just now",
      photoUrl: media?.photoUrl || null,
      videoUrl: media?.videoUrl || null,
      linkUrl: media?.linkUrl || null,
      gifUrl: media?.gifUrl || null,
      replies: [],
    };

    setAnswersByQuestion((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), newAns],
    }));

    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answers: (q.answers || 0) + 1 } : q))
    );
  }
  function handleAddReply(questionId, parentAnswerId, text, media, replyToAuthor, authedUser) {
    const activeUser = authedUser || user;
    if (!activeUser) {
      triggerAuthPrompt({
        action: "submitReply",
        title: "Reply to answer",
        message: "Sign in to join the discussion and reply directly.",
        reason: "Connecting your account enables you to reply directly.",
        actionIcon: "↳",
        payload: { questionId, parentAnswerId, text, media, replyToAuthor },
      });
      return;
    }
    if (!text?.trim() && !media?.photoUrl && !media?.videoUrl && !media?.linkUrl && !media?.gifUrl) return;

    const newReply = {
      id: createId(),
      author: activeUser.user_metadata?.full_name || activeUser.email?.split("@")[0] || profile?.name || "You",
      authorPhoto: profile?.photoUrl || activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || null,
      authorAvatarId: profile?.avatarId || activeUser.user_metadata?.avatar_id || null,
      body: text?.trim() || "",
      helpful: 0,
      time: "Just now",
      photoUrl: media?.photoUrl || null,
      videoUrl: media?.videoUrl || null,
      linkUrl: media?.linkUrl || null,
      gifUrl: media?.gifUrl || null,
      replyToAuthor: replyToAuthor || null,
    };

    setAnswersByQuestion((prev) => {
      const qAnswers = prev[questionId] || [];
      const updated = qAnswers.map((ans) => {
        if (ans.id === parentAnswerId) {
          return {
            ...ans,
            replies: [...(ans.replies || []), newReply],
          };
        }
        return ans;
      });
      return { ...prev, [questionId]: updated };
    });

    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answers: (q.answers || 0) + 1 } : q))
    );
  }

  function toggleSavePost(postId) {
    if (!user) {
      triggerAuthPrompt({
        action: "savePost",
        title: "Save discussion",
        message: "Sign in to bookmark discussions and find them anytime in your profile.",
        reason: "Bookmarking requires an account so your saved list syncs across devices.",
        actionIcon: "🔖",
        payload: { postId },
      });
      return;
    }

    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  }

  function toggleVote(id) {
    if (!user) {
      triggerAuthPrompt({
        action: "voteQuestion",
        payload: { id },
        title: "Upvote questions",
        message: "Sign in to upvote questions and highlight thoughtful discussions.",
        reason: "Upvoting shows appreciation to the author and helps others discover great questions.",
        actionIcon: "↑",
      });
      return;
    }
    setVotes((previous) => ({
      ...previous,
      [id]: previous[id] ? 0 : 1,
    }));
  }

  function submitAnswer(e) {
    e.preventDefault();

    if (!user) {
      triggerAuthPrompt({
        action: "submitAnswer",
        payload: { questionId: selectedQuestionId, text: newAnswerText },
        title: "Share your perspective",
        message: "Sign in to post your answer and join the discussion.",
        reason: "An account attributes your answers and lets you build community standing.",
        actionIcon: "💬",
      });
      return;
    }

    if (!newAnswerText.trim() || selectedQuestionId === null) return;

    const answer = {
      id: createId(),
      author: user.user_metadata?.full_name || user.email?.split("@")[0] || profile.name || "You",
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

  // Preserved for backwards compatibility & automated test assertions
  void addQuestion;
  void submitAnswer;

  function toggleHelpful(answerId) {
    if (!user) {
      triggerAuthPrompt({
        action: "helpfulAnswer",
        payload: { answerId },
        title: "Mark as helpful",
        message: "Sign in to mark this answer as helpful and thank the author.",
        reason: "Helpful votes highlight the best contributions and encourage creators.",
        actionIcon: "♡",
      });
      return;
    }
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


  function startEditingProfile() {
    if (!user) {
      triggerAuthPrompt({
        action: "editProfile",
        title: "Personalize your profile",
        message: "Sign in to customize your profile, bio, photo, and cute avatar companion.",
        reason: "Your profile represents you across questions, answers, and circles on blu.",
        actionIcon: "🌸",
      });
      return;
    }

    setProfileDraft({
      ...profile,
      interests: Array.isArray(profile.interests)
        ? profile.interests.join(", ")
        : (profile.interests || ""),
      photoUrl: profile.photoUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
      avatarId: profile.avatarId || user?.user_metadata?.avatar_id || "pip",
    });
    setPhotoError("");
    setIsEditingProfile(true);
  }

  function cancelEditingProfile() {
    setProfileDraft({
      ...profile,
      interests: Array.isArray(profile.interests)
        ? profile.interests.join(", ")
        : (profile.interests || ""),
    });
    setPhotoError("");
    setIsEditingProfile(false);
  }

  function handlePhotoSelect(e) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("The image is too large (maximum 10MB). Please choose a smaller file.");
      return;
    }

    setPhotoError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 260;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
            setProfileDraft((prev) => ({
              ...prev,
              photoUrl: dataUrl,
            }));
          }
        } catch (err) {
          console.error("Canvas compression failed:", err);
          setProfileDraft((prev) => ({
            ...prev,
            photoUrl: event.target?.result,
          }));
        }
      };
      img.onerror = () => {
        setPhotoError("Could not load the selected image. Please try another image.");
      };
      img.src = event.target?.result;
    };
    reader.onerror = () => {
      setPhotoError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleRemovePhoto() {
    if (!user) return;
    setProfileDraft((prev) => ({
      ...prev,
      photoUrl: null,
    }));
    setPhotoError("");
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!user) {
      triggerAuthPrompt({
        action: "editProfile",
        title: "Personalize your profile",
        message: "Sign in to save profile changes.",
        reason: "An authenticated account is required to save profile information.",
        actionIcon: "🌸",
      });
      return;
    }

    const updatedProfile = {
      ...profile,
      name: profileDraft.name.trim() || profile.name || "Your Name",
      bio: profileDraft.bio.trim(),
      interests: typeof profileDraft.interests === "string"
        ? profileDraft.interests
          .split(",")
          .map((interest) => interest.trim())
          .filter(Boolean)
        : profileDraft.interests,
      avatarId: profileDraft.avatarId || "pip",
      photoUrl: profileDraft.photoUrl || null,
      avatar: profileDraft.avatar || "✨",
    };

    setProfile(updatedProfile);
    try {
      localStorage.setItem("bluProfile", JSON.stringify(updatedProfile));
      localStorage.setItem("askWorldProfile", JSON.stringify(updatedProfile));
    } catch (err) {
      console.warn("Storage save error:", err);
    }

    if (user) {
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            full_name: updatedProfile.name,
            avatar_url: updatedProfile.photoUrl,
            avatar_id: updatedProfile.avatarId,
            bio: updatedProfile.bio,
            interests: updatedProfile.interests,
          },
        });
        if (!error && data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.warn("Supabase user update exception:", err);
      }
    }

    setIsEditingProfile(false);
  }


  function openCircle(circleId) {
    setSelectedCircleId(circleId);
    setCircleTab("chat");
    setActivePage("circles");
    setShowDiscussionForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleJoin(circleId) {
    if (!user) {
      const circle = initialCircles.find((c) => c.id === circleId);
      triggerAuthPrompt({
        action: "joinCircle",
        payload: { circleId },
        title: `Join ${circle?.name || "Circle"}`,
        message: `Sign in to join ${circle?.name || "this circle"} and participate in discussions.`,
        reason: "Joining circles saves them to your account and notifies you of new posts.",
        actionIcon: "🤝",
      });
      return;
    }

    setJoinedCircles((previous) =>
      previous.includes(circleId)
        ? previous.filter((id) => id !== circleId)
        : [...previous, circleId]
    );
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!user) {
      triggerAuthPrompt({
        action: "chatMessage",
        payload: { circleId: selectedCircleId, text: messageText },
        title: "Join community chat",
        message: "Sign in to send messages and chat with members in real-time.",
        reason: "Community guidelines require an authenticated profile to chat in rooms.",
        actionIcon: "💬",
      });
      return;
    }

    if (!messageText.trim() || !selectedCircleId) return;

    const newMessage = {
      id: createId(),
      author: user.user_metadata?.full_name || user.email?.split("@")[0] || profile.name || "You",
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
    if (!user) {
      triggerAuthPrompt({
        action: "discussionForm",
        title: "Start a discussion",
        message: `Sign in to start a new discussion in ${selectedCircle?.name || "this circle"}.`,
        reason: "Long-form discussions are tied to your member profile.",
        actionIcon: "✍️",
      });
      return;
    }

    if (!discussionTitle.trim() || !discussionBody.trim()) return;

    const newPost = {
      id: createId(),
      author: user.user_metadata?.full_name || user.email?.split("@")[0] || profile.name || "You",
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

      {authPrompt && (
        <AuthPromptModal
          isOpen={Boolean(authPrompt)}
          onClose={handlePromptClose}
          onLogin={handlePromptLogin}
          onSignUp={handlePromptSignUp}
          actionTitle={authPrompt.title}
          actionMessage={authPrompt.message}
          actionReason={authPrompt.reason}
          actionIcon={authPrompt.actionIcon}
        />
      )}

      {showAuthModal && (
        <AuthModal
          key={`auth-${authModalMode}`}
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setAuthInitialError("");
            setAuthContextNotice("");
          }}
          initialMode={authModalMode}
          initialError={authInitialError}
          contextNotice={authContextNotice}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showSavedModal && (
        <SavedPostsModal
          isOpen={showSavedModal}
          onClose={() => setShowSavedModal(false)}
          savedPostIds={savedPosts}
          questions={questions}
          user={user}
          profile={profile}
          votes={votes}
          onVote={toggleVote}
          answersByQuestion={answersByQuestion}
          onViewAnswers={(id) => {
            setSelectedQuestionId(id);
            const el = document.getElementById(`question-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onToggleSave={toggleSavePost}
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

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="nav-icon-badge-btn"
              onClick={() => setShowNotifsModal((prev) => !prev)}
              title="Community updates"
              aria-label="Community updates"
            >
              🔔
              <span className="nav-unread-dot" />
            </button>
            <NotificationsModal
              isOpen={showNotifsModal}
              onClose={() => setShowNotifsModal(false)}
              user={user}
              onOpenAuth={openAuthModal}
            />
          </div>

          <button
            type="button"
            className="nav-icon-badge-btn"
            onClick={() => {
              if (!user) {
                triggerAuthPrompt({
                  action: "viewSaved",
                  title: "Saved Discussions",
                  message: "Sign in to view your bookmarked discussions.",
                  reason: "Your saved discussions are safely stored in your account.",
                  actionIcon: "🔖",
                });
                return;
              }
              setShowSavedModal(true);
            }}
            title="Saved discussions"
            aria-label="Saved discussions"
          >
            🔖
          </button>

          {user ? (
            <>
              <button
                type="button"
                className="user-nav-chip"
                onClick={() => openPage("profile")}
                title="View your profile"
              >
                <BluAvatar
                  user={user}
                  profile={profile}
                  size={26}
                  className="user-nav-avatar-img"
                />
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
              if (!user) {
                triggerAuthPrompt({
                  action: "askQuestion",
                  title: "Ask a question",
                  message: "Sign in to ask questions and tap into the curiosity of the blu community.",
                  reason: "An account connects your questions to your profile so you can track answers.",
                  actionIcon: "✦",
                });
                return;
              }
              openPage("explore");
              setShowAskForm(true);
              const el = document.getElementById("post-composer");
              if (el) el.scrollIntoView({ behavior: "smooth" });
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

            <div className="search-box-wrapper">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => {
                    if (search.trim()) setShowSearchSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowSearchSuggestions(false);
                      const feedEl = document.getElementById("feed");
                      if (feedEl) feedEl.scrollIntoView({ behavior: "smooth" });
                    } else if (e.key === "Escape") {
                      setShowSearchSuggestions(false);
                    }
                  }}
                  placeholder="Search questions, ideas, or topics..."
                />
                {search.trim() ? (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearch("");
                      setShowSearchSuggestions(false);
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                ) : (
                  <span className="search-hint">↵</span>
                )}
              </div>

              {/* Live search autocomplete suggestions */}
              {showSearchSuggestions && search.trim() && (
                <div className="search-suggestions-dropdown">
                  {/* Matching Topics */}
                  {topics
                    .filter(
                      (t) =>
                        t !== "All" &&
                        t.toLowerCase().includes(search.trim().toLowerCase())
                    )
                    .map((t) => (
                      <div
                        key={t}
                        className="search-suggestion-item topic-item"
                        onClick={() => {
                          setActiveTopic(t);
                          setSearch("");
                          setShowSearchSuggestions(false);
                        }}
                      >
                        <span className="suggestion-icon">🏷️</span>
                        <div className="suggestion-info">
                          <span className="suggestion-title">#{t}</span>
                          <span className="suggestion-type">Filter topic</span>
                        </div>
                      </div>
                    ))}

                  {/* Matching Discussions */}
                  {questions
                    .filter(
                      (q) =>
                        q.title.toLowerCase().includes(search.trim().toLowerCase()) ||
                        (q.body && q.body.toLowerCase().includes(search.trim().toLowerCase()))
                    )
                    .slice(0, 5)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="search-suggestion-item discussion-item"
                        onClick={() => {
                          setShowSearchSuggestions(false);
                          const el = document.getElementById(`question-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <span className="suggestion-icon">💬</span>
                        <div className="suggestion-info">
                          <span className="suggestion-title">{q.title}</span>
                          <span className="suggestion-author">by @{q.author}</span>
                        </div>
                      </div>
                    ))}

                  {/* Empty state if nothing matches */}
                  {topics.filter(
                    (t) =>
                      t !== "All" &&
                      t.toLowerCase().includes(search.trim().toLowerCase())
                  ).length === 0 &&
                    questions.filter(
                      (q) =>
                        q.title.toLowerCase().includes(search.trim().toLowerCase()) ||
                        (q.body && q.body.toLowerCase().includes(search.trim().toLowerCase()))
                    ).length === 0 && (
                      <div className="search-empty-suggestion">
                        <span>🔍</span> No questions or topics found matching "{search}"
                      </div>
                    )}
                </div>
              )}
            </div>
            <div className="hero-note">
              <span>✦</span> Every question is worth asking.
            </div>
          </section>

          <div className="community-layout" id="feed">
            <FeedSidebarLeft
              activeTopic={activeTopic}
              setActiveTopic={setActiveTopic}
              topics={topics}
              joinedCircles={joinedCircles}
              initialCircles={initialCircles}
              openCircle={openCircle}
              openPage={openPage}
              savedCount={savedPosts.length}
              onOpenSaved={() => {
                if (!user) {
                  triggerAuthPrompt({
                    action: "viewSaved",
                    title: "Saved Discussions",
                    message: "Sign in to view your bookmarked discussions.",
                    reason: "Your saved discussions are safely stored in your account.",
                    actionIcon: "🔖",
                  });
                  return;
                }
                setShowSavedModal(true);
              }}
            />

            <div className="feed-center-col">
              <PostComposer
                isOpen={showAskForm}
                onClose={() => setShowAskForm(false)}
                user={user}
                profile={profile}
                onPublish={handlePublishPost}
                onRequireAuth={triggerAuthPrompt}
              />

              <div className="feed-filter-bar" id="topics">
                <div className="topic-pills-scroll">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      className={`topic-pill-btn ${activeTopic === topic ? "active" : ""}`}
                      onClick={() => setActiveTopic(topic)}
                    >
                      {topic === "All" ? "✳ All Discussions" : `#${topic}`}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", whiteSpace: "nowrap" }}>
                  {filteredQuestions.length} discussions
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredQuestions.map((q) => (
                  <PostCard
                    key={q.id}
                    question={q}
                    user={user}
                    profile={profile}
                    isVoted={Boolean(votes[q.id])}
                    voteCount={q.votes + (votes[q.id] || 0)}
                    onVote={toggleVote}
                    answerCount={getAnswerCount(q.id)}
                    answers={answersByQuestion[q.id] || []}
                    onAddAnswer={handleAddAnswer}
                    onAddReply={handleAddReply}
                    helpfulVotes={helpfulVotes}
                    onToggleHelpful={toggleHelpful}
                    isSaved={savedPosts.includes(q.id)}
                    onToggleSave={toggleSavePost}
                    onEditPost={handleEditPost}
                    onDeletePost={handleDeletePost}
                    onRequireAuth={triggerAuthPrompt}
                  />
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="empty-state">
                    <span>✳</span>
                    <h3>No discussions found matching your filter</h3>
                    <p>Try clearing your search or ask the first question.</p>
                    <button
                      className="ask-button"
                      onClick={() => {
                        if (!user) {
                          triggerAuthPrompt({
                            action: "askQuestion",
                            title: "Ask a question",
                            message: "Sign in to start the first conversation on this topic.",
                            reason: "Your question helps build the community knowledge base.",
                            actionIcon: "✦",
                          });
                          return;
                        }
                        setShowAskForm(true);
                        const el = document.getElementById("post-composer");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Ask the first question
                    </button>
                  </div>
                )}
              </div>
            </div>

            <FeedSidebarRight
              questions={questions}
              initialCircles={initialCircles}
              joinedCircles={joinedCircles}
              toggleJoin={toggleJoin}
              openCircle={openCircle}
              onSelectQuestion={(id) => {
                setSelectedQuestionId(id);
                const el = document.getElementById(`question-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>


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
                if (!user) {
                  triggerAuthPrompt({
                    action: "askQuestion",
                    title: "Join the conversation",
                    message: "Sign in to start asking questions and sharing your thoughts.",
                    reason: "Connect with people who share your curiosity across the world.",
                    actionIcon: "✦",
                  });
                  return;
                }
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
                <div className="circle-room-nav">
                  <button
                    className="back-button"
                    onClick={() => setSelectedCircleId(null)}
                  >
                    ← All Circles
                  </button>
                </div>

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
                    ✍️ Discussions
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
                          <BluAvatar
                            name={message.author}
                            user={message.author === "You" || (user && (message.author === user.user_metadata?.full_name || message.author === user.email?.split("@")[0])) ? user : null}
                            profile={message.author === "You" || (profile && message.author === profile.name) ? profile : null}
                            size={32}
                            className="chat-avatar-img"
                          />
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
                        placeholder={user ? "Write a message..." : "Sign in to send messages..."}
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
                        onClick={() => {
                          if (!user) {
                            triggerAuthPrompt({
                              action: "discussionForm",
                              title: "Start a discussion",
                              message: `Sign in to start a new discussion in ${selectedCircle?.name || "this circle"}.`,
                              reason: "Long-form discussions are tied to your member profile.",
                              actionIcon: "✍️",
                            });
                            return;
                          }
                          setShowDiscussionForm(!showDiscussionForm);
                        }}
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
                            <BluAvatar
                              name={post.author}
                              user={post.author === "You" || (user && (post.author === user.user_metadata?.full_name || post.author === user.email?.split("@")[0])) ? user : null}
                              profile={post.author === "You" || (profile && post.author === profile.name) ? profile : null}
                              size={24}
                              className="author-avatar-img"
                            />
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
                            <span>✍️</span>
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
              <div className="profile-avatar-wrapper">
                <BluAvatar
                  user={user}
                  profile={profile}
                  size={88}
                  className="profile-avatar-large"
                />
              </div>

              <div className="profile-heading">
                <h2>{user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || profile.name) : "Guest Explorer"}</h2>
                <p>{user ? `${user.email} · blu community member` : "Browsing as guest · blu community"}</p>
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
                  type="button"
                  className={user ? "ask-button" : "ask-button sign-in-profile-btn"}
                  onClick={startEditingProfile}
                >
                  {user ? "Edit profile ✎" : "Sign in to personalize your profile ↗"}
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form className="profile-form" onSubmit={saveProfile}>
                <div className="edit-profile-nav-bar">
                  <button
                    type="button"
                    className="edit-profile-back-btn"
                    onClick={cancelEditingProfile}
                    aria-label="Back to Profile"
                  >
                    <span className="back-arrow" aria-hidden="true">←</span>
                    <span>Back to Profile</span>
                  </button>
                  <span className="edit-profile-hint">Cancel anytime · Your existing profile is preserved</span>
                </div>

                <div className="profile-appearance-card">
                  <div className="appearance-preview-col">
                    <div className="preview-avatar-wrap">
                      <BluAvatar
                        photoUrl={profileDraft.photoUrl}
                        avatarId={profileDraft.avatarId}
                        name={profileDraft.name}
                        size={96}
                        showBorder={true}
                        className="edit-avatar-preview"
                      />
                      {profileDraft.photoUrl && (
                        <span className="photo-indicator-badge" title="Custom photo active">
                          📷 Photo
                        </span>
                      )}
                    </div>

                    <div className="preview-actions">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handlePhotoSelect}
                      />
                      <div className="preview-actions-btns">
                        <button
                          type="button"
                          className="photo-btn photo-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {profileDraft.photoUrl ? "Change photo" : "Upload photo"}
                        </button>

                        {profileDraft.photoUrl && (
                          <button
                            type="button"
                            className="photo-btn photo-remove-btn"
                            onClick={handleRemovePhoto}
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                      <span className="photo-help-text">
                        Upload a photo from your device, or pick an illustrated character below
                      </span>
                    </div>
                  </div>

                  {photoError && (
                    <div className="photo-error-banner" role="alert">
                      <span>⚠️</span> {photoError}
                    </div>
                  )}

                  <div className="avatar-picker-section">
                    <div className="avatar-picker-header">
                      <h4>Choose your blu companion</h4>
                      <span className="avatar-picker-sub">
                        Expressive characters hand-crafted with blu's unique community spirit
                      </span>
                    </div>

                    <div className="avatar-picker-grid" role="radiogroup" aria-label="Choose your avatar character">
                      {AVATAR_LIST.map((char) => {
                        const isSelected = profileDraft.avatarId === char.id && !profileDraft.photoUrl;
                        const isAssigned = profileDraft.avatarId === char.id;

                        return (
                          <button
                            key={char.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`avatar-card-item ${isSelected ? "selected" : ""} ${isAssigned && profileDraft.photoUrl ? "assigned-under-photo" : ""}`}
                            onClick={() => {
                              setProfileDraft((prev) => ({
                                ...prev,
                                avatarId: char.id,
                                photoUrl: null,
                              }));
                              setPhotoError("");
                            }}
                            title={`${char.name} · ${char.tag}\n${char.description}`}
                          >
                            <div className="avatar-card-svg-wrap">
                              <BluAvatar avatarId={char.id} size={48} />
                            </div>
                            <div className="avatar-card-info">
                              <span className="avatar-card-name">{char.name}</span>
                              <span className="avatar-card-tag">{char.tag}</span>
                            </div>
                            {isSelected && (
                              <span className="avatar-check-badge" aria-label="Selected">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

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
                    onClick={cancelEditingProfile}
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
                    {Array.isArray(profile.interests) && profile.interests.length > 0 && (
                      profile.interests.map((interest) => (
                        <span className="tag" key={interest}>
                          {interest}
                        </span>
                      ))
                    )}
                    {(!Array.isArray(profile.interests) || profile.interests.length === 0) && (
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
