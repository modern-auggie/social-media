"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collabItems,
  creatorTools,
  currentUser,
  exploreTiles,
  messageThreads,
  metrics,
  navItems,
  posts,
  products,
  reels,
  safetyTools,
  stories
} from "../src/data.js";
import { Icon } from "../src/icons.js";
import { platform } from "../src/platform.js";

const STORAGE_KEY = "friends-next-state";
const VIEW_IDS = new Set(navItems.map((item) => item.id));
const initialMediaIndex = Object.fromEntries(posts.map((post) => [post.id, 0]));
const initialThreadMessages = Object.fromEntries(messageThreads.map((thread) => [thread.id, thread.messages]));
const safetyDefaults = Object.fromEntries(safetyTools.map(([title]) => [title, title === "Private account"]));
const collabDefaults = Object.fromEntries(collabItems.map(([title, , status]) => [title, status]));

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value) {
  if (typeof value === "string") return value;
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(value > 9999 ? 0 : 1)}K`;
}

function Avatar({ label, size = "md", active = false }) {
  const sizes = {
    sm: "size-9 text-[0.7rem]",
    md: "size-11 text-sm",
    lg: "size-16 text-lg",
    xl: "size-24 text-2xl"
  };

  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-full border font-black text-slate-950 shadow-sm",
        "border-white/90 bg-[conic-gradient(from_180deg,#8fd8cb,#f4c95d,#f08c74,#84a7ff,#8fd8cb)]",
        sizes[size],
        active && "ring-4 ring-emerald-200"
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-white text-slate-700",
    blue: "border-sky-200 bg-sky-50 text-sky-800",
    coral: "border-rose-200 bg-rose-50 text-rose-800",
    gold: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dark: "border-slate-800 bg-slate-950 text-white"
  };

  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold", tones[tone])}>
      {children}
    </span>
  );
}

function IconButton({ icon, label, active = false, className = "", children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold transition",
        "border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
        active && "border-slate-950 bg-slate-950 text-white hover:bg-slate-900",
        className
      )}
    >
      <Icon name={icon} className="size-4 shrink-0" />
      {children ? <span>{children}</span> : null}
    </button>
  );
}

function PrimaryButton({ icon, children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition",
        "hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
        className
      )}
    >
      {icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}

function SecondaryButton({ icon, children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
        className
      )}
    >
      {icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}

function ViewHeader({ eyebrow, title, children }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{title}</h1>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

function MediaFrame({ item, children, tall = false }) {
  return (
    <figure className={cx("relative overflow-hidden rounded-[1.25rem] bg-slate-200", tall ? "aspect-[9/14]" : "aspect-[4/3]")}>
      <img className="size-full object-cover" src={item.src} alt={item.alt || ""} loading="lazy" />
      {item.type === "video" ? (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-black text-white backdrop-blur">
          <Icon name="play" className="size-3" />
          {item.duration || "Video"}
        </span>
      ) : null}
      {children}
    </figure>
  );
}

export default function FriendsApp() {
  const [view, setView] = useState("feed");
  const [selectedStory, setSelectedStory] = useState(stories[0].id);
  const [selectedThread, setSelectedThread] = useState(messageThreads[0].id);
  const [mediaIndex, setMediaIndex] = useState(initialMediaIndex);
  const [likedPosts, setLikedPosts] = useState(new Set(["post-1"]));
  const [savedPosts, setSavedPosts] = useState(new Set(["post-2"]));
  const [likedReels, setLikedReels] = useState(new Set(["reel-1"]));
  const [savedReels, setSavedReels] = useState(new Set());
  const [privateAccount, setPrivateAccount] = useState(false);
  const [vanishMode, setVanishMode] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerMode, setComposerMode] = useState("Photo");
  const [draftPosts, setDraftPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [exploreFilter, setExploreFilter] = useState("All");
  const [pollVotes, setPollVotes] = useState({});
  const [followed, setFollowed] = useState(new Set(["maya.creates"]));
  const [threadMessages, setThreadMessages] = useState(initialThreadMessages);
  const [messageDraft, setMessageDraft] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(new Set(["p1"]));
  const [isLive, setIsLive] = useState(false);
  const [liveReaction, setLiveReaction] = useState("");
  const [liveComments, setLiveComments] = useState([
    ["@rinphoto", "How do you keep audio clean?"],
    ["@northskin", "Product demo is ready when you are."],
    ["@eli.moves", "Bring me on after the intro."]
  ]);
  const [liveDraft, setLiveDraft] = useState("");
  const [activeCreatorTool, setActiveCreatorTool] = useState("Insights");
  const [collabStatuses, setCollabStatuses] = useState(collabDefaults);
  const [safetyPrefs, setSafetyPrefs] = useState(safetyDefaults);
  const [editingProfile, setEditingProfile] = useState(false);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const allPosts = useMemo(() => [...draftPosts, ...posts], [draftPosts]);
  const selectedStoryData = stories.find((story) => story.id === selectedStory) || stories[0];
  const selectedThreadData = messageThreads.find((thread) => thread.id === selectedThread) || messageThreads[0];
  const selectedMessages = threadMessages[selectedThreadData.id] || selectedThreadData.messages;
  const filteredExplore = exploreTiles.filter((tile) => {
    const matchesSearch = [tile.title, tile.meta, tile.category].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = exploreFilter === "All" || tile.category === exploreFilter;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const saved = platform.storage.read(STORAGE_KEY, {});
    setLikedPosts(new Set(saved.likedPosts || ["post-1"]));
    setSavedPosts(new Set(saved.savedPosts || ["post-2"]));
    setLikedReels(new Set(saved.likedReels || ["reel-1"]));
    setSavedReels(new Set(saved.savedReels || []));
    setPrivateAccount(saved.privateAccount ?? false);
    setVanishMode(saved.vanishMode ?? true);
    setWishlist(new Set(saved.wishlist || ["p1"]));
    setCart(saved.cart || []);
    setSafetyPrefs({ ...safetyDefaults, ...(saved.safetyPrefs || {}) });
    setHydrated(true);

    const syncHash = () => {
      const next = window.location.hash.replace("#", "");
      if (VIEW_IDS.has(next)) setView(next);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    platform.storage.write(STORAGE_KEY, {
      likedPosts: [...likedPosts],
      savedPosts: [...savedPosts],
      likedReels: [...likedReels],
      savedReels: [...savedReels],
      privateAccount,
      vanishMode,
      wishlist: [...wishlist],
      cart,
      safetyPrefs
    });
  }, [cart, hydrated, likedPosts, likedReels, privateAccount, safetyPrefs, savedPosts, savedReels, vanishMode, wishlist]);

  useEffect(() => {
    if (composerOpen && view === "feed") {
      window.requestAnimationFrame(() => document.getElementById("composer-input")?.focus());
    }
  }, [composerOpen, view]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function showToast(message) {
    setToast(message);
  }

  function routeTo(next) {
    const safeView = VIEW_IDS.has(next) ? next : "feed";
    setView(safeView);
    if (safeView !== "feed") setComposerOpen(false);
    if (typeof window !== "undefined") window.history.replaceState(null, "", `#${safeView}`);
  }

  function toggleSet(setter, id, message) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    if (message) showToast(message);
  }

  function cycleMedia(postId, direction) {
    const post = allPosts.find((item) => item.id === postId);
    if (!post || post.media.length < 2) return;
    setMediaIndex((current) => ({
      ...current,
      [postId]: ((current[postId] || 0) + direction + post.media.length) % post.media.length
    }));
  }

  function openComposer(mode = "Photo") {
    setComposerMode(mode);
    setComposerOpen(true);
    routeTo("feed");
  }

  function publishPost() {
    const caption = composerText.trim();
    const newPost = {
      id: `draft-${Date.now()}`,
      author: currentUser.handle,
      avatar: currentUser.avatar,
      location: "Shared from Friends",
      published: "now",
      type: composerMode.toLowerCase(),
      media: [
        {
          type: composerMode === "Reel" ? "video" : "photo",
          src: composerMode === "Reel" ? "/assets/reel-dance.png" : "/assets/creator-studio.png",
          alt: "New post preview",
          duration: composerMode === "Reel" ? "0:12" : undefined
        }
      ],
      caption: caption || "A fresh update from Daisy.",
      hashtags: caption.match(/#[\w]+/g) || ["#friends"],
      tags: caption.match(/@[\w.]+/g) || [],
      stats: { likes: 0, comments: 0, saves: 0, shares: 0 },
      comments: ["Published locally in this prototype."]
    };
    setDraftPosts((current) => [newPost, ...current]);
    setMediaIndex((current) => ({ ...current, [newPost.id]: 0 }));
    setComposerText("");
    setComposerOpen(false);
    showToast(`${composerMode} published to your feed`);
  }

  async function sharePost(post) {
    try {
      const url = `${window.location.origin}${window.location.pathname}#feed`;
      const result = await platform.share({ title: "Friends post", text: post.caption, url });
      showToast(result === "native" ? "Share sheet opened" : result === "clipboard" ? "Link copied" : "Share queued");
    } catch {
      showToast("Share cancelled");
    }
  }

  async function copyProfileLink() {
    await platform.copy(`https://${currentUser.link}`);
    showToast("Profile link copied");
  }

  function voteStory(option) {
    setPollVotes((current) => ({ ...current, [selectedStoryData.id]: option }));
    showToast(`Voted for ${option}`);
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!text) {
      showToast("Write a message first");
      return;
    }
    setThreadMessages((current) => ({
      ...current,
      [selectedThreadData.id]: [...(current[selectedThreadData.id] || []), ["Daisy", text]]
    }));
    setMessageDraft("");
    showToast("Message sent");
  }

  function sendLiveComment(event) {
    event.preventDefault();
    const text = liveDraft.trim();
    if (!text) {
      showToast("Write a live comment first");
      return;
    }
    setLiveComments((current) => [["@daisybuilds", text], ...current]);
    setLiveDraft("");
    showToast("Live comment posted");
  }

  function addToCart(product) {
    setCart((current) => [...current, product.id]);
    showToast(`${product.name} added to cart`);
  }

  function nextCollabStatus(title) {
    const order = ["Needs review", "Ready to publish", "Active", "Complete"];
    setCollabStatuses((current) => {
      const index = order.indexOf(current[title]);
      return { ...current, [title]: order[(index + 1) % order.length] };
    });
    showToast(`${title} status updated`);
  }

  const views = {
    feed: renderFeed,
    stories: renderStories,
    reels: renderReels,
    messages: renderMessages,
    explore: renderExplore,
    live: renderLive,
    profile: renderProfile,
    creator: renderCreator,
    shop: renderShop,
    collab: renderCollab,
    safety: renderSafety
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1580px] gap-4 px-3 py-3 sm:px-4 lg:px-5">
        <aside className="sticky top-3 hidden h-[calc(100vh-1.5rem)] w-[88px] shrink-0 flex-col rounded-[1.4rem] border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur xl:w-64 lg:flex">
          <button
            type="button"
            onClick={() => routeTo("feed")}
            className="flex min-h-12 items-center justify-center gap-3 rounded-2xl text-left text-xl font-black text-slate-950 xl:justify-start xl:px-2"
            aria-label="Friends home"
            title="Friends home"
          >
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white">
              <Icon name="sparkles" className="size-5" />
            </span>
            <span className="hidden xl:inline">Friends</span>
          </button>

          <nav className="mt-5 grid gap-1" aria-label="Primary">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => routeTo(item.id)}
                title={item.label}
                className={cx(
                  "flex min-h-11 items-center justify-center gap-3 rounded-2xl px-3 text-sm font-black transition xl:justify-start",
                  view === item.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                )}
              >
                <Icon name={item.icon} className="size-5 shrink-0" />
                <span className="hidden xl:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => openComposer("Photo")}
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-3 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-400 xl:justify-start"
            title="Create post"
          >
            <Icon name="plus" className="size-5 shrink-0" />
            <span className="hidden xl:inline">Create</span>
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-3 z-30 rounded-[1.4rem] border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => routeTo("feed")}
                className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white lg:hidden"
                aria-label="Friends home"
                title="Friends home"
              >
                <Icon name="sparkles" className="size-5" />
              </button>

              <form
                className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  routeTo("explore");
                  showToast(search ? `Searching for ${search}` : "Showing Explore");
                }}
              >
                <Icon name="search" className="size-4 shrink-0 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search people, topics, locations, and hashtags"
                  aria-label="Search"
                />
              </form>

              <IconButton
                icon="plus"
                label="Create post"
                onClick={() => openComposer("Photo")}
                className="hidden sm:inline-flex"
              >
                Create
              </IconButton>
              <IconButton
                icon="bell"
                label="Notifications"
                onClick={() => {
                  routeTo("safety");
                  showToast("Privacy and notification controls opened");
                }}
                className="size-11 px-0"
              />
              <button
                type="button"
                onClick={() => routeTo("profile")}
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                aria-label="Open profile"
                title="Open profile"
              >
                <Avatar label={currentUser.avatar} size="sm" />
              </button>
            </div>

            <nav className="no-scrollbar mt-2 flex gap-2 overflow-x-auto lg:hidden" aria-label="Mobile primary">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => routeTo(item.id)}
                  className={cx(
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-black transition",
                    view === item.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  <Icon name={item.icon} className="size-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </header>

          <section className="py-4 sm:py-5" aria-live="polite">
            {(views[view] || renderFeed)()}
          </section>
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      ) : null}
    </div>
  );

  function renderFeed() {
    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ViewHeader eyebrow="Today" title="Feed">
            <div className="rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {["Photo", "Reel", "Story"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => (mode === "Story" ? routeTo("stories") : openComposer(mode))}
                  className={cx(
                    "min-h-9 rounded-full px-3 text-sm font-black transition",
                    composerMode === mode && composerOpen ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </ViewHeader>

          <section
            className={cx(
              "rounded-[1.4rem] border p-3 shadow-sm transition",
              composerOpen ? "border-slate-300 bg-white" : "border-slate-200 bg-white/80"
            )}
            aria-label="Create post"
          >
            <div className="flex gap-3">
              <Avatar label={currentUser.avatar} />
              <div className="min-w-0 flex-1">
                <textarea
                  id="composer-input"
                  value={composerText}
                  onFocus={() => setComposerOpen(true)}
                  onChange={(event) => setComposerText(event.target.value)}
                  rows={composerOpen ? 3 : 1}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
                  placeholder="Share a caption, add #hashtags, tag people, or set a location"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {[
                    ["Photo", "camera"],
                    ["Reel", "video"],
                    ["Tags", "tag"],
                    ["Schedule", "calendar"]
                  ].map(([label, icon]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        if (label === "Tags") setComposerText((text) => `${text}${text.endsWith(" ") || !text ? "" : " "}#`);
                        if (label === "Schedule") showToast("Post added to the scheduling queue");
                        if (label === "Photo" || label === "Reel") setComposerMode(label);
                        setComposerOpen(true);
                      }}
                      className={cx(
                        "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-black transition",
                        composerMode === label
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Icon name={icon} className="size-4" />
                      {label}
                    </button>
                  ))}
                  <PrimaryButton icon="upload" onClick={publishPost} className="ml-auto min-h-9 px-3 text-xs">
                    Publish
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5">
            {allPosts.map((post) => renderPost(post))}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-[6.25rem] xl:h-fit">
          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-slate-950">Stories</h2>
              <button type="button" onClick={() => routeTo("stories")} className="text-sm font-black text-emerald-700 hover:text-emerald-900">
                View all
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {stories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => {
                    setSelectedStory(story.id);
                    routeTo("stories");
                  }}
                  className="flex items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-slate-50"
                >
                  <Avatar label={story.avatar} active={story.id === selectedStory} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-slate-950">{story.user}</span>
                    <span className="block truncate text-xs font-bold text-slate-500">{story.expires} left</span>
                  </span>
                  <Icon name="chevronRight" className="size-4 text-slate-400" />
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-black text-slate-950">Today at a glance</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {metrics.map(([label, value, change]) => (
                <article key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-xs font-bold text-slate-500">{label}</span>
                  <strong className="mt-1 block text-xl font-black text-slate-950">{value}</strong>
                  <small className="font-black text-emerald-700">{change}</small>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    );
  }

  function renderPost(post) {
    const index = mediaIndex[post.id] || 0;
    const currentMedia = post.media[index] || post.media[0];
    const liked = likedPosts.has(post.id);
    const saved = savedPosts.has(post.id);
    const following = followed.has(post.author);

    return (
      <article key={post.id} className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-3 p-4">
          <Avatar label={post.avatar} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <strong className="truncate text-sm font-black text-slate-950">{post.author}</strong>
              <span className="text-xs font-bold text-slate-400">{post.published}</span>
            </div>
            <span className="block truncate text-xs font-bold text-slate-500">{post.location}</span>
          </div>
          <button
            type="button"
            onClick={() => toggleSet(setFollowed, post.author, following ? `Unfollowed ${post.author}` : `Following ${post.author}`)}
            className={cx(
              "min-h-9 rounded-full px-3 text-xs font-black transition",
              following ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            )}
          >
            {following ? "Following" : "Follow"}
          </button>
        </header>

        <div className="px-4">
          <MediaFrame item={currentMedia}>
            {post.media.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => cycleMedia(post.id, -1)}
                  className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Previous media"
                  title="Previous media"
                >
                  <Icon name="chevronLeft" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => cycleMedia(post.id, 1)}
                  className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Next media"
                  title="Next media"
                >
                  <Icon name="chevronRight" className="size-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-950/70 px-2 py-1 backdrop-blur">
                  {post.media.map((item, dotIndex) => (
                    <span
                      key={`${item.src}-${dotIndex}`}
                      className={cx("size-1.5 rounded-full", dotIndex === index ? "bg-white" : "bg-white/40")}
                    />
                  ))}
                </div>
              </>
            ) : null}
            {post.product ? (
              <button
                type="button"
                onClick={() => routeTo("shop")}
                className="absolute bottom-3 left-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-white/95 px-3 text-xs font-black text-slate-950 shadow-sm backdrop-blur transition hover:bg-white"
              >
                <Icon name="tag" className="size-4" />
                {post.product.name} {post.product.price}
              </button>
            ) : null}
          </MediaFrame>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              icon="heart"
              label={liked ? "Unlike post" : "Like post"}
              active={liked}
              onClick={() => toggleSet(setLikedPosts, post.id, liked ? "Like removed" : "Post liked")}
            >
              {formatNumber(post.stats.likes + (liked ? 1 : 0))}
            </IconButton>
            <IconButton icon="comment" label="Open comments" onClick={() => routeTo("messages")}>
              {formatNumber(post.stats.comments)}
            </IconButton>
            <IconButton icon="send" label="Share post" onClick={() => sharePost(post)}>
              {formatNumber(post.stats.shares)}
            </IconButton>
          </div>
          <IconButton
            icon="bookmark"
            label={saved ? "Unsave post" : "Save post"}
            active={saved}
            onClick={() => toggleSet(setSavedPosts, post.id, saved ? "Removed from saved" : "Saved post")}
          >
            {saved ? "Saved" : "Save"}
          </IconButton>
        </div>

        <div className="space-y-3 px-4 pb-4">
          <p className="text-sm leading-6 text-slate-700">
            <strong className="font-black text-slate-950">{post.author}</strong> {post.caption}
          </p>
          <div className="flex flex-wrap gap-2">
            {[...post.hashtags, ...post.tags].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearch(tag.replace("#", ""));
                  routeTo("explore");
                }}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-200"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="grid gap-2 border-t border-slate-100 pt-3">
            {post.comments.map((comment) => (
              <p key={comment} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                {comment}
              </p>
            ))}
          </div>
        </div>
      </article>
    );
  }

  function renderStories() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Disappears in 24 hours" title="Stories">
          <PrimaryButton icon="plus" onClick={() => openComposer("Story")}>
            Create story
          </PrimaryButton>
        </ViewHeader>

        <div className="no-scrollbar flex gap-3 overflow-x-auto rounded-[1.4rem] border border-slate-200 bg-white p-3 shadow-sm">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setSelectedStory(story.id)}
              className={cx(
                "flex min-w-28 flex-col items-center gap-2 rounded-2xl p-3 text-center transition",
                story.id === selectedStoryData.id ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              <Avatar label={story.avatar} active={story.id === selectedStoryData.id} />
              <span className="max-w-24 truncate text-xs font-black">{story.user}</span>
            </button>
          ))}
        </div>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)]">
          <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-950 shadow-sm">
            <img className="h-[min(72vh,760px)] min-h-[520px] w-full object-cover" src={selectedStoryData.media} alt={selectedStoryData.title} />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-slate-950/70 to-transparent p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar label={selectedStoryData.avatar} size="sm" />
                  <div>
                    <strong className="block text-sm font-black text-white">{selectedStoryData.user}</strong>
                    <span className="text-xs font-bold text-white/70">{selectedStoryData.expires} left</span>
                  </div>
                </div>
                <IconButton
                  icon="close"
                  label="Close stories"
                  onClick={() => routeTo("feed")}
                  className="border-white/20 bg-white/15 text-white hover:bg-white/25"
                />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
              <h2 className="text-3xl font-black text-white">{selectedStoryData.title}</h2>
              <p className="mt-2 max-w-xl text-sm font-semibold text-white/75">Highlight: {selectedStoryData.highlight}</p>
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-black text-slate-950">Story tools</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {selectedStoryData.stickers.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (item === "Music") routeTo("reels");
                      else if (item === "Link") copyProfileLink();
                      else showToast(`${item} sticker added`);
                    }}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-700 transition hover:bg-white"
                  >
                    <Icon name={item === "Music" ? "music" : item === "Link" ? "link" : "sparkles"} className="size-4" />
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-black text-slate-950">Poll</h2>
                <Pill tone={pollVotes[selectedStoryData.id] ? "green" : "gold"}>
                  {pollVotes[selectedStoryData.id] ? "Voted" : "Open"}
                </Pill>
              </div>
              <div className="mt-3 grid gap-2">
                {selectedStoryData.poll.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => voteStory(option)}
                    className={cx(
                      "flex min-h-12 items-center justify-between rounded-2xl border px-4 text-sm font-black transition",
                      pollVotes[selectedStoryData.id] === option
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                    )}
                  >
                    <span>{option}</span>
                    <span>{selectedStoryData.pollResults[index]}%</span>
                  </button>
                ))}
              </div>
            </section>

            <SecondaryButton
              icon="bookmark"
              onClick={() => {
                routeTo("profile");
                showToast("Highlight opened on profile");
              }}
              className="w-full"
            >
              Save to highlight
            </SecondaryButton>
          </div>
        </section>
      </div>
    );
  }

  function renderReels() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Discovery video" title="Reels">
          <SecondaryButton icon="music" onClick={() => showToast("Music browser opened")}>
            Music
          </SecondaryButton>
          <PrimaryButton icon="video" onClick={() => openComposer("Reel")}>
            New reel
          </PrimaryButton>
        </ViewHeader>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reels.map((reel) => {
            const liked = likedReels.has(reel.id);
            const saved = savedReels.has(reel.id);
            return (
              <article key={reel.id} className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
                <div className="relative">
                  <MediaFrame item={{ src: reel.src, alt: reel.title, type: "video", duration: "0:20" }} tall>
                    <button
                      type="button"
                      onClick={() => showToast(`Playing ${reel.title}`)}
                      className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-sm transition hover:scale-105 hover:bg-white"
                      aria-label={`Play ${reel.title}`}
                      title={`Play ${reel.title}`}
                    >
                      <Icon name="play" className="size-7 translate-x-0.5" />
                    </button>
                  </MediaFrame>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar label={reel.avatar} />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-black text-slate-950">{reel.author}</strong>
                      <span className="block truncate text-xs font-bold text-slate-500">{reel.audio}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-slate-950">{reel.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {reel.effects.map((effect) => (
                      <button
                        key={effect}
                        type="button"
                        onClick={() => {
                          setActiveCreatorTool("Content health");
                          routeTo("creator");
                          showToast(`${effect} opened in creator tools`);
                        }}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-200"
                      >
                        {effect}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <IconButton
                      icon="heart"
                      label={liked ? "Unlike reel" : "Like reel"}
                      active={liked}
                      onClick={() => toggleSet(setLikedReels, reel.id, liked ? "Reel unliked" : "Reel liked")}
                    >
                      {reel.stats.likes}
                    </IconButton>
                    <IconButton icon="comment" label="Open reel comments" onClick={() => routeTo("messages")}>
                      {reel.stats.comments}
                    </IconButton>
                    <IconButton icon="bookmark" label={saved ? "Unsave reel" : "Save reel"} active={saved} onClick={() => toggleSet(setSavedReels, reel.id, saved ? "Reel removed" : "Reel saved")} />
                    <IconButton icon="send" label="Share reel" onClick={() => sharePost({ caption: reel.title })} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Private and group chat" title="Direct Messages">
          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={vanishMode}
              onChange={(event) => {
                setVanishMode(event.target.checked);
                showToast(event.target.checked ? "Disappearing mode on" : "Disappearing mode off");
              }}
              className="size-4 accent-slate-950"
            />
            Disappearing
          </label>
        </ViewHeader>

        <section className="grid overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[330px_minmax(0,1fr)]">
          <div className="border-b border-slate-200 p-3 lg:border-b-0 lg:border-r">
            <div className="no-scrollbar flex gap-2 overflow-x-auto lg:grid lg:overflow-visible">
              {messageThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThread(thread.id)}
                  className={cx(
                    "flex min-w-72 items-center gap-3 rounded-2xl p-3 text-left transition lg:min-w-0",
                    thread.id === selectedThreadData.id ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Avatar label={thread.avatar} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black">{thread.name}</span>
                    <span className={cx("block truncate text-xs font-bold", thread.id === selectedThreadData.id ? "text-white/60" : "text-slate-500")}>
                      {thread.type} - {thread.members}
                    </span>
                  </span>
                  {thread.unread ? <span className="grid size-6 place-items-center rounded-full bg-rose-500 text-xs font-black text-white">{thread.unread}</span> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-[560px] flex-col">
            <header className="flex items-center gap-3 border-b border-slate-200 p-4">
              <Avatar label={selectedThreadData.avatar} />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-black text-slate-950">{selectedThreadData.name}</strong>
                <span className="block truncate text-xs font-bold text-slate-500">{selectedThreadData.members}</span>
              </div>
              <div className="flex gap-2">
                <IconButton icon="mic" label="Record voice message" onClick={() => showToast("Voice note recorded")} className="size-10 px-0" />
                <IconButton icon="camera" label="Send media" onClick={() => openComposer("Photo")} className="size-10 px-0" />
                <IconButton icon="users" label="Group settings" onClick={() => routeTo("collab")} className="size-10 px-0" />
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {selectedMessages.map(([person, message], index) => (
                <p
                  key={`${person}-${message}-${index}`}
                  className={cx(
                    "max-w-[78%] rounded-2xl px-4 py-3 text-sm font-semibold leading-6 shadow-sm",
                    person === "Daisy" ? "ml-auto bg-slate-950 text-white" : "bg-white text-slate-700"
                  )}
                >
                  <strong className="mb-1 block text-xs font-black opacity-70">{person}</strong>
                  {message}
                </p>
              ))}
            </div>

            <form className="flex items-center gap-2 border-t border-slate-200 p-3" onSubmit={sendMessage}>
              <IconButton icon="sparkles" label="Open stickers" onClick={() => routeTo("stories")} className="size-11 px-0" />
              <input
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                className="min-h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-emerald-400 focus:bg-white"
                placeholder="Message, photo, video, sticker, or voice note"
                aria-label="Message"
              />
              <PrimaryButton icon="send" type="submit" className="size-11 px-0">
                <span className="sr-only">Send</span>
              </PrimaryButton>
            </form>
          </div>
        </section>
      </div>
    );
  }

  function renderExplore() {
    const filters = ["All", ...new Set(exploreTiles.map((tile) => tile.category))];

    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Personalized discovery" title="Explore">
          <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setExploreFilter(filter)}
                className={cx(
                  "min-h-9 shrink-0 rounded-full px-3 text-sm font-black transition",
                  exploreFilter === filter ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </ViewHeader>

        <div className="grid auto-rows-[220px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExplore.map((tile, index) => (
            <button
              key={tile.title}
              type="button"
              onClick={() => {
                routeTo(tile.target);
                showToast(`${tile.title} opened`);
              }}
              className={cx(
                "group relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-950 text-left shadow-sm",
                index % 5 === 0 && "sm:col-span-2"
              )}
            >
              <img className="size-full object-cover opacity-85 transition group-hover:scale-105 group-hover:opacity-95" src={tile.image} alt={tile.title} loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-4">
                <span className="block text-2xl font-black text-white">{tile.title}</span>
                <span className="mt-1 block text-sm font-bold text-white/70">{tile.meta}</span>
              </span>
            </button>
          ))}
        </div>

        {filteredExplore.length === 0 ? (
          <section className="rounded-[1.4rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">No matches</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Try another search or reset the filter.</p>
            <SecondaryButton
              icon="close"
              onClick={() => {
                setSearch("");
                setExploreFilter("All");
              }}
              className="mt-4"
            >
              Clear filters
            </SecondaryButton>
          </section>
        ) : null}
      </div>
    );
  }

  function renderLive() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Real time broadcast" title="Live Studio">
          <Pill tone={isLive ? "coral" : "neutral"}>{isLive ? "On air" : "Preview"}</Pill>
          <PrimaryButton
            icon={isLive ? "close" : "video"}
            onClick={() => {
              setIsLive((current) => !current);
              showToast(isLive ? "Live ended" : "Live started");
            }}
          >
            {isLive ? "End live" : "Go live"}
          </PrimaryButton>
        </ViewHeader>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-950 shadow-sm">
            <img className="h-[min(72vh,760px)] min-h-[500px] w-full object-cover opacity-90" src="/assets/creator-studio.png" alt="Live studio preview" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Pill tone={isLive ? "coral" : "dark"}>{isLive ? "Live now" : "Preview"}</Pill>
              <Pill tone="dark">2.4K waiting</Pill>
            </div>
            <div className="absolute bottom-4 right-4 grid gap-2">
              {["heart", "sparkles", "comment", "send"].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setLiveReaction(name);
                    if (name === "comment") document.getElementById("live-comment")?.focus();
                    if (name === "send") sharePost({ caption: "Join my Friends live" });
                    showToast(`${name} sent`);
                  }}
                  className={cx(
                    "grid size-11 place-items-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition hover:bg-white/25",
                    liveReaction === name && "bg-white text-slate-950"
                  )}
                  aria-label={`${name} reaction`}
                  title={`${name} reaction`}
                >
                  <Icon name={name} className="size-5" />
                </button>
              ))}
            </div>
          </div>

          <aside className="flex min-h-[500px] flex-col rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-lg font-black text-slate-950">Q&A and comments</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Guest queue and live chat stay together.</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {liveComments.map(([person, comment], index) => (
                <p key={`${person}-${comment}-${index}`} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  <strong className="font-black text-slate-950">{person}</strong> {comment}
                </p>
              ))}
            </div>
            <div className="border-t border-slate-200 p-3">
              <SecondaryButton icon="users" onClick={() => routeTo("collab")} className="mb-3 w-full">
                Invite guest
              </SecondaryButton>
              <form className="flex gap-2" onSubmit={sendLiveComment}>
                <input
                  id="live-comment"
                  value={liveDraft}
                  onChange={(event) => setLiveDraft(event.target.value)}
                  className="min-h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-emerald-400 focus:bg-white"
                  placeholder="Add a live comment"
                  aria-label="Live comment"
                />
                <PrimaryButton icon="send" type="submit" className="size-11 px-0">
                  <span className="sr-only">Send live comment</span>
                </PrimaryButton>
              </form>
            </div>
          </aside>
        </section>
      </div>
    );
  }

  function renderProfile() {
    return (
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
          <div className="h-44 bg-[linear-gradient(120deg,#8fd8cb,#f4c95d_38%,#f08c74_70%,#84a7ff)]" />
          <div className="p-4 sm:p-6">
            <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar label={currentUser.avatar} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">@{currentUser.handle}</p>
                <h1 className="text-4xl font-black text-slate-950">{currentUser.name}</h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">{currentUser.bio}</p>
                <button type="button" onClick={copyProfileLink} className="mt-1 text-sm font-black text-emerald-700 hover:text-emerald-900">
                  {currentUser.link}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton
                  icon="plus"
                  onClick={() => {
                    setEditingProfile((current) => !current);
                    showToast(editingProfile ? "Profile editor closed" : "Profile editor opened");
                  }}
                >
                  Edit profile
                </SecondaryButton>
                <PrimaryButton icon="send" onClick={copyProfileLink}>
                  Share
                </PrimaryButton>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-2">
              {Object.entries(currentUser.stats).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <dt className="text-xs font-bold capitalize text-slate-500">{key}</dt>
                  <dd className="mt-1 text-lg font-black text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>

            {editingProfile ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <label className="text-xs font-black uppercase tracking-[0.14em] text-emerald-900">Bio</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={currentUser.bio}
                    readOnly
                    className="min-h-11 min-w-0 flex-1 rounded-full border border-emerald-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
                  />
                  <PrimaryButton
                    icon="check"
                    onClick={() => {
                      setEditingProfile(false);
                      showToast("Profile changes saved");
                    }}
                  >
                    Save
                  </PrimaryButton>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {stories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => {
                setSelectedStory(story.id);
                routeTo("stories");
              }}
              className="flex min-w-44 items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:bg-slate-50"
            >
              <Avatar label={story.avatar} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-slate-950">{story.highlight}</span>
                <span className="block text-xs font-bold text-slate-500">{story.user}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allPosts.flatMap((post) => post.media.map((item) => ({ ...item, postId: post.id }))).slice(0, 6).map((item, index) => (
            <button
              key={`${item.postId}-${index}`}
              type="button"
              onClick={() => routeTo("feed")}
              className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm"
            >
              <MediaFrame item={item} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderCreator() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Creator and business tools" title="Professional Dashboard">
          <SecondaryButton icon="upload" onClick={() => showToast("Insights report copied to clipboard")}>
            Export
          </SecondaryButton>
          <PrimaryButton icon="calendar" onClick={() => openComposer("Photo")}>
            Schedule content
          </PrimaryButton>
        </ViewHeader>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, change]) => (
            <article key={label} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-sm font-bold text-slate-500">{label}</span>
              <strong className="mt-2 block text-3xl font-black text-slate-950">{value}</strong>
              <small className="font-black text-emerald-700">{change}</small>
            </article>
          ))}
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          {creatorTools.map(([title, copy, icon, action]) => (
            <article
              key={title}
              className={cx(
                "rounded-[1.4rem] border bg-white p-4 shadow-sm transition",
                activeCreatorTool === title ? "border-slate-950" : "border-slate-200"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon name={icon} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-slate-950">{title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
                </div>
              </div>
              <SecondaryButton
                icon="chevronRight"
                onClick={() => {
                  setActiveCreatorTool(title);
                  showToast(`${title} selected`);
                }}
                className="mt-4"
              >
                {action}
              </SecondaryButton>
            </article>
          ))}
        </section>
      </div>
    );
  }

  function renderShop() {
    const cartCount = cart.length;

    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Social commerce" title="Shopping">
          <Pill tone="green">{cartCount} in cart</Pill>
          <PrimaryButton
            icon="cart"
            onClick={() => showToast(cartCount ? "Checkout started" : "Cart is empty")}
          >
            Checkout
          </PrimaryButton>
        </ViewHeader>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const wished = wishlist.has(product.id);
            return (
              <article key={product.id} className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
                <MediaFrame item={{ src: product.image, alt: product.name, type: "photo" }} />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Pill tone="green">{product.tag}</Pill>
                      <h2 className="mt-3 text-xl font-black text-slate-950">{product.name}</h2>
                      <p className="text-sm font-bold text-slate-500">{product.merchant}</p>
                    </div>
                    <strong className="text-xl font-black text-slate-950">{product.price}</strong>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{product.stock === 999 ? "Digital download" : `${product.stock} available`}</p>
                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton icon="cart" onClick={() => addToCart(product)}>
                      Add
                    </PrimaryButton>
                    <IconButton
                      icon="bookmark"
                      label={wished ? "Remove from wishlist" : "Save to wishlist"}
                      active={wished}
                      onClick={() => toggleSet(setWishlist, product.id, wished ? "Removed from wishlist" : "Saved to wishlist")}
                    />
                    <SecondaryButton icon="link" onClick={() => routeTo("profile")}>
                      Merchant
                    </SecondaryButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCollab() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Shared publishing" title="Collaborations">
          <SecondaryButton icon="mail" onClick={() => routeTo("messages")}>
            Message partners
          </SecondaryButton>
          <PrimaryButton icon="users" onClick={() => routeTo("profile")}>
            Invite creator
          </PrimaryButton>
        </ViewHeader>

        <section className="grid gap-3">
          {collabItems.map(([title, copy]) => (
            <article key={title} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon name="link" className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black text-slate-950">{title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={collabStatuses[title] === "Active" ? "green" : collabStatuses[title] === "Needs review" ? "gold" : "blue"}>
                    {collabStatuses[title]}
                  </Pill>
                  <SecondaryButton icon="check" onClick={() => nextCollabStatus(title)}>
                    Update
                  </SecondaryButton>
                  <PrimaryButton
                    icon="upload"
                    onClick={() => {
                      routeTo("feed");
                      showToast(`${title} ready in feed`);
                    }}
                  >
                    Publish
                  </PrimaryButton>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  }

  function renderSafety() {
    return (
      <div className="space-y-5">
        <ViewHeader eyebrow="Privacy and safety" title="Controls">
          <label className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={privateAccount}
              onChange={(event) => {
                setPrivateAccount(event.target.checked);
                setSafetyPrefs((current) => ({ ...current, "Private account": event.target.checked }));
                showToast(event.target.checked ? "Private account enabled" : "Private account disabled");
              }}
              className="size-4 accent-slate-950"
            />
            Private account
          </label>
          <PrimaryButton icon="shield" onClick={() => showToast("Safety check complete")}>
            Run check
          </PrimaryButton>
        </ViewHeader>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {safetyTools.map(([title, copy, icon]) => {
            const enabled = title === "Private account" ? privateAccount : safetyPrefs[title];
            return (
              <article key={title} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={cx("grid size-11 shrink-0 place-items-center rounded-2xl", enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}>
                    <Icon name={icon} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black text-slate-950">{title}</h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enabled;
                    if (title === "Private account") setPrivateAccount(next);
                    setSafetyPrefs((current) => ({ ...current, [title]: next }));
                    showToast(`${title} ${next ? "enabled" : "disabled"}`);
                  }}
                  className={cx(
                    "mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full text-sm font-black transition",
                    enabled ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {enabled ? "Enabled" : "Enable"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    );
  }
}
