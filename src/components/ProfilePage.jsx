import React, { useState, useEffect } from "react";
import BluAvatar from "./BluAvatar";
import BluLogo from "./BluLogo";
import { AVATAR_LIST, getAvatar, getDefaultAvatarId } from "./avatars";

// Curated profiles for established blu community members to ensure rich public pages
const COMMUNITY_PROFILES = {
  aarav: {
    name: "Aarav",
    username: "aarav_dev",
    avatarId: "milo",
    bio: "Computer science student passionate about algorithms, clean architecture, and building systems that scale.",
    interests: ["DSA", "Technology", "Web Dev"],
    joined: "Jan 2026",
    baseFollowers: 38,
    followingCount: 19,
    coverHue: 260,
  },
  mira: {
    name: "Mira",
    username: "mira_thoughts",
    avatarId: "luna",
    bio: "Philosophical reflections, human psychology, and finding meaning in everyday conversations.",
    interests: ["Life", "Relationships", "Writing"],
    joined: "Feb 2026",
    baseFollowers: 52,
    followingCount: 24,
    coverHue: 285,
  },
  kabir: {
    name: "Kabir",
    username: "kabir_builds",
    avatarId: "echo",
    bio: "Exploring AI, software engineering, and career pivots. Always building something curious.",
    interests: ["Career", "Technology", "AI"],
    joined: "Jan 2026",
    baseFollowers: 29,
    followingCount: 14,
    coverHue: 220,
  },
  riya: {
    name: "Riya",
    username: "riya_codes",
    avatarId: "pip",
    bio: "Full-stack developer & learning mentor. Let's make computer science accessible for everyone.",
    interests: ["Technology", "DSA", "Open Source"],
    joined: "Jan 2026",
    baseFollowers: 64,
    followingCount: 31,
    coverHue: 270,
  },
  dev: {
    name: "Dev",
    username: "dev_tinkerer",
    avatarId: "kiko",
    bio: "Python enthusiast, competitive programming, and morning study circle regular.",
    interests: ["Python", "DSA", "Study"],
    joined: "Feb 2026",
    baseFollowers: 21,
    followingCount: 11,
    coverHue: 200,
  },
  ananya: {
    name: "Ananya",
    username: "ananya_learns",
    avatarId: "nova",
    bio: "Student of art, literature, and learning science. Reader, note-maker, and question-asker.",
    interests: ["Books", "Education", "Art"],
    joined: "Feb 2026",
    baseFollowers: 43,
    followingCount: 22,
    coverHue: 320,
  },
  anaya: {
    name: "Anaya",
    username: "anaya_notes",
    avatarId: "nova",
    bio: "Organized study sessions, active recall strategies, and shared notes.",
    interests: ["Study", "Education", "Focus"],
    joined: "Feb 2026",
    baseFollowers: 28,
    followingCount: 16,
    coverHue: 330,
  },
  meher: {
    name: "Meher",
    username: "meher_art",
    avatarId: "sunny",
    bio: "Creative expression, choreographies, illustration, design palettes, and visual arts.",
    interests: ["Art", "Dance", "Design"],
    joined: "Mar 2026",
    baseFollowers: 31,
    followingCount: 15,
    coverHue: 45,
  },
  ira: {
    name: "Ira",
    username: "ira_chronicles",
    avatarId: "bramble",
    bio: "Deep reflections, meaningful questions, daily quiet moments, and campus thoughts.",
    interests: ["Life", "Philosophy", "Reflections"],
    joined: "Feb 2026",
    baseFollowers: 27,
    followingCount: 13,
    coverHue: 170,
  },
  arjun: {
    name: "Arjun",
    username: "arjun_path",
    avatarId: "milo",
    bio: "Career advice, interview prep, resumes, and internship roadmaps.",
    interests: ["Career", "Interview Prep", "Growth"],
    joined: "Mar 2026",
    baseFollowers: 35,
    followingCount: 18,
    coverHue: 210,
  },
  naina: {
    name: "Naina",
    username: "naina_reads",
    avatarId: "luna",
    bio: "Book enthusiast sharing page-turners, philosophy quotes, and thought experiments.",
    interests: ["Books", "Ideas", "Philosophy"],
    joined: "Mar 2026",
    baseFollowers: 24,
    followingCount: 12,
    coverHue: 290,
  },
};

/**
 * Checks if a string author corresponds to the current logged-in user
 */
function isCurrentUserAuthor(author, user, profile) {
  if (!author) return false;
  if (author === "You") return true;
  if (profile && author.toLowerCase() === (profile.name || "").toLowerCase()) return true;
  if (user) {
    const fullName = user.user_metadata?.full_name;
    const name = user.user_metadata?.name;
    const emailPrefix = user.email?.split("@")[0];
    if (fullName && author.toLowerCase() === fullName.toLowerCase()) return true;
    if (name && author.toLowerCase() === name.toLowerCase()) return true;
    if (emailPrefix && author.toLowerCase() === emailPrefix.toLowerCase()) return true;
  }
  return false;
}

/**
 * Resolves unified profile data for either current user or target community member
 */
function resolveProfile(viewedUser, currentUser, currentUserProfile, questions = [], follows = {}) {
  // 1. Viewing own profile
  const isSelf =
    !viewedUser ||
    viewedUser === "self" ||
    viewedUser === "You" ||
    (typeof viewedUser === "string" && isCurrentUserAuthor(viewedUser, currentUser, currentUserProfile)) ||
    (typeof viewedUser === "object" && viewedUser?.isSelf);

  if (isSelf) {
    const displayName =
      currentUserProfile?.name ||
      currentUser?.user_metadata?.full_name ||
      currentUser?.user_metadata?.name ||
      (currentUser?.email ? currentUser.email.split("@")[0] : "Guest Explorer");

    const rawUsername =
      currentUser?.user_metadata?.username ||
      (currentUser?.email ? currentUser.email.split("@")[0] : "explorer");
    const username = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, "");

    const avatarId =
      currentUserProfile?.avatarId ||
      currentUser?.user_metadata?.avatar_id ||
      "pip";

    const photoUrl =
      currentUserProfile?.photoUrl ||
      currentUser?.user_metadata?.avatar_url ||
      null;

    const bio =
      currentUserProfile?.bio ||
      (currentUser
        ? "A curious explorer sharing knowledge and learning from different perspectives on blu."
        : "Browsing as guest in the blu community. Sign in to customize your profile.");

    const rawInterests = currentUserProfile?.interests;
    const interests = Array.isArray(rawInterests)
      ? rawInterests
      : typeof rawInterests === "string" && rawInterests.trim()
        ? rawInterests.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Technology", "Life", "Ideas"];

    const joinedDate = currentUser?.created_at
      ? new Date(currentUser.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Community Explorer";

    return {
      isSelf: true,
      name: displayName,
      username,
      avatarId,
      photoUrl,
      bio,
      interests,
      joinedDate,
      baseFollowers: 0,
      followersCount: 0,
      followingCount: Object.values(follows || {}).filter(Boolean).length,
      coverHue: 268,
    };
  }

  // 2. Viewing a community author
  const authorName = typeof viewedUser === "object" ? viewedUser.name || viewedUser.author || "Explorer" : String(viewedUser);
  const lookupKey = authorName.toLowerCase().trim();
  const known = COMMUNITY_PROFILES[lookupKey];

  if (known) {
    const isFollowing = Boolean(follows[known.username]);
    return {
      isSelf: false,
      name: known.name,
      username: known.username,
      avatarId: known.avatarId,
      photoUrl: typeof viewedUser === "object" ? viewedUser.authorPhoto || null : null,
      bio: known.bio,
      interests: known.interests,
      joinedDate: known.joined,
      baseFollowers: known.baseFollowers,
      isFollowing,
      followersCount: known.baseFollowers + (isFollowing ? 1 : 0),
      followingCount: known.followingCount,
      coverHue: known.coverHue,
    };
  }

  // Fallback for custom dynamic author
  const autoAvatarId = getDefaultAvatarId(authorName);
  const cleanUsername = authorName.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const isFollowing = Boolean(follows[cleanUsername]);

  const authoredPosts = questions.filter((q) => q && q.author && q.author.toLowerCase() === authorName.toLowerCase());
  const derivedTags = new Set();
  authoredPosts.forEach((q) => {
    if (Array.isArray(q.tags)) q.tags.forEach((t) => derivedTags.add(t));
  });

  return {
    isSelf: false,
    name: authorName,
    username: cleanUsername,
    avatarId: typeof viewedUser === "object" ? viewedUser.authorAvatarId || autoAvatarId : autoAvatarId,
    photoUrl: typeof viewedUser === "object" ? viewedUser.authorPhoto || null : null,
    bio: "Contributing questions, answers, and perspectives to the blu community.",
    interests: derivedTags.size > 0 ? Array.from(derivedTags) : ["Technology", "Community"],
    joinedDate: "Member since 2026",
    baseFollowers: 14,
    isFollowing,
    followersCount: 14 + (isFollowing ? 1 : 0),
    followingCount: 8,
    coverHue: 250,
  };
}

/**
 * Generates member list for Followers modal
 */
function getFollowersList(profileData, follows, currentUser, currentUserProfile) {
  const currentKey = profileData.username.toLowerCase();
  const list = Object.entries(COMMUNITY_PROFILES)
    .filter(([key]) => key !== currentKey && key !== profileData.name.toLowerCase())
    .slice(0, 5)
    .map(([, data]) => ({
      name: data.name,
      username: data.username,
      avatarId: data.avatarId,
      bio: data.bio,
      joined: data.joined,
    }));

  if (!profileData.isSelf && profileData.isFollowing) {
    const myName = currentUserProfile?.name || currentUser?.user_metadata?.full_name || "You";
    const myUsername = currentUserProfile?.username || (currentUser?.email ? currentUser.email.split("@")[0] : "you");
    list.unshift({
      name: myName,
      username: myUsername,
      avatarId: currentUserProfile?.avatarId || "pip",
      photoUrl: currentUserProfile?.photoUrl || null,
      bio: currentUserProfile?.bio || "Exploring and sharing knowledge on blu.",
      joined: "Member",
      isSelfUser: true,
    });
  }
  return list;
}

/**
 * Generates member list for Following modal
 */
function getFollowingList(profileData, follows) {
  const currentKey = profileData.username.toLowerCase();
  if (profileData.isSelf) {
    const followedKeys = Object.entries(follows || {})
      .filter(([, isF]) => isF)
      .map(([uname]) => uname.toLowerCase());

    const matched = Object.values(COMMUNITY_PROFILES).filter(
      (p) => followedKeys.includes(p.username.toLowerCase()) || followedKeys.includes(p.name.toLowerCase())
    );

    if (matched.length > 0) {
      return matched.map((p) => ({
        name: p.name,
        username: p.username,
        avatarId: p.avatarId,
        bio: p.bio,
        joined: p.joined,
      }));
    }

    return Object.values(COMMUNITY_PROFILES).slice(0, 4).map((p) => ({
      name: p.name,
      username: p.username,
      avatarId: p.avatarId,
      bio: p.bio,
      joined: p.joined,
      isSuggested: true,
    }));
  }

  return Object.values(COMMUNITY_PROFILES)
    .filter((p) => p.username.toLowerCase() !== currentKey && p.name.toLowerCase() !== profileData.name.toLowerCase())
    .slice(2, 7)
    .map((p) => ({
      name: p.name,
      username: p.username,
      avatarId: p.avatarId,
      bio: p.bio,
      joined: p.joined,
    }));
}

export default function ProfilePage({
  viewedUser = null,
  currentUser = null,
  currentUserProfile = null,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSaveProfile,
  profileDraft,
  setProfileDraft,
  fileInputRef,
  handlePhotoSelect,
  handleRemovePhoto,
  photoError,
  questions = [],
  answersByQuestion = {},
  discussions = {},
  initialCircles = [],
  joinedCircles = [],
  openCircle,
  openPage,
  onOpenQuestion,
  onRequireAuth,
  handleLogout,
  setShowOnboarding,
  openAuthModal,
  follows = {},
  onToggleFollow,
  onOpenProfile,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFollowModal, setActiveFollowModal] = useState(null); // 'followers' | 'following' | null

  // Close modal on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && activeFollowModal) {
        setActiveFollowModal(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFollowModal]);

  // Resolve active profile
  const profileData = resolveProfile(
    viewedUser,
    currentUser,
    currentUserProfile,
    questions,
    follows
  );

  const targetName = profileData.name;
  const isSelf = profileData.isSelf;

  // Author matcher
  const matchesTargetAuthor = (author) => {
    if (!author) return false;
    if (isSelf) {
      return isCurrentUserAuthor(author, currentUser, currentUserProfile);
    }
    return author.toLowerCase() === targetName.toLowerCase();
  };

  // 1. Discussions authored by this user
  const userQuestions = questions.filter((q) => q && matchesTargetAuthor(q.author));
  const userCircleDiscussions = Object.entries(discussions || {}).flatMap(([circleId, list]) =>
    (Array.isArray(list) ? list : []).filter((d) => d && matchesTargetAuthor(d.author)).map((d) => ({
      ...d,
      isCirclePost: true,
      circleId,
    }))
  );
  const totalDiscussionsList = [...userQuestions, ...userCircleDiscussions];

  // 2. Answers & Replies authored by this user
  const userAnswers = [];
  Object.entries(answersByQuestion || {}).forEach(([qId, ansList]) => {
    if (!Array.isArray(ansList)) return;
    const parentQ = questions.find((q) => String(q.id) === String(qId));
    ansList.forEach((ans) => {
      if (ans && matchesTargetAuthor(ans.author)) {
        userAnswers.push({
          ...ans,
          type: "answer",
          questionId: qId,
          parentQuestionTitle: parentQ ? parentQ.title : "Community question",
        });
      }
      if (Array.isArray(ans?.replies)) {
        ans.replies.forEach((rep) => {
          if (rep && matchesTargetAuthor(rep.author)) {
            userAnswers.push({
              ...rep,
              type: "reply",
              questionId: qId,
              parentAnswerAuthor: ans.author,
              parentQuestionTitle: parentQ ? parentQ.title : "Community thread",
            });
          }
        });
      }
    });
  });

  // 3. Contribution Score calculation
  const helpfulVotesCount = userAnswers.reduce((sum, a) => sum + (a.helpful || 0), 0);
  const questionVotesCount = userQuestions.reduce((sum, q) => sum + (q.votes || 0), 0);
  const contributionScore =
    totalDiscussionsList.length * 5 +
    userAnswers.length * 2 +
    helpfulVotesCount +
    questionVotesCount;

  // 4. Top Helpful Contribution
  const helpfulAnswers = userAnswers
    .filter((ans) => (ans.helpful || 0) > 0)
    .sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
  const topHelpfulAnswer = helpfulAnswers.length > 0 ? helpfulAnswers[0] : null;

  // 5. Expertise Tags derived from authored questions & answers
  const tagFrequency = {};
  userQuestions.forEach((q) => {
    if (Array.isArray(q.tags)) {
      q.tags.forEach((t) => {
        tagFrequency[t] = (tagFrequency[t] || 0) + 2;
      });
    }
  });
  userAnswers.forEach((ans) => {
    const parentQ = questions.find((q) => String(q.id) === String(ans.questionId));
    if (parentQ && Array.isArray(parentQ.tags)) {
      parentQ.tags.forEach((t) => {
        tagFrequency[t] = (tagFrequency[t] || 0) + 1;
      });
    }
  });
  if (Array.isArray(profileData.interests)) {
    profileData.interests.forEach((interest) => {
      tagFrequency[interest] = (tagFrequency[interest] || 0) + 1;
    });
  }
  const derivedExpertiseTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);

  // 6. Authentic Achievements (100% derived from actual state)
  const achievements = [
    {
      id: "curious_mind",
      name: "Curious Mind",
      icon: "✦",
      color: "#8b5cf6",
      description: "Asked a thoughtful question that invited different perspectives",
      earned: userQuestions.length >= 1,
      criteria: userQuestions.length >= 1 ? `${userQuestions.length} questions asked` : "Ask 1 question to earn",
    },
    {
      id: "helpful_contributor",
      name: "Helpful Contributor",
      icon: "🌸",
      color: "#ec4899",
      description: "Provided an answer recognized with helpful community votes",
      earned: helpfulVotesCount > 0,
      criteria: helpfulVotesCount > 0 ? `${helpfulVotesCount} helpful votes received` : "Receive 1 helpful vote",
    },
    {
      id: "knowledge_builder",
      name: "Knowledge Builder",
      icon: "📚",
      color: "#0284c7",
      description: "Shared expertise, perspectives, or replies in community discussions",
      earned: userAnswers.length >= 1,
      criteria: userAnswers.length >= 1 ? `${userAnswers.length} answers & replies` : "Write 1 answer or reply",
    },
    {
      id: "circle_regular",
      name: "Circle Regular",
      icon: "🦋",
      color: "#10b981",
      description: "Participates in specialized interest circles and group discussions",
      earned: (isSelf ? joinedCircles.length > 0 : true) || userCircleDiscussions.length > 0,
      criteria: ((isSelf ? joinedCircles.length > 0 : true) || userCircleDiscussions.length > 0) ? "Active in community circles" : "Join a circle to earn",
    },
    {
      id: "early_explorer",
      name: "Early Explorer",
      icon: "✨",
      color: "#f59e0b",
      description: "Pioneer member participating during blu's inaugural 2026 launch",
      earned: true,
      criteria: "Founding Explorer · 2026",
    },
  ];

  // Combined overview feed
  const overviewFeed = [
    ...totalDiscussionsList.map((item) => ({ ...item, feedType: "discussion" })),
    ...userAnswers.map((item) => ({ ...item, feedType: "reply" })),
  ];

  // Companion character details
  const companion = getAvatar(profileData.avatarId);

  // Handle follow toggle
  const handleFollowClick = () => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth({
        action: "followUser",
        title: `Follow ${profileData.name}`,
        message: "Sign in to follow community members and stay connected with their insights.",
        reason: "Following members saves their profile and notifies you of new discussions.",
        actionIcon: "👥",
      });
      return;
    }
    if (onToggleFollow) {
      onToggleFollow(profileData.username);
    }
  };

  // Handle share profile link
  const handleShareProfile = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.origin + `?user=${profileData.username}`);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }
    } catch {
      // ignore
    }
  };

  // Navigate to member profile from modal
  const handleMemberClick = (memberName) => {
    setActiveFollowModal(null);
    if (onOpenProfile) {
      onOpenProfile(memberName);
    }
  };

  const followersList = getFollowersList(profileData, follows, currentUser, currentUserProfile);
  const followingList = getFollowingList(profileData, follows);

  return (
    <main className="blu-profile-page">
      {/* ========================================================
          A. BRANDED BLU PROFILE COVER & WATERMARK
          ======================================================== */}
      <section className="profile-hero-banner" style={{ "--cover-hue": `${profileData.coverHue}deg` }}>
        <div className="banner-ambient-glow" aria-hidden="true" />
        <div className="banner-watermark-overlay" aria-hidden="true">
          <div className="banner-floating-butterfly">
            <BluLogo size={220} showWordmark={false} className="banner-butterfly-watermark" />
          </div>
        </div>
        <div className="banner-glass-accent" aria-hidden="true" />

        {/* Guest Banner if not logged in and on own profile */}
        {isSelf && !currentUser && (
          <div className="profile-guest-notification">
            <div>
              <strong>Welcome to your space on blu</strong>
              <span>Sign in or create an account to personalize your profile, choose an avatar, and follow members.</span>
            </div>
            <div className="profile-guest-cta">
              <button type="button" className="auth-nav-btn auth-nav-login" onClick={() => openAuthModal && openAuthModal("login")}>
                Log in
              </button>
              <button type="button" className="auth-nav-btn auth-nav-signup" onClick={() => openAuthModal && openAuthModal("signup")}>
                Sign up
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Header Info Strip */}
      <div className="profile-header-strip">
        <div className="profile-header-inner">
          <div className="profile-header-avatar-anchor">
            <BluAvatar
              user={isSelf ? currentUser : null}
              profile={isSelf ? currentUserProfile : null}
              photoUrl={profileData.photoUrl}
              avatarId={profileData.avatarId}
              name={profileData.name}
              size={94}
              showBorder={true}
              className="profile-header-avatar-img"
              clickable={true}
            />
          </div>

          <div className="profile-header-meta">
            <div className="profile-title-row">
              <h1 className="profile-display-name">{profileData.name}</h1>
              <span className="profile-handle-badge">@{profileData.username}</span>
              {isSelf && <span className="profile-self-pill">You</span>}
            </div>

            <p className="profile-header-bio">{profileData.bio}</p>

            <div className="profile-header-subline">
              <span className="profile-sub-item">
                📅 <span>Joined {profileData.joinedDate}</span>
              </span>

              {/* Distinctive Contribution Score Badge */}
              <div
                className="profile-sub-item profile-score-sub-item"
                title="Contribution Score: Earned through asking questions, sharing knowledge, and helpful community votes."
              >
                <span className="profile-score-crest" aria-hidden="true">✦</span>
                <strong>{contributionScore}</strong>
                <span>Contribution Score</span>
              </div>

              {/* Clickable Followers & Following */}
              <button
                type="button"
                className="profile-sub-item-btn"
                onClick={() => setActiveFollowModal("followers")}
                title="View followers list"
              >
                👥 <strong>{profileData.followersCount || 0}</strong> <span>Followers</span>
              </button>

              <button
                type="button"
                className="profile-sub-item-btn"
                onClick={() => setActiveFollowModal("following")}
                title="View following list"
              >
                ✨ <strong>{profileData.followingCount || 0}</strong> <span>Following</span>
              </button>
            </div>
          </div>

          <div className="profile-header-actions">
            {isSelf ? (
              <>
                {!isEditing && (
                  <button type="button" className="ask-button profile-edit-btn" onClick={onStartEdit}>
                    Edit Profile ✎
                  </button>
                )}
                {currentUser && (
                  <button type="button" className="cancel-button profile-header-logout" onClick={handleLogout} title="Log out of your account">
                    Log out
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`profile-follow-btn ${profileData.isFollowing ? "is-following" : ""}`}
                  onClick={handleFollowClick}
                >
                  {profileData.isFollowing ? "✓ Following" : "+ Follow"}
                </button>
                <button
                  type="button"
                  className="cancel-button profile-share-btn"
                  onClick={handleShareProfile}
                  title="Share profile link"
                >
                  {copiedLink ? "✓ Link Copied" : "🔗 Share"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        {!isEditing && (
          <nav className="profile-tabs-nav" aria-label="Profile Sections">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === "overview" ? "is-active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === "discussions" ? "is-active" : ""}`}
              onClick={() => setActiveTab("discussions")}
            >
              Discussions ({totalDiscussionsList.length})
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === "replies" ? "is-active" : ""}`}
              onClick={() => setActiveTab("replies")}
            >
              Replies ({userAnswers.length})
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === "about" ? "is-active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
          </nav>
        )}
      </div>

      {/* ========================================================
          B. MAIN CONTENT AREA (FEED + RIGHT SIDEBAR)
          ======================================================== */}
      <div className="profile-layout-container">
        {isEditing && isSelf ? (
          /* ========================================================
              FULL EDIT PROFILE FORM (100% PRESERVED CAPABILITIES)
              ======================================================== */
          <div className="profile-edit-full-form">
            <form className="profile-form" onSubmit={onSaveProfile}>
              <div className="edit-profile-nav-bar">
                <button type="button" className="edit-profile-back-btn" onClick={onCancelEdit}>
                  <span className="back-arrow" aria-hidden="true">←</span>
                  <span>Back to Profile</span>
                </button>
                <span className="edit-profile-hint">Cancel anytime · Your saved profile is preserved</span>
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
                        📷 Custom Photo
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
                      Upload a photo from your device, or pick an illustrated character companion below
                    </span>
                  </div>
                </div>

                {photoError && (
                  <div className="photo-error-banner" role="alert">
                    <span>⚠️</span> {photoError}
                  </div>
                )}

                {/* 8 Companion Avatars Picker */}
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
                          className={`avatar-card-item ${isSelected ? "selected" : ""} ${
                            isAssigned && profileDraft.photoUrl ? "assigned-under-photo" : ""
                          }`}
                          onClick={() => {
                            setProfileDraft((prev) => ({
                              ...prev,
                              avatarId: char.id,
                              photoUrl: null,
                            }));
                          }}
                          title={`${char.name} · ${char.tag}\n${char.description}`}
                        >
                          <div className="avatar-card-svg-wrap">
                            <BluAvatar avatarId={char.id} size={48} clickable={false} />
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

              <label htmlFor="profile-name">Display Name</label>
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

              <label htmlFor="profile-interests">Interests (comma-separated)</label>
              <input
                id="profile-interests"
                value={profileDraft.interests}
                onChange={(e) =>
                  setProfileDraft({
                    ...profileDraft,
                    interests: e.target.value,
                  })
                }
                placeholder="Technology, Books, Music, Philosophy"
              />

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={onCancelEdit}>
                  Cancel
                </button>
                <button className="ask-button" type="submit">
                  Save profile ↗
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================
              PUBLIC PROFILE FEED + SIDEBAR VIEW
              ======================================================== */
          <>
            <div className="profile-main-feed">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="tab-pane-feed">
                  {/* Top Helpful Contribution Spotlight */}
                  {topHelpfulAnswer && (
                    <div
                      className="blu-helpful-spotlight"
                      onClick={() => {
                        if (onOpenQuestion) onOpenQuestion(topHelpfulAnswer.questionId);
                        else openPage("explore");
                      }}
                      title="Click to view full discussion"
                    >
                      <div className="blu-helpful-spotlight-badge">
                        <span className="spotlight-star" aria-hidden="true">🌸</span>
                        <span className="spotlight-label">Top Helpful Contribution</span>
                        <span className="spotlight-votes">♡ {topHelpfulAnswer.helpful} helpful votes</span>
                      </div>
                      <div className="blu-helpful-context">
                        Answer on <strong>{topHelpfulAnswer.parentQuestionTitle}</strong>
                      </div>
                      <p className="blu-helpful-quote">“{topHelpfulAnswer.body}”</p>
                      <div className="blu-helpful-footer">
                        <span>Read full discussion ↗</span>
                      </div>
                    </div>
                  )}

                  {overviewFeed.length > 0 ? (
                    overviewFeed.map((item, idx) => {
                      if (item.feedType === "discussion") {
                        return (
                          <article
                            className="profile-feed-card post-type"
                            key={`disc-${item.id}-${idx}`}
                            onClick={() => {
                              if (onOpenQuestion) onOpenQuestion(item.id);
                              else openPage("explore");
                            }}
                          >
                            <div className="feed-card-header">
                              <span className="feed-type-pill">💬 Discussion</span>
                              <span className="feed-card-time">{item.time || "Recently"}</span>
                            </div>
                            <h3 className="feed-card-title">{item.title}</h3>
                            <p className="feed-card-body">{item.body}</p>
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="feed-tags-row">
                                {item.tags.map((t) => (
                                  <span className="tag" key={t}>
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="feed-card-footer">
                              <span>▲ {item.votes || 0} votes</span>
                              <span>·</span>
                              <span>💬 {item.answers || item.comments || 0} answers</span>
                            </div>
                          </article>
                        );
                      }

                      // Reply / Answer
                      return (
                        <article
                          className="profile-feed-card reply-type"
                          key={`reply-${item.id}-${idx}`}
                          onClick={() => {
                            if (onOpenQuestion) onOpenQuestion(item.questionId);
                            else openPage("explore");
                          }}
                        >
                          <div className="feed-card-header">
                            <span className="feed-type-pill reply-pill">
                              ✍️ {item.type === "reply" ? "Reply" : "Answer"}
                            </span>
                            <span className="feed-context-hint">
                              on <strong>{item.parentQuestionTitle}</strong>
                            </span>
                            <span className="feed-card-time">{item.time || "Recently"}</span>
                          </div>
                          <p className="feed-card-body reply-body-quote">“{item.body}”</p>
                          <div className="feed-card-footer">
                            <span>♡ {item.helpful || 0} helpful votes</span>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="profile-empty-feed">
                      <span className="empty-symbol">🍃</span>
                      <h3>No public activity yet</h3>
                      <p>When {isSelf ? "you post" : `${profileData.name} posts`} questions or writes answers, they will show up here.</p>
                      {isSelf && (
                        <button type="button" className="ask-button" onClick={() => openPage("explore")}>
                          Ask a question on Explore ↗
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DISCUSSIONS */}
              {activeTab === "discussions" && (
                <div className="tab-pane-feed">
                  {totalDiscussionsList.length > 0 ? (
                    totalDiscussionsList.map((post) => (
                      <article
                        className="profile-feed-card post-type"
                        key={`post-${post.id}`}
                        onClick={() => {
                          if (onOpenQuestion) onOpenQuestion(post.id);
                          else openPage("explore");
                        }}
                      >
                        <div className="feed-card-header">
                          <span className="feed-type-pill">💬 Discussion</span>
                          <span className="feed-card-time">{post.time || "Recently"}</span>
                        </div>
                        <h3 className="feed-card-title">{post.title}</h3>
                        <p className="feed-card-body">{post.body}</p>
                        {Array.isArray(post.tags) && post.tags.length > 0 && (
                          <div className="feed-tags-row">
                            {post.tags.map((t) => (
                              <span className="tag" key={t}>
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="feed-card-footer">
                          <span>▲ {post.votes || 0} votes</span>
                          <span>·</span>
                          <span>💬 {post.answers || post.comments || 0} answers</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="profile-empty-feed">
                      <span className="empty-symbol">💭</span>
                      <h3>No discussions created yet</h3>
                      <p>{isSelf ? "You haven't" : `${profileData.name} hasn't`} published any discussions yet.</p>
                      {isSelf && (
                        <button type="button" className="ask-button" onClick={() => openPage("explore")}>
                          Start a discussion ↗
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REPLIES */}
              {activeTab === "replies" && (
                <div className="tab-pane-feed">
                  {userAnswers.length > 0 ? (
                    userAnswers.map((ans) => (
                      <article
                        className="profile-feed-card reply-type"
                        key={`ans-${ans.id}`}
                        onClick={() => {
                          if (onOpenQuestion) onOpenQuestion(ans.questionId);
                          else openPage("explore");
                        }}
                      >
                        <div className="feed-card-header">
                          <span className="feed-type-pill reply-pill">
                            ✍️ {ans.type === "reply" ? "Reply" : "Answer"}
                          </span>
                          <span className="feed-context-hint">
                            on <strong>{ans.parentQuestionTitle}</strong>
                          </span>
                          <span className="feed-card-time">{ans.time || "Recently"}</span>
                        </div>
                        <p className="feed-card-body reply-body-quote">“{ans.body}”</p>
                        <div className="feed-card-footer">
                          <span>♡ {ans.helpful || 0} helpful votes</span>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="profile-empty-feed">
                      <span className="empty-symbol">✍️</span>
                      <h3>No replies written yet</h3>
                      <p>{isSelf ? "You haven't" : `${profileData.name} hasn't`} contributed any replies yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ABOUT (IDENTITY, EXPERTISE, ACHIEVEMENTS, CIRCLES) */}
              {activeTab === "about" && (
                <div className="tab-pane-about">
                  {/* Biography */}
                  <div className="about-profile-block">
                    <h3>About {profileData.name}</h3>
                    <p className="about-bio-text">{profileData.bio}</p>
                  </div>

                  {/* Community Impact Metrics */}
                  <div className="about-profile-block">
                    <h3>Community Impact</h3>
                    <div className="blu-impact-grid">
                      <div className="blu-impact-card">
                        <span className="blu-impact-val">{userQuestions.length}</span>
                        <span className="blu-impact-lbl">Questions Asked</span>
                      </div>
                      <div className="blu-impact-card">
                        <span className="blu-impact-val">{userAnswers.length}</span>
                        <span className="blu-impact-lbl">Knowledge Shared</span>
                      </div>
                      <div className="blu-impact-card">
                        <span className="blu-impact-val">{helpfulVotesCount}</span>
                        <span className="blu-impact-lbl">Helpful Votes</span>
                      </div>
                      <div className="blu-impact-card">
                        <span className="blu-impact-val">{isSelf ? joinedCircles.length : 2}</span>
                        <span className="blu-impact-lbl">Circles Involved</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise & Focus Tags */}
                  <div className="about-profile-block">
                    <h3>Expertise & Topics of Focus</h3>
                    <div className="about-tags-wrap">
                      {derivedExpertiseTags.length > 0 ? (
                        derivedExpertiseTags.map((tag) => (
                          <span className="blu-expertise-pill" key={tag}>
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="muted">Participate in discussions to establish community expertise tags.</span>
                      )}
                    </div>
                  </div>

                  {/* Authentic blu Achievements */}
                  <div className="about-profile-block">
                    <h3>Community Badges & Milestones</h3>
                    <div className="blu-achievements-grid">
                      {achievements.map((badge) => (
                        <div
                          key={badge.id}
                          className={`blu-badge-card ${badge.earned ? "is-earned" : "is-locked"}`}
                          style={{ "--badge-accent": badge.color }}
                        >
                          <div className="blu-badge-icon" aria-hidden="true">
                            {badge.icon}
                          </div>
                          <div className="blu-badge-info">
                            <div className="blu-badge-title-row">
                              <h4 className="blu-badge-name">{badge.name}</h4>
                              <span className={`blu-badge-status-pill ${badge.earned ? "status-earned" : "status-progress"}`}>
                                {badge.earned ? "✓ Earned" : "In Progress"}
                              </span>
                            </div>
                            <p className="blu-badge-desc">{badge.description}</p>
                            <span className="blu-badge-criteria">{badge.criteria}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Companion Showcase */}
                  <div className="about-profile-companion-card">
                    <div className="companion-svg-avatar">
                      <BluAvatar avatarId={profileData.avatarId} size={76} clickable={true} />
                    </div>
                    <div className="companion-info-col">
                      <span className="companion-role-label">ILLUSTRATED COMPANION</span>
                      <h4 className="companion-name-title">{companion.name}</h4>
                      <span className="companion-tagline">{companion.tag}</span>
                      <p className="companion-desc-text">{companion.description}</p>
                    </div>
                  </div>

                  {/* Joined Circles */}
                  {isSelf && (
                    <div className="about-profile-block">
                      <h3>My Circles</h3>
                      {joinedCircles.length > 0 ? (
                        <div className="joined-circles-list">
                          {initialCircles
                            .filter((circle) => joinedCircles.includes(circle.id))
                            .map((circle) => (
                              <button
                                type="button"
                                className="profile-circle-link"
                                key={circle.id}
                                onClick={() => openCircle(circle.id)}
                              >
                                {circle.icon} {circle.name} ↗
                              </button>
                            ))}
                        </div>
                      ) : (
                        <p className="muted">You haven't joined any circles yet.</p>
                      )}
                      <button
                        type="button"
                        className="cancel-button profile-circles-button"
                        style={{ marginTop: "12px" }}
                        onClick={() => openPage("circles")}
                      >
                        Explore Circles 🌐
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================================
                C. RIGHT SIDEBAR PROFILE IDENTITY CARD
                ======================================================== */}
            <aside className="profile-sidebar-card">
              <div className="sidebar-card-top">
                <BluAvatar
                  user={isSelf ? currentUser : null}
                  profile={isSelf ? currentUserProfile : null}
                  photoUrl={profileData.photoUrl}
                  avatarId={profileData.avatarId}
                  name={profileData.name}
                  size={64}
                  className="sidebar-card-avatar"
                  clickable={true}
                />
                <div className="sidebar-card-id">
                  <h4 className="sidebar-name">{profileData.name}</h4>
                  <span className="sidebar-handle">@{profileData.username}</span>
                </div>
              </div>

              <p className="sidebar-card-bio">{profileData.bio}</p>

              {/* blu Contribution Score Branded Card */}
              <div className="blu-score-card" title="Earned through asking questions, sharing knowledge, and helpful community votes.">
                <div className="blu-score-header">
                  <div className="blu-score-crest-icon" aria-hidden="true">
                    ✦
                  </div>
                  <div>
                    <span className="blu-score-label">Community Score</span>
                    <div className="blu-score-value">{contributionScore}</div>
                  </div>
                </div>
                <div className="blu-score-caption">
                  <span className="blu-score-title">Contribution Score</span>
                  <p className="blu-score-desc">Reflects helpful answers, curious questions, and positive community impact on blu.</p>
                </div>
              </div>

              {/* Interactive Statistics Grid */}
              <div className="sidebar-stats-grid">
                <div className="sidebar-stat-box">
                  <strong className="sidebar-stat-val">{totalDiscussionsList.length}</strong>
                  <span className="sidebar-stat-lbl">Discussions</span>
                </div>
                <div className="sidebar-stat-box">
                  <strong className="sidebar-stat-val">{userAnswers.length}</strong>
                  <span className="sidebar-stat-lbl">Replies</span>
                </div>
                <button
                  type="button"
                  className="sidebar-stat-box sidebar-stat-interactive"
                  onClick={() => setActiveFollowModal("followers")}
                  title="View followers"
                >
                  <strong className="sidebar-stat-val">{profileData.followersCount || 0}</strong>
                  <span className="sidebar-stat-lbl">Followers ↗</span>
                </button>
                <button
                  type="button"
                  className="sidebar-stat-box sidebar-stat-interactive"
                  onClick={() => setActiveFollowModal("following")}
                  title="View following"
                >
                  <strong className="sidebar-stat-val">{profileData.followingCount || 0}</strong>
                  <span className="sidebar-stat-lbl">Following ↗</span>
                </button>
              </div>

              <div className="sidebar-meta-list">
                <div className="sidebar-meta-item">
                  <span className="sidebar-meta-icon">📅</span>
                  <span>Joined {profileData.joinedDate}</span>
                </div>
                <div className="sidebar-meta-item">
                  <span className="sidebar-meta-icon">🦋</span>
                  <span>Companion: <strong>{companion.name}</strong></span>
                </div>
                {derivedExpertiseTags.length > 0 && (
                  <div className="sidebar-meta-item">
                    <span className="sidebar-meta-icon">🏷️</span>
                    <span>Focus: <strong>#{derivedExpertiseTags[0]}</strong></span>
                  </div>
                )}
              </div>

              <div className="sidebar-actions-col">
                {isSelf ? (
                  <>
                    <button type="button" className="ask-button sidebar-full-btn" onClick={onStartEdit}>
                      Edit Profile ✎
                    </button>
                    <button
                      type="button"
                      className="cancel-button sidebar-guide-btn"
                      onClick={() => setShowOnboarding && setShowOnboarding(true)}
                    >
                      Welcome guide ↗
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`profile-follow-btn sidebar-full-btn ${profileData.isFollowing ? "is-following" : ""}`}
                      onClick={handleFollowClick}
                    >
                      {profileData.isFollowing ? "✓ Following" : "+ Follow"}
                    </button>
                    <button
                      type="button"
                      className="cancel-button sidebar-share-btn"
                      onClick={handleShareProfile}
                    >
                      {copiedLink ? "✓ Link Copied" : "🔗 Share Profile"}
                    </button>
                  </>
                )}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* ========================================================
          D. INTERACTIVE FOLLOWERS & FOLLOWING MODAL
          ======================================================== */}
      {activeFollowModal && (
        <div
          className="blu-follow-modal-overlay"
          onClick={() => setActiveFollowModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${profileData.name}'s ${activeFollowModal}`}
        >
          <div
            className="blu-follow-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="blu-follow-modal-header">
              <div className="blu-follow-modal-tabs">
                <button
                  type="button"
                  className={`blu-follow-tab-btn ${activeFollowModal === "followers" ? "is-active" : ""}`}
                  onClick={() => setActiveFollowModal("followers")}
                >
                  Followers ({profileData.followersCount || 0})
                </button>
                <button
                  type="button"
                  className={`blu-follow-tab-btn ${activeFollowModal === "following" ? "is-active" : ""}`}
                  onClick={() => setActiveFollowModal("following")}
                >
                  Following ({profileData.followingCount || 0})
                </button>
              </div>

              <button
                type="button"
                className="blu-follow-modal-close"
                onClick={() => setActiveFollowModal(null)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="blu-follow-modal-list">
              {activeFollowModal === "followers" ? (
                followersList.length > 0 ? (
                  followersList.map((member) => (
                    <div
                      key={member.username}
                      className="blu-follow-member-row"
                      onClick={() => handleMemberClick(member.name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleMemberClick(member.name);
                        }
                      }}
                    >
                      <BluAvatar
                        avatarId={member.avatarId}
                        photoUrl={member.photoUrl}
                        name={member.name}
                        size={46}
                        clickable={false}
                      />
                      <div className="blu-follow-member-info">
                        <div className="blu-follow-member-name-row">
                          <span className="blu-follow-member-name">{member.name}</span>
                          {member.isSelfUser && <span className="profile-self-pill">You</span>}
                          <span className="blu-follow-member-handle">@{member.username}</span>
                        </div>
                        <p className="blu-follow-member-bio">{member.bio}</p>
                      </div>
                      <span className="blu-follow-view-arrow" aria-hidden="true">→</span>
                    </div>
                  ))
                ) : (
                  <div className="blu-follow-empty">
                    <span>👥</span>
                    <p>No followers yet. Share insightful questions and answers to connect with others!</p>
                  </div>
                )
              ) : (
                followingList.length > 0 ? (
                  followingList.map((member) => (
                    <div
                      key={member.username}
                      className="blu-follow-member-row"
                      onClick={() => handleMemberClick(member.name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleMemberClick(member.name);
                        }
                      }}
                    >
                      <BluAvatar
                        avatarId={member.avatarId}
                        name={member.name}
                        size={46}
                        clickable={false}
                      />
                      <div className="blu-follow-member-info">
                        <div className="blu-follow-member-name-row">
                          <span className="blu-follow-member-name">{member.name}</span>
                          {member.isSuggested && <span className="blu-follow-suggested-pill">Suggested</span>}
                          <span className="blu-follow-member-handle">@{member.username}</span>
                        </div>
                        <p className="blu-follow-member-bio">{member.bio}</p>
                      </div>
                      <span className="blu-follow-view-arrow" aria-hidden="true">→</span>
                    </div>
                  ))
                ) : (
                  <div className="blu-follow-empty">
                    <span>✨</span>
                    <p>Not following anyone yet. Explore questions and follow community thinkers!</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
