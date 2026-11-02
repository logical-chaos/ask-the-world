-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Core Schema, Foreign Keys, Indexes, Triggers, Realtime, Storage, and RLS for blu
-- Target: PostgreSQL / Supabase
-- Version: 1.2.0 (Production-Hardened Post-Audit)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. Extensions & Helper Functions
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generic trigger to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- Stores public user identities linked to Supabase auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT DEFAULT 'Curious explorer on blu.',
  interests TEXT[] DEFAULT '{}',
  avatar_id TEXT DEFAULT 'pip',
  photo_url TEXT,
  cover_hue INTEGER DEFAULT 265 CHECK (cover_hue >= 0 AND cover_hue <= 360),
  contribution_score INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]{3,30}$')
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. Circles Table
-- Interest communities / specialized rooms (e.g., Tech & Coding, Study, Art)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.circles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  color TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  members_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed predefined circles metadata so relationships & initial UI are immediately ready
INSERT INTO public.circles (id, name, icon, description, color, is_private, members_count)
VALUES
  ('tech', 'Tech & Coding', '💻', 'Code, projects, DSA, debugging, and tech talk.', 'lavender', FALSE, 0),
  ('study', 'Study Circle', '📚', 'Study together, exchange notes, and learn.', 'peach', FALSE, 0),
  ('art', 'Art, Music & Dance', '🎨', 'Create, share your work, and find inspiration.', 'pink', FALSE, 0),
  ('life', 'Life & Everything', '🌙', 'Friendships, feelings, opinions, and everyday life.', 'blue', FALSE, 0),
  ('career', 'Careers & Growth', '🚀', 'Skills, opportunities, and career conversations.', 'green', FALSE, 0),
  ('books', 'Books & Ideas', '💡', 'Books, interesting ideas, and curious minds.', 'yellow', FALSE, 0)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Questions Table
-- Main discussions posted in the Explore feed
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  votes_count INTEGER DEFAULT 0 NOT NULL,
  answers_count INTEGER DEFAULT 0 NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. Answers Table (Threaded Replies Support)
-- Stores top-level answers and nested replies linked by parent_answer_id
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  parent_answer_id UUID,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  photo_url TEXT,
  video_url TEXT,
  link_url TEXT,
  gif_url TEXT,
  reply_to_author TEXT,
  helpful_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Enforce that parent answers belong to the exact same question
  CONSTRAINT uq_answers_id_question UNIQUE (id, question_id),
  CONSTRAINT fk_answers_parent_question FOREIGN KEY (parent_answer_id, question_id)
    REFERENCES public.answers(id, question_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_parent_id ON public.answers(parent_answer_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON public.answers(created_at ASC);

CREATE TRIGGER trg_answers_updated_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Additional validation trigger to provide clear exception messages if mismatched
CREATE OR REPLACE FUNCTION public.check_parent_answer_question()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_answer_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.answers
      WHERE id = NEW.parent_answer_id AND question_id = NEW.question_id
    ) THEN
      RAISE EXCEPTION 'Parent answer must belong to the exact same question (question_id: %).', NEW.question_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_parent_answer_question
  BEFORE INSERT OR UPDATE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_parent_answer_question();

-- ------------------------------------------------------------------------------
-- 5. Question Votes Table
-- Prevents duplicate upvotes on questions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_votes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_votes_question ON public.question_votes(question_id);

-- ------------------------------------------------------------------------------
-- 6. Answer Helpful Votes Table
-- Tracks appreciation votes on answers and replies
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.answer_helpful_votes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, answer_id)
);

CREATE INDEX IF NOT EXISTS idx_answer_helpful_votes_answer ON public.answer_helpful_votes(answer_id);

-- ------------------------------------------------------------------------------
-- 7. Follows Table
-- Social graph relationships (User A follows User B)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT prevent_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- ------------------------------------------------------------------------------
-- 8. Circle Members Table
-- Membership records for community circles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.circle_members (
  circle_id TEXT NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (circle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_members_user ON public.circle_members(user_id);

-- ------------------------------------------------------------------------------
-- 9. Circle Invitations Table (Authorized Pathway for Private Circles)
-- Manages invitations and approvals for private circle access
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.circle_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id TEXT NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (circle_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS idx_circle_invitations_user ON public.circle_invitations(invited_user_id, status);
CREATE INDEX IF NOT EXISTS idx_circle_invitations_circle ON public.circle_invitations(circle_id);

-- ------------------------------------------------------------------------------
-- 10. Circle Messages Table (Room Live Chat)
-- Real-time chat messages inside circle rooms
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.circle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id TEXT NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_circle_messages_circle ON public.circle_messages(circle_id, created_at ASC);

-- Set replica identity to full for robust Supabase Realtime diffs
ALTER TABLE public.circle_messages REPLICA IDENTITY FULL;

-- ------------------------------------------------------------------------------
-- 11. Circle Discussions Table (Long-form circle threads)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.circle_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id TEXT NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_circle_discussions_circle ON public.circle_discussions(circle_id, created_at DESC);

CREATE TRIGGER trg_circle_discussions_updated_at
  BEFORE UPDATE ON public.circle_discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 12. Circle Discussion Comments Table (Proper Threaded Comments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.circle_discussion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES public.circle_discussions(id) ON DELETE CASCADE,
  parent_comment_id UUID,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Enforce that parent comments belong to the exact same discussion
  CONSTRAINT uq_disc_comments_id_disc UNIQUE (id, discussion_id),
  CONSTRAINT fk_disc_comments_parent FOREIGN KEY (parent_comment_id, discussion_id)
    REFERENCES public.circle_discussion_comments(id, discussion_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_circle_disc_comments_disc ON public.circle_discussion_comments(discussion_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_circle_disc_comments_author ON public.circle_discussion_comments(author_id);

CREATE TRIGGER trg_circle_disc_comments_updated_at
  BEFORE UPDATE ON public.circle_discussion_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 13. Saved Posts Table
-- User bookmarks / saved discussions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_posts (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_posts_user ON public.saved_posts(user_id);

-- ------------------------------------------------------------------------------
-- 14. Notifications Table
-- Event-driven alerts (replies, upvotes, helpful marks, followers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('new_answer', 'new_reply', 'question_upvoted', 'answer_helpful', 'new_follower')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);

-- ==============================================================================
-- Automated Count Sync Triggers
-- Keeps counter columns in sync without requiring separate client aggregation
-- ==============================================================================

-- 1. Sync Question Answers Count
CREATE OR REPLACE FUNCTION public.sync_question_answers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions
    SET answers_count = answers_count + 1
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions
    SET answers_count = GREATEST(answers_count - 1, 0)
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_question_answers_count
  AFTER INSERT OR DELETE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_question_answers_count();

-- 2. Sync Question Votes Count
CREATE OR REPLACE FUNCTION public.sync_question_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions
    SET votes_count = votes_count + 1
    WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.question_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_question_votes_count
  AFTER INSERT OR DELETE ON public.question_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_question_votes_count();

-- 3. Sync Answer Helpful Count
CREATE OR REPLACE FUNCTION public.sync_answer_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.answers
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.answers
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.answer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_answer_helpful_count
  AFTER INSERT OR DELETE ON public.answer_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_answer_helpful_count();

-- 4. Sync Circle Members Count
CREATE OR REPLACE FUNCTION public.sync_circle_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circles
    SET members_count = members_count + 1
    WHERE id = NEW.circle_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circles
    SET members_count = GREATEST(members_count - 1, 0)
    WHERE id = OLD.circle_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_circle_members_count
  AFTER INSERT OR DELETE ON public.circle_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_circle_members_count();

-- 5. Sync Circle Discussion Comments Count
CREATE OR REPLACE FUNCTION public.sync_circle_disc_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.circle_discussions
    SET comments_count = comments_count + 1
    WHERE id = NEW.discussion_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.circle_discussions
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.discussion_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_circle_disc_comments_count
  AFTER INSERT OR DELETE ON public.circle_discussion_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_circle_disc_comments_count();

-- 6. Automatically accept invitation when joining a circle
CREATE OR REPLACE FUNCTION public.sync_invitation_on_circle_join()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.circle_invitations
  SET status = 'accepted'
  WHERE circle_id = NEW.circle_id
    AND invited_user_id = NEW.user_id
    AND status = 'pending';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_invitation_on_circle_join
  AFTER INSERT ON public.circle_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_invitation_on_circle_join();

-- ==============================================================================
-- Contribution Score Protection & Auto-Recalculation
-- Formula: (questions * 5) + (answers * 2) + helpful_votes_received + question_votes_received
-- Architecture:
-- 1. Database-level recalculation is atomic, querying normalized rows directly (independent of trigger order).
-- 2. Direct client updates to 'contribution_score' are discarded by trigger AND revoked by table/column privilege.
-- ==============================================================================

-- Guard: Prevent direct client updates from forging contribution_score
CREATE OR REPLACE FUNCTION public.guard_profile_contribution_score()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked from trusted internal database recalculation, permit the update
  IF current_setting('blu.internal_recalc', TRUE) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Otherwise, silently discard any client attempt to tamper with contribution_score
  IF NEW.contribution_score IS DISTINCT FROM OLD.contribution_score THEN
    NEW.contribution_score = OLD.contribution_score;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_guard_profile_contribution_score
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_contribution_score();

-- Trusted recalculation procedure: Queries normalized source-of-truth rows directly
CREATE OR REPLACE FUNCTION public.recalculate_user_contribution_score(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_questions_count INTEGER := 0;
  v_answers_count INTEGER := 0;
  v_helpful_received INTEGER := 0;
  v_question_votes_received INTEGER := 0;
  v_total_score INTEGER := 0;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;

  -- 1. Number of questions asked
  SELECT COUNT(*) INTO v_questions_count
  FROM public.questions
  WHERE author_id = target_user_id;

  -- 2. Number of answers/replies written
  SELECT COUNT(*) INTO v_answers_count
  FROM public.answers
  WHERE author_id = target_user_id;

  -- 3. Total helpful votes received on author's answers (direct from normalized rows)
  SELECT COUNT(*) INTO v_helpful_received
  FROM public.answer_helpful_votes hv
  JOIN public.answers a ON a.id = hv.answer_id
  WHERE a.author_id = target_user_id;

  -- 4. Total votes received on author's questions (direct from normalized rows)
  SELECT COUNT(*) INTO v_question_votes_received
  FROM public.question_votes qv
  JOIN public.questions q ON q.id = qv.question_id
  WHERE q.author_id = target_user_id;

  v_total_score := (v_questions_count * 5) + (v_answers_count * 2) + v_helpful_received + v_question_votes_received;

  -- Enable trusted session setting for this transaction
  PERFORM set_config('blu.internal_recalc', 'true', TRUE);

  UPDATE public.profiles
  SET contribution_score = v_total_score
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke table-level UPDATE first to avoid additive column privilege bypass, then grant only editable fields
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (username, full_name, bio, interests, avatar_id, photo_url, cover_hue) ON public.profiles TO authenticated;

-- Score trigger: On question creation / deletion
CREATE OR REPLACE FUNCTION public.trg_recalc_score_on_question()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_user_contribution_score(NEW.author_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_user_contribution_score(OLD.author_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_score_on_question
  AFTER INSERT OR DELETE ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_recalc_score_on_question();

-- Score trigger: On answer creation / deletion
CREATE OR REPLACE FUNCTION public.trg_recalc_score_on_answer()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_user_contribution_score(NEW.author_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_user_contribution_score(OLD.author_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_score_on_answer
  AFTER INSERT OR DELETE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_recalc_score_on_answer();

-- Score trigger: On question upvote / unvote
CREATE OR REPLACE FUNCTION public.trg_recalc_score_on_question_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_author UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT author_id INTO v_author FROM public.questions WHERE id = NEW.question_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT author_id INTO v_author FROM public.questions WHERE id = OLD.question_id;
  END IF;
  IF v_author IS NOT NULL THEN
    PERFORM public.recalculate_user_contribution_score(v_author);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_score_on_question_vote
  AFTER INSERT OR DELETE ON public.question_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_recalc_score_on_question_vote();

-- Score trigger: On answer helpful vote / unmark
CREATE OR REPLACE FUNCTION public.trg_recalc_score_on_helpful_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_author UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT author_id INTO v_author FROM public.answers WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT author_id INTO v_author FROM public.answers WHERE id = OLD.answer_id;
  END IF;
  IF v_author IS NOT NULL THEN
    PERFORM public.recalculate_user_contribution_score(v_author);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_score_on_helpful_vote
  AFTER INSERT OR DELETE ON public.answer_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_recalc_score_on_helpful_vote();

-- ==============================================================================
-- Safe New User Profile Trigger (Concurrency-Resilient & Bounded)
-- Automatically creates a public.profiles record when auth.users receives a new signup
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_name TEXT;
  base_uname TEXT;
  candidate_uname TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract display name from metadata or fallback to email local part
  raw_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'Explorer'
  );

  -- Sanitize to alphanumeric + underscore
  base_uname := LOWER(REGEXP_REPLACE(raw_name, '[^a-zA-Z0-9_]', '_', 'g'));
  IF LENGTH(base_uname) < 3 THEN
    base_uname := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 6);
  ELSIF LENGTH(base_uname) > 20 THEN
    base_uname := SUBSTRING(base_uname FROM 1 FOR 20);
  END IF;

  candidate_uname := base_uname;

  -- Concurrency-resilient insertion loop with bounded exception recovery
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_id,
        photo_url,
        bio,
        interests
      )
      VALUES (
        NEW.id,
        candidate_uname,
        raw_name,
        COALESCE(NEW.raw_user_meta_data->>'avatar_id', 'pip'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
        COALESCE(NEW.raw_user_meta_data->>'bio', 'A curious explorer learning and sharing on blu.'),
        ARRAY['Technology', 'Life', 'Ideas']
      )
      ON CONFLICT (id) DO UPDATE
      SET
        full_name = EXCLUDED.full_name,
        photo_url = COALESCE(EXCLUDED.photo_url, profiles.photo_url);

      -- Successful insert or upsert
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      counter := counter + 1;
      -- Append random hex entropy to resolve race conditions reliably
      candidate_uname := base_uname || '_' || SUBSTRING(MD5(NEW.id::TEXT || counter::TEXT || clock_timestamp()::TEXT) FROM 1 FOR 4);
      
      -- Bounded ceiling: If 10 random attempts collide, use deterministic user_<uuid_slice>
      IF counter = 11 THEN
        candidate_uname := 'user_' || SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 12);
      ELSIF counter > 15 THEN
        -- Prevent unbounded loops under any catastrophic condition
        RAISE WARNING 'handle_new_user: Retries exceeded for user %', NEW.id;
        EXIT;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Automated Notification Workflow Triggers (With Anti-Spam Deduplication)
-- Generated strictly by trusted server triggers. Clients CANNOT forge notifications.
-- ==============================================================================

-- 1. Notify Question Author on New Answer OR Parent Author on Reply
CREATE OR REPLACE FUNCTION public.trg_notify_on_new_answer()
RETURNS TRIGGER AS $$
DECLARE
  v_q_author UUID;
  v_q_title TEXT;
  v_p_author UUID;
BEGIN
  -- Get question author and title
  SELECT author_id, title INTO v_q_author, v_q_title
  FROM public.questions WHERE id = NEW.question_id;

  IF NEW.parent_answer_id IS NULL THEN
    -- Top-level answer: notify question author if not self
    IF v_q_author IS NOT NULL AND v_q_author <> NEW.author_id THEN
      INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        body,
        link
      )
      VALUES (
        v_q_author,
        NEW.author_id,
        'new_answer',
        'New answer on your discussion',
        'Someone answered your discussion: "' || SUBSTRING(v_q_title FROM 1 FOR 60) || '"',
        '/explore?q=' || NEW.question_id::TEXT
      );
    END IF;
  ELSE
    -- Threaded reply: notify parent answer author if not self
    SELECT author_id INTO v_p_author
    FROM public.answers WHERE id = NEW.parent_answer_id;

    IF v_p_author IS NOT NULL AND v_p_author <> NEW.author_id THEN
      INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        body,
        link
      )
      VALUES (
        v_p_author,
        NEW.author_id,
        'new_reply',
        'New reply to your answer',
        'Someone replied to your answer on: "' || SUBSTRING(v_q_title FROM 1 FOR 60) || '"',
        '/explore?q=' || NEW.question_id::TEXT || '&a=' || NEW.parent_answer_id::TEXT
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_on_answer
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_new_answer();

-- 2. Notify Question Author on Upvote (Deduplicated within 24 Hours)
CREATE OR REPLACE FUNCTION public.trg_notify_on_question_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_author UUID;
  v_title TEXT;
BEGIN
  SELECT author_id, title INTO v_author, v_title
  FROM public.questions WHERE id = NEW.question_id;

  IF v_author IS NOT NULL AND v_author <> NEW.user_id THEN
    -- Prevent notification flooding if toggling upvote repeatedly
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.recipient_id = v_author
        AND n.actor_id = NEW.user_id
        AND n.type = 'question_upvoted'
        AND n.link = '/explore?q=' || NEW.question_id::TEXT
        AND n.created_at > NOW() - INTERVAL '1 day'
    ) THEN
      INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        body,
        link
      )
      VALUES (
        v_author,
        NEW.user_id,
        'question_upvoted',
        'Discussion upvoted',
        'Your discussion "' || SUBSTRING(v_title FROM 1 FOR 60) || '" received an upvote.',
        '/explore?q=' || NEW.question_id::TEXT
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_on_question_vote
  AFTER INSERT ON public.question_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_question_vote();

-- 3. Notify Answer Author on Helpful Vote (Deduplicated within 24 Hours)
CREATE OR REPLACE FUNCTION public.trg_notify_on_helpful_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_author UUID;
  v_q_id UUID;
BEGIN
  SELECT author_id, question_id INTO v_author, v_q_id
  FROM public.answers WHERE id = NEW.answer_id;

  IF v_author IS NOT NULL AND v_author <> NEW.user_id THEN
    -- Prevent notification flooding if toggling helpful repeatedly
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.recipient_id = v_author
        AND n.actor_id = NEW.user_id
        AND n.type = 'answer_helpful'
        AND n.link = '/explore?q=' || v_q_id::TEXT
        AND n.created_at > NOW() - INTERVAL '1 day'
    ) THEN
      INSERT INTO public.notifications (
        recipient_id,
        actor_id,
        type,
        title,
        body,
        link
      )
      VALUES (
        v_author,
        NEW.user_id,
        'answer_helpful',
        'Answer marked helpful',
        'Someone marked your answer as helpful.',
        '/explore?q=' || v_q_id::TEXT
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_on_helpful_vote
  AFTER INSERT ON public.answer_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_helpful_vote();

-- 4. Notify User on New Follower (Deduplicated within 24 Hours)
CREATE OR REPLACE FUNCTION public.trg_notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  v_follower_name TEXT;
  v_follower_uname TEXT;
BEGIN
  SELECT username, COALESCE(full_name, username) INTO v_follower_uname, v_follower_name
  FROM public.profiles WHERE id = NEW.follower_id;

  -- Prevent notification flooding if toggling follow/unfollow repeatedly
  IF NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.recipient_id = NEW.following_id
      AND n.actor_id = NEW.follower_id
      AND n.type = 'new_follower'
      AND n.created_at > NOW() - INTERVAL '1 day'
  ) THEN
    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      link
    )
    VALUES (
      NEW.following_id,
      NEW.follower_id,
      'new_follower',
      'New follower',
      COALESCE(v_follower_name, 'A member') || ' started following your journey on blu.',
      '/profile/' || COALESCE(v_follower_uname, NEW.follower_id::TEXT)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_on_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_on_follow();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (TRUE);

-- Redundant client INSERT removed: Profiles are provisioned exclusively via auth.users trigger
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Circles
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circles are viewable by everyone"
  ON public.circles FOR SELECT
  USING (TRUE);

-- 3. Questions
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own questions"
  ON public.questions FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own questions"
  ON public.questions FOR DELETE
  USING (auth.uid() = author_id);

-- 4. Answers
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Answers are viewable by everyone"
  ON public.answers FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own answers"
  ON public.answers FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own answers"
  ON public.answers FOR DELETE
  USING (auth.uid() = author_id);

-- 5. Question Votes
ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Question votes are viewable by everyone"
  ON public.question_votes FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can cast a question vote"
  ON public.question_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own question vote"
  ON public.question_votes FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Answer Helpful Votes
ALTER TABLE public.answer_helpful_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Helpful votes are viewable by everyone"
  ON public.answer_helpful_votes FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can mark an answer helpful"
  ON public.answer_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark their helpful vote"
  ON public.answer_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can follow members"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);

CREATE POLICY "Users can unfollow members"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 8. Circle Members (Gated: Open Public Circles OR Valid Invitation for Private Circles)
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle members are viewable by everyone"
  ON public.circle_members FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can join public circles or private circles with valid invitation"
  ON public.circle_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Case A: Public circles can be freely joined
      EXISTS (
        SELECT 1 FROM public.circles c
        WHERE c.id = circle_members.circle_id
          AND NOT c.is_private
      )
      -- Case B: Private circles require an active invitation or creator status
      OR EXISTS (
        SELECT 1 FROM public.circle_invitations ci
        WHERE ci.circle_id = circle_members.circle_id
          AND ci.invited_user_id = auth.uid()
          AND ci.status = 'pending'
      )
      OR EXISTS (
        SELECT 1 FROM public.circles c
        WHERE c.id = circle_members.circle_id
          AND c.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Users can leave circles"
  ON public.circle_members FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Circle Invitations
ALTER TABLE public.circle_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their received or sent circle invitations"
  ON public.circle_invitations FOR SELECT
  USING (auth.uid() = invited_user_id OR auth.uid() = invited_by);

CREATE POLICY "Circle members can send invitations"
  ON public.circle_invitations FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circle_invitations.circle_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Invited users can update invitation status"
  ON public.circle_invitations FOR UPDATE
  USING (auth.uid() = invited_user_id)
  WITH CHECK (auth.uid() = invited_user_id);

CREATE POLICY "Inviters can delete their sent invitations"
  ON public.circle_invitations FOR DELETE
  USING (auth.uid() = invited_by);

-- 10. Circle Messages (Scoped Read + Verified Member Insertion)
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle messages are viewable for open circles or joined members"
  ON public.circle_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circles c
      WHERE c.id = circle_messages.circle_id
        AND (
          NOT c.is_private
          OR EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = c.id AND cm.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Members can post messages to circles they joined"
  ON public.circle_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_messages.circle_id
        AND circle_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can delete their own circle messages"
  ON public.circle_messages FOR DELETE
  USING (auth.uid() = author_id);

-- 11. Circle Discussions (Scoped Read + Verified Member Insertion)
ALTER TABLE public.circle_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle discussions are viewable for open circles or joined members"
  ON public.circle_discussions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circles c
      WHERE c.id = circle_discussions.circle_id
        AND (
          NOT c.is_private
          OR EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = c.id AND cm.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Members can start discussions in circles they joined"
  ON public.circle_discussions FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_discussions.circle_id
        AND circle_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their own circle discussions"
  ON public.circle_discussions FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own circle discussions"
  ON public.circle_discussions FOR DELETE
  USING (auth.uid() = author_id);

-- 12. Circle Discussion Comments (Scoped Read + Verified Member Insertion)
ALTER TABLE public.circle_discussion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable for open circles or joined members"
  ON public.circle_discussion_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_discussions d
      JOIN public.circles c ON c.id = d.circle_id
      WHERE d.id = circle_discussion_comments.discussion_id
        AND (
          NOT c.is_private
          OR EXISTS (
            SELECT 1 FROM public.circle_members cm
            WHERE cm.circle_id = c.id AND cm.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "Members can comment on discussions in circles they joined"
  ON public.circle_discussion_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.circle_discussions d
      JOIN public.circle_members cm ON cm.circle_id = d.circle_id
      WHERE d.id = circle_discussion_comments.discussion_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their own discussion comments"
  ON public.circle_discussion_comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own discussion comments"
  ON public.circle_discussion_comments FOR DELETE
  USING (auth.uid() = author_id);

-- 13. Saved Posts (Private to User)
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON public.saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved posts"
  ON public.saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 14. Notifications (Private to Recipient, Server-Triggered Only)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = recipient_id);

-- Direct client inserts revoked: Notifications are strictly created by server triggers
REVOKE INSERT ON public.notifications FROM anon, authenticated;

-- Direct client updates restricted strictly to is_read column: Content cannot be forged
REVOKE UPDATE ON public.notifications FROM anon, authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;

-- ==============================================================================
-- Realtime Publication Setup
-- Enables Supabase Realtime subscriptions for circle live chat
-- ==============================================================================

DO $$
BEGIN
  -- 1. Ensure publication exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- 2. Add circle_messages to publication safely
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'circle_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_messages;
  END IF;
END $$;

-- ==============================================================================
-- End of Migration 001_initial_schema.sql
-- (Core Public Schema, Constraints, Functions, Triggers, RLS & Realtime)
-- Note: Storage buckets and policies are separated into 002_storage_setup.sql
-- ==============================================================================
