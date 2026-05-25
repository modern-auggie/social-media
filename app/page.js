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
const FOLLOWING_DEFAULTS = ["maya.creates", "northskin"];
const INITIAL_LIKED_POST_IDS = ["post-1"];
const initialMediaIndex = Object.fromEntries(posts.map((post) => [post.id, 0]));
const initialPostComments = Object.fromEntries(posts.map((post) => [post.id, post.comments]));
const initialThreadMessages = Object.fromEntries(messageThreads.map((thread) => [thread.id, thread.messages]));
const initialThreadMeta = Object.fromEntries(messageThreads.map((thread) => [thread.id, { unread: thread.unread }]));
const safetyDefaults = Object.fromEntries(safetyTools.map(([title]) => [title, title === "Private account"]));
const collabDefaults = Object.fromEntries(collabItems.map(([title, , status]) => [title, status]));
const collabApprovalDefaults = Object.fromEntries(collabItems.map(([title]) => [title, false]));
const mediaPresets = [
  { id: "studio", label: "Studio", src: "/assets/creator-studio.png", icon: "camera" },
  { id: "product", label: "Product", src: "/assets/shop-skincare.png", icon: "tag" },
  { id: "motion", label: "Motion", src: "/assets/reel-dance.png", icon: "video" }
];
const hiddenWordDefaults = ["crypto drop", "free followers"];
const MAX_COMPOSER_UPLOADS = 10;

function normalizeCart(value) {
  if (Array.isArray(value)) {
    return value.reduce((next, id) => ({ ...next, [id]: (next[id] || 0) + 1 }), {});
  }
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([id, quantity]) => [id, Math.max(0, Number(quantity) || 0)])
      .filter(([, quantity]) => quantity > 0)
  );
}

function parsePrice(price) {
  return Number(String(price).replace(/[^0-9.]/g, "")) || 0;
}

function normalizeUploads(value) {
  if (Array.isArray(value)) return value.filter((item) => item?.src).slice(0, MAX_COMPOSER_UPLOADS);
  return value?.src ? [value] : [];
}

function uploadAssetLabel(uploads, fallback) {
  if (!uploads.length) return fallback;
  return uploads.length === 1 ? uploads[0].name : `${uploads.length} uploaded photos`;
}

function localActionCount(active) {
  return active ? 1 : 0;
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value) {
  if (typeof value === "string") return value;
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(value > 9999 ? 0 : 1)}K`;
}

function Avatar({ label, imageSrc, size = "md", active = false }) {
  const sizes = {
    sm: "size-8 text-[0.7rem]",
    md: "size-10 text-xs",
    lg: "size-14 text-sm",
    xl: "size-20 text-lg"
  };

  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-full bg-stone-100 font-medium text-stone-700",
        sizes[size],
        active && "ring-2 ring-stone-900 ring-offset-2 ring-offset-white"
      )}
      aria-hidden="true"
    >
      {imageSrc ? <img src={imageSrc} alt="" className="size-full rounded-full object-cover" /> : label}
    </span>
  );
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    info: "bg-blue-50 text-blue-700",
    warn: "bg-amber-50 text-amber-800",
    success: "bg-emerald-50 text-emerald-700",
    danger: "bg-red-50 text-red-700",
    dark: "bg-stone-900 text-white"
  };
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
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
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition",
        "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
        active && "border-stone-900 bg-stone-900 text-white hover:bg-stone-800 hover:border-stone-900",
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
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-stone-900 px-4 text-sm font-medium text-white transition",
        "hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
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
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 transition",
        "hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900",
        className
      )}
    >
      {icon ? <Icon name={icon} className="size-4 shrink-0" /> : null}
      <span>{children}</span>
    </button>
  );
}

function ViewHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-[28px]">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-stone-600">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

function MediaFrame({ item, children, tall = false }) {
  return (
    <figure className={cx("relative overflow-hidden rounded-md bg-stone-100", tall ? "aspect-[9/14]" : "aspect-[4/3]")}>
      <img className="size-full object-cover" src={item.src} alt={item.alt || ""} loading="lazy" />
      {item.type === "video" ? (
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded bg-stone-900/85 px-2 py-0.5 text-[11px] font-medium text-white">
          <Icon name="play" className="size-3" />
          {item.duration || "Video"}
        </span>
      ) : null}
      {children}
    </figure>
  );
}

function Card({ className = "", children, as: As = "section" }) {
  return (
    <As className={cx("min-w-0 rounded-lg border border-stone-200 bg-white", className)}>
      {children}
    </As>
  );
}

export default function FriendsApp() {
  const [view, setView] = useState("feed");
  const [userProfile, setUserProfile] = useState(currentUser);
  const [profileDraft, setProfileDraft] = useState({
    name: currentUser.name,
    handle: currentUser.handle,
    bio: currentUser.bio,
    link: currentUser.link,
    photo: currentUser.photo || ""
  });
  const [selectedStory, setSelectedStory] = useState(stories[0].id);
  const [selectedThread, setSelectedThread] = useState(messageThreads[0].id);
  const [mediaIndex, setMediaIndex] = useState(initialMediaIndex);
  const [likedPosts, setLikedPosts] = useState(new Set(INITIAL_LIKED_POST_IDS));
  const [repostedPosts, setRepostedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set(["post-2"]));
  const [likedReels, setLikedReels] = useState(new Set(["reel-1"]));
  const [savedReels, setSavedReels] = useState(new Set());
  const [feedMode, setFeedMode] = useState("For You");
  const [privateAccount, setPrivateAccount] = useState(false);
  const [vanishMode, setVanishMode] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerMode, setComposerMode] = useState("Photo");
  const [composerAsset, setComposerAsset] = useState("studio");
  const [composerUploads, setComposerUploads] = useState([]);
  const [composerAudience, setComposerAudience] = useState("Close friends");
  const [composerLocation, setComposerLocation] = useState("Shared from Friends");
  const [draftPosts, setDraftPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [postComments, setPostComments] = useState(initialPostComments);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [exploreFilter, setExploreFilter] = useState("All");
  const [pollVotes, setPollVotes] = useState({});
  const [followed, setFollowed] = useState(new Set(FOLLOWING_DEFAULTS));
  const [threadMessages, setThreadMessages] = useState(initialThreadMessages);
  const [threadMeta, setThreadMeta] = useState(initialThreadMeta);
  const [messageSearch, setMessageSearch] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState(new Set(["p1"]));
  const [isLive, setIsLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState("Studio launch Q&A");
  const [liveReaction, setLiveReaction] = useState("");
  const [liveComments, setLiveComments] = useState([
    ["@rinphoto", "How do you keep audio clean?"],
    ["@northskin", "Product demo is ready when you are."],
    ["@eli.moves", "Bring me on after the intro."]
  ]);
  const [liveDraft, setLiveDraft] = useState("");
  const [activeCreatorTool, setActiveCreatorTool] = useState("Insights");
  const [collabStatuses, setCollabStatuses] = useState(collabDefaults);
  const [collabApprovals, setCollabApprovals] = useState(collabApprovalDefaults);
  const [safetyPrefs, setSafetyPrefs] = useState(safetyDefaults);
  const [hiddenWords, setHiddenWords] = useState(hiddenWordDefaults);
  const [hiddenWordDraft, setHiddenWordDraft] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const allPosts = useMemo(() => [...draftPosts, ...posts], [draftPosts]);
  const activeMediaPreset = mediaPresets.find((item) => item.id === composerAsset) || mediaPresets[0];
  const composerPreview = composerMode === "Reel"
    ? { src: "/assets/reel-dance.png", label: "Reel preview" }
    : composerUploads[0] || activeMediaPreset;
  const profileStats = {
    ...userProfile.stats,
    posts: Number(userProfile.stats.posts || 0) + draftPosts.length
  };
  const visibleFeedPosts = allPosts.filter((post) => {
    if (feedMode === "Following") return followed.has(post.author) || post.author === userProfile.handle;
    if (feedMode === "Saved") return savedPosts.has(post.id);
    return true;
  });
  const selectedStoryData = stories.find((story) => story.id === selectedStory) || stories[0];
  const selectedThreadData = messageThreads.find((thread) => thread.id === selectedThread) || messageThreads[0];
  const selectedMessages = threadMessages[selectedThreadData.id] || selectedThreadData.messages;
  const filteredThreads = messageThreads.filter((thread) => {
    const haystack = [
      thread.name,
      thread.members,
      thread.type,
      ...(threadMessages[thread.id] || thread.messages).flat()
    ].join(" ").toLowerCase();
    return haystack.includes(messageSearch.toLowerCase());
  });
  const cartItems = products
    .map((product) => ({ product, quantity: cart[product.id] || 0 }))
    .filter((item) => item.quantity > 0);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + parsePrice(item.product.price) * item.quantity, 0);
  const filteredExplore = exploreTiles.filter((tile) => {
    const matchesSearch = [tile.title, tile.meta, tile.category].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = exploreFilter === "All" || tile.category === exploreFilter;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const saved = platform.storage.read(STORAGE_KEY, {});
    const savedProfile = { ...currentUser, ...(saved.userProfile || {}) };
    setUserProfile(savedProfile);
    setProfileDraft({
      name: savedProfile.name,
      handle: savedProfile.handle,
      bio: savedProfile.bio,
      link: savedProfile.link,
      photo: savedProfile.photo || ""
    });
    setLikedPosts(new Set(saved.likedPosts || INITIAL_LIKED_POST_IDS));
    setRepostedPosts(new Set(saved.repostedPosts || []));
    setSavedPosts(new Set(saved.savedPosts || ["post-2"]));
    setLikedReels(new Set(saved.likedReels || ["reel-1"]));
    setSavedReels(new Set(saved.savedReels || []));
    setFeedMode(saved.feedMode || "For You");
    setPrivateAccount(saved.privateAccount ?? false);
    setVanishMode(saved.vanishMode ?? true);
    setComposerText(saved.composerText || "");
    setComposerMode(saved.composerMode || "Photo");
    setComposerAsset(saved.composerAsset || "studio");
    setComposerUploads(normalizeUploads(saved.composerUploads || saved.composerUpload));
    setComposerAudience(saved.composerAudience || "Close friends");
    setComposerLocation(saved.composerLocation || "Shared from Friends");
    setDraftPosts(saved.draftPosts || []);
    setScheduledPosts(saved.scheduledPosts || []);
    setSavedDrafts(saved.savedDrafts || []);
    setPostComments({ ...initialPostComments, ...(saved.postComments || {}) });
    setPollVotes(saved.pollVotes || {});
    setFollowed(new Set(saved.followed || FOLLOWING_DEFAULTS));
    setThreadMessages({ ...initialThreadMessages, ...(saved.threadMessages || {}) });
    setThreadMeta({ ...initialThreadMeta, ...(saved.threadMeta || {}) });
    setWishlist(new Set(saved.wishlist || ["p1"]));
    setCart(normalizeCart(saved.cart));
    setLiveTitle(saved.liveTitle || "Studio launch Q&A");
    setCollabStatuses({ ...collabDefaults, ...(saved.collabStatuses || {}) });
    setCollabApprovals({ ...collabApprovalDefaults, ...(saved.collabApprovals || {}) });
    setHiddenWords(saved.hiddenWords || hiddenWordDefaults);
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
      userProfile,
      likedPosts: [...likedPosts],
      repostedPosts: [...repostedPosts],
      savedPosts: [...savedPosts],
      likedReels: [...likedReels],
      savedReels: [...savedReels],
      feedMode,
      privateAccount,
      vanishMode,
      composerText,
      composerMode,
      composerAsset,
      composerUploads,
      composerAudience,
      composerLocation,
      draftPosts,
      scheduledPosts,
      savedDrafts,
      postComments,
      pollVotes,
      followed: [...followed],
      threadMessages,
      threadMeta,
      wishlist: [...wishlist],
      cart,
      liveTitle,
      collabStatuses,
      collabApprovals,
      safetyPrefs,
      hiddenWords
    });
  }, [
    cart,
    collabApprovals,
    collabStatuses,
    composerAsset,
    composerAudience,
    composerLocation,
    composerMode,
    composerText,
    composerUploads,
    draftPosts,
    feedMode,
    followed,
    hiddenWords,
    hydrated,
    likedPosts,
    likedReels,
    liveTitle,
    pollVotes,
    postComments,
    privateAccount,
    repostedPosts,
    safetyPrefs,
    savedDrafts,
    savedPosts,
    savedReels,
    scheduledPosts,
    threadMessages,
    threadMeta,
    userProfile,
    vanishMode,
    wishlist
  ]);

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

  async function readImageSelection(event, options) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return null;

    try {
      const src = await platform.files.readImage(file, options);
      return {
        src,
        name: file.name.replace(/\.[^.]+$/, "") || "Uploaded image",
        type: file.type,
        uploadedAt: Date.now()
      };
    } catch {
      showToast("Choose a valid image file");
      return null;
    }
  }

  async function handleComposerImageChange(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    try {
      const imageFiles = files.filter((file) => file.type?.startsWith("image/"));
      if (!imageFiles.length) {
        showToast("Choose valid image files");
        return;
      }

      const availableSlots = Math.max(0, MAX_COMPOSER_UPLOADS - composerUploads.length);
      if (!availableSlots) {
        showToast(`You can attach up to ${MAX_COMPOSER_UPLOADS} photos`);
        return;
      }

      const selectedFiles = imageFiles.slice(0, availableSlots);
      const sources = await platform.files.readImages(selectedFiles, { maxDimension: 1600, quality: 0.84 });
      const uploads = sources.map((src, index) => ({
        src,
        name: selectedFiles[index].name.replace(/\.[^.]+$/, "") || `Uploaded image ${index + 1}`,
        type: selectedFiles[index].type,
        uploadedAt: Date.now() + index
      }));
      setComposerUploads((current) => [...current, ...uploads].slice(0, MAX_COMPOSER_UPLOADS));
      setComposerMode("Photo");
      setComposerOpen(true);
      showToast(`${uploads.length} photo${uploads.length === 1 ? "" : "s"} ready to post`);
    } catch {
      showToast("Choose valid image files");
    }
  }

  async function handleProfilePhotoChange(event) {
    const upload = await readImageSelection(event, { maxDimension: 720, quality: 0.9 });
    if (!upload) return;
    setProfileDraft((current) => ({ ...current, photo: upload.src }));
    setEditingProfile(true);
    showToast("Profile picture ready");
  }

  function removeComposerUpload(uploadedAt) {
    setComposerUploads((current) => current.filter((upload) => upload.uploadedAt !== uploadedAt));
  }

  function moveComposerUpload(uploadedAt, direction) {
    setComposerUploads((current) => {
      const index = current.findIndex((upload) => upload.uploadedAt === uploadedAt);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  }

  function resetComposer() {
    setComposerText("");
    setComposerUploads([]);
    setComposerLocation("Shared from Friends");
    setComposerAudience("Close friends");
    setComposerOpen(false);
  }

  function buildLocalPost(caption) {
    const isReel = composerMode === "Reel";
    const media = isReel
      ? [{ type: "video", src: "/assets/reel-dance.png", alt: `${composerMode} preview`, duration: "0:12" }]
      : (composerUploads.length ? composerUploads : [activeMediaPreset]).map((image) => ({
          type: "photo",
          src: image.src,
          alt: image.name || image.label || `${composerMode} preview`
        }));
    return {
      id: `draft-${Date.now()}`,
      author: userProfile.handle,
      avatar: userProfile.avatar,
      avatarImage: userProfile.photo || "",
      location: composerLocation.trim() || "Shared from Friends",
      published: "now",
      type: !isReel && media.length > 1 ? "carousel" : composerMode.toLowerCase(),
      media,
      caption: caption || "A fresh update from Daisy.",
      hashtags: caption.match(/#[\w]+/g) || ["#friends"],
      tags: caption.match(/@[\w.]+/g) || [],
      audience: composerAudience,
      stats: { likes: 0, comments: 0, saves: 0, shares: 0 },
      comments: []
    };
  }

  function publishPost() {
    const caption = composerText.trim();
    const newPost = buildLocalPost(caption);
    setDraftPosts((current) => [newPost, ...current]);
    setMediaIndex((current) => ({ ...current, [newPost.id]: 0 }));
    setPostComments((current) => ({ ...current, [newPost.id]: [] }));
    resetComposer();
    showToast(`${composerMode} published to ${composerAudience.toLowerCase()}`);
  }

  function schedulePost() {
    const caption = composerText.trim();
    if (!caption) {
      showToast("Write a caption before scheduling");
      setComposerOpen(true);
      return;
    }
    const scheduledAt = new Date(Date.now() + 36 * 60 * 60 * 1000);
    setScheduledPosts((current) => [
      {
        id: `scheduled-${Date.now()}`,
        mode: composerMode,
        caption,
        asset: uploadAssetLabel(composerUploads, activeMediaPreset.label),
        uploads: composerUploads,
        audience: composerAudience,
        location: composerLocation,
        scheduledFor: scheduledAt.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
        })
      },
      ...current
    ]);
    resetComposer();
    setActiveCreatorTool("Scheduling");
    showToast("Post scheduled for tomorrow");
  }

  function saveComposerDraft() {
    const caption = composerText.trim();
    if (!caption) {
      showToast("Write something before saving a draft");
      setComposerOpen(true);
      return;
    }
    setSavedDrafts((current) => [
      {
        id: `saved-draft-${Date.now()}`,
        mode: composerMode,
        caption,
        asset: uploadAssetLabel(composerUploads, activeMediaPreset.label),
        uploads: composerUploads,
        audience: composerAudience,
        location: composerLocation
      },
      ...current
    ]);
    resetComposer();
    showToast("Draft saved");
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
    await platform.copy(`https://${userProfile.link}`);
    showToast("Profile link copied");
  }

  function cleanHandle(value) {
    return value.trim().replace(/^@+/, "").toLowerCase().replace(/[^a-z0-9._]/g, "");
  }

  function saveProfile() {
    const handle = cleanHandle(profileDraft.handle || "");
    if (handle.length < 3) {
      showToast("Username needs at least 3 characters");
      return;
    }

    const previousHandle = userProfile.handle;
    const cleanedLink = profileDraft.link.trim().replace(/^https?:\/\//, "");
    const linkShouldFollowHandle = !cleanedLink || cleanedLink === userProfile.link || cleanedLink === `friends.app/${previousHandle}`;
    const nextProfile = {
      ...userProfile,
      name: profileDraft.name.trim() || currentUser.name,
      handle,
      bio: profileDraft.bio.trim() || currentUser.bio,
      link: linkShouldFollowHandle ? `friends.app/${handle}` : cleanedLink,
      photo: profileDraft.photo || ""
    };
    setUserProfile(nextProfile);
    setDraftPosts((current) => current.map((post) => (
      post.author === previousHandle ? { ...post, author: handle } : post
    )));
    setEditingProfile(false);
    showToast("Profile changes saved");
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
      [selectedThreadData.id]: [...(current[selectedThreadData.id] || []), [userProfile.name, text]]
    }));
    setThreadMeta((current) => ({
      ...current,
      [selectedThreadData.id]: { ...(current[selectedThreadData.id] || {}), unread: 0 }
    }));
    setMessageDraft("");
    showToast("Message sent");
  }

  function selectThread(threadId) {
    setSelectedThread(threadId);
    setThreadMeta((current) => ({
      ...current,
      [threadId]: { ...(current[threadId] || {}), unread: 0 }
    }));
  }

  function submitComment(event, post) {
    event.preventDefault();
    const text = (commentDrafts[post.id] || "").trim();
    if (!text) {
      showToast("Write a comment first");
      return;
    }
    setPostComments((current) => ({
      ...current,
      [post.id]: [...(current[post.id] || post.comments || []), `${userProfile.name}: ${text}`]
    }));
    setCommentDrafts((current) => ({ ...current, [post.id]: "" }));
    showToast("Comment added");
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
    setCart((current) => {
      const nextQuantity = Math.min((current[product.id] || 0) + 1, product.stock);
      return { ...current, [product.id]: nextQuantity };
    });
    showToast(`${product.name} added to cart`);
  }

  function updateCart(productId, quantity) {
    setCart((current) => {
      const product = products.find((item) => item.id === productId);
      const nextQuantity = Math.max(0, Math.min(quantity, product?.stock || quantity));
      const next = { ...current };
      if (nextQuantity) next[productId] = nextQuantity;
      else delete next[productId];
      return next;
    });
  }

  function nextCollabStatus(title) {
    const order = ["Needs review", "Ready to publish", "Active", "Complete"];
    setCollabStatuses((current) => {
      const index = order.indexOf(current[title]);
      return { ...current, [title]: order[(index + 1) % order.length] };
    });
    showToast(`${title} status updated`);
  }

  function addHiddenWord(event) {
    event.preventDefault();
    const term = hiddenWordDraft.trim();
    if (!term) return;
    setHiddenWords((current) => (current.includes(term) ? current : [term, ...current]));
    setSafetyPrefs((current) => ({ ...current, "Hidden words": true }));
    setHiddenWordDraft("");
    showToast("Hidden word added");
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
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-6 px-6">
          <button
            type="button"
            onClick={() => routeTo("feed")}
            className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-stone-900"
          >
            <span className="grid size-7 place-items-center rounded-md bg-stone-900 text-white">
              <Icon name="wink" className="size-4" />
            </span>
            Friends
          </button>

          <form
            className="hidden h-9 max-w-md flex-1 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 md:flex"
            onSubmit={(event) => {
              event.preventDefault();
              routeTo("explore");
              showToast(search ? `Searching for ${search}` : "Showing Explore");
            }}
          >
            <Icon name="search" className="size-4 shrink-0 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              placeholder="Search"
              aria-label="Search"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <SecondaryButton icon="plus" onClick={() => openComposer("Photo")}>
              Create
            </SecondaryButton>
            <button
              type="button"
              onClick={() => routeTo("profile")}
              className="flex items-center"
              aria-label="Open profile"
            >
              <Avatar label={userProfile.avatar} imageSrc={userProfile.photo} size="sm" />
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-stone-200 bg-white lg:hidden" aria-label="Primary mobile">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap gap-1 px-4 py-2 sm:px-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => routeTo(item.id)}
              className={cx(
                "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition",
                view === item.id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              <Icon name={item.icon} className="size-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-[1280px] gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-52 shrink-0 flex-col lg:flex">
          <nav className="grid gap-0.5" aria-label="Primary">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => routeTo(item.id)}
                className={cx(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                  view === item.id
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                <Icon name={item.icon} className="size-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Signed in</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar label={userProfile.avatar} imageSrc={userProfile.photo} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">{userProfile.name}</p>
                <p className="truncate text-xs text-stone-500">@{userProfile.handle}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section aria-live="polite">
            {(views[view] || renderFeed)()}
          </section>
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );

  function renderFeed() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Today" title="Feed" description="Updates from people you follow.">
          <div className="flex rounded-md border border-stone-200 bg-white p-0.5">
            {["For You", "Following", "Saved"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFeedMode(mode)}
                className={cx(
                  "h-8 rounded px-3 text-sm font-medium transition",
                  feedMode === mode ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="flex rounded-md border border-stone-200 bg-white p-0.5">
            {["Photo", "Reel", "Story"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => (mode === "Story" ? routeTo("stories") : openComposer(mode))}
                className={cx(
                  "h-8 rounded px-3 text-sm font-medium transition",
                  composerMode === mode && composerOpen
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </ViewHeader>

        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Stories</p>
          <div className="no-scrollbar mt-3 flex gap-5 overflow-x-auto">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => { setSelectedStory(story.id); routeTo("stories"); }}
                className="flex min-w-[4rem] flex-col items-center gap-2 text-center"
              >
                <Avatar label={story.avatar} active={story.id === selectedStory} />
                <span className="w-full truncate text-xs font-medium text-stone-600">{story.user}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex gap-3">
            <Avatar label={userProfile.avatar} imageSrc={userProfile.photo} />
            <div className="min-w-0 flex-1">
              <textarea
                id="composer-input"
                value={composerText}
                onFocus={() => setComposerOpen(true)}
                onChange={(event) => setComposerText(event.target.value)}
                rows={composerOpen ? 3 : 1}
                className="w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-900"
                placeholder="Share something with your friends"
              />
              {composerOpen ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                        Audience
                        <select
                          value={composerAudience}
                          onChange={(event) => setComposerAudience(event.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-stone-800 outline-none focus:border-stone-900"
                        >
                          {["Close friends", "Followers", "Public", "Collaborators"].map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                        Location
                        <input
                          value={composerLocation}
                          onChange={(event) => setComposerLocation(event.target.value)}
                          className="mt-1 h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-stone-800 outline-none focus:border-stone-900"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mediaPresets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setComposerAsset(preset.id);
                            setComposerUploads([]);
                          }}
                          className={cx(
                            "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition",
                            composerAsset === preset.id && !composerUploads.length
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                          )}
                        >
                          <Icon name={preset.icon} className="size-3.5" />
                          {preset.label}
                        </button>
                      ))}
                      {composerUploads.length ? (
                        <button
                          type="button"
                          onClick={() => setComposerUploads([])}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
                        >
                          <Icon name="close" className="size-3.5" />
                          Clear uploads
                        </button>
                      ) : null}
                    </div>
                    {composerUploads.length ? (
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {composerUploads.map((upload, index) => (
                          <div key={upload.uploadedAt} className="min-w-0 rounded-md border border-stone-200 bg-white p-2">
                            <div className="flex gap-2">
                              <img src={upload.src} alt="" className="size-14 shrink-0 rounded object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-stone-800">{upload.name}</p>
                                <p className="mt-0.5 text-[11px] text-stone-500">Photo {index + 1}</p>
                                <div className="mt-2 flex gap-1">
                                  <IconButton
                                    icon="chevronLeft"
                                    label={`Move ${upload.name} earlier`}
                                    onClick={() => moveComposerUpload(upload.uploadedAt, -1)}
                                    className="size-7 px-0"
                                  />
                                  <IconButton
                                    icon="chevronRight"
                                    label={`Move ${upload.name} later`}
                                    onClick={() => moveComposerUpload(upload.uploadedAt, 1)}
                                    className="size-7 px-0"
                                  />
                                  <IconButton
                                    icon="close"
                                    label={`Remove ${upload.name}`}
                                    onClick={() => removeComposerUpload(upload.uploadedAt)}
                                    className="size-7 px-0"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <figure className="overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                    <img
                      src={composerPreview.src}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                    <figcaption className="flex items-center justify-between px-3 py-2 text-xs text-stone-500">
                      <span className="truncate">
                        {composerUploads.length ? uploadAssetLabel(composerUploads, activeMediaPreset.label) : composerPreview.label || `${composerMode} preview`}
                      </span>
                      <span>{composerText.length}/2200</span>
                    </figcaption>
                  </figure>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-600 transition hover:bg-stone-50">
                  <Icon name="upload" className="size-3.5" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleComposerImageChange}
                    className="sr-only"
                    aria-label="Upload photos for post"
                  />
                </label>
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
                      if (label === "Schedule") {
                        schedulePost();
                        return;
                      }
                      if (label === "Tags") setComposerText((text) => `${text}${text.endsWith(" ") || !text ? "" : " "}#`);
                      if (label === "Photo" || label === "Reel") setComposerMode(label);
                      setComposerOpen(true);
                    }}
                    className={cx(
                      "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition",
                      composerMode === label
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    )}
                  >
                    <Icon name={icon} className="size-3.5" />
                    {label}
                  </button>
                ))}
                <SecondaryButton icon="bookmark" onClick={saveComposerDraft}>
                  Save draft
                </SecondaryButton>
                <PrimaryButton icon="upload" onClick={publishPost} className="ml-auto">
                  Publish
                </PrimaryButton>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {visibleFeedPosts.map((post) => renderPost(post))}
        </div>
        {visibleFeedPosts.length === 0 ? (
          <Card className="p-10 text-center">
            <h2 className="text-base font-semibold text-stone-900">Nothing here yet</h2>
            <p className="mt-1 text-sm text-stone-500">Try another feed filter or save a post to build this view.</p>
          </Card>
        ) : null}
      </div>
    );
  }

  function renderPost(post) {
    const index = mediaIndex[post.id] || 0;
    const currentMedia = post.media[index] || post.media[0];
    const liked = likedPosts.has(post.id);
    const reposted = repostedPosts.has(post.id);
    const saved = savedPosts.has(post.id);
    const following = followed.has(post.author);
    const comments = postComments[post.id] || post.comments || [];
    const commentDraft = commentDrafts[post.id] || "";
    const avatarImage = post.author === userProfile.handle ? userProfile.photo : post.avatarImage;
    const likeCount = localActionCount(liked);
    const repostCount = localActionCount(reposted);
    const commentCount = comments.length;

    return (
      <Card as="article" key={post.id}>
        <header className="flex items-center gap-3 px-5 py-4">
          <Avatar label={post.avatar} imageSrc={avatarImage} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <strong className="truncate text-sm font-semibold text-stone-900">{post.author}</strong>
              <span className="text-xs text-stone-500">{post.published}</span>
            </div>
            <span className="block truncate text-xs text-stone-500">
              {post.location}
              {post.audience ? ` · ${post.audience}` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleSet(setFollowed, post.author, following ? `Unfollowed ${post.author}` : `Following ${post.author}`)}
            className={cx(
              "h-8 rounded-md px-3 text-xs font-medium transition",
              following ? "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50" : "bg-stone-900 text-white hover:bg-stone-800"
            )}
          >
            {following ? "Following" : "Follow"}
          </button>
        </header>

        <div className="px-5">
          <MediaFrame item={currentMedia}>
            {post.media.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => cycleMedia(post.id, -1)}
                  className="absolute left-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-stone-900 shadow-sm transition hover:bg-white"
                  aria-label="Previous media"
                >
                  <Icon name="chevronLeft" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => cycleMedia(post.id, 1)}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-stone-900 shadow-sm transition hover:bg-white"
                  aria-label="Next media"
                >
                  <Icon name="chevronRight" className="size-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-stone-900/70 px-2 py-1">
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
                className="absolute bottom-3 left-3 inline-flex h-8 items-center gap-1.5 rounded-md bg-white/95 px-2.5 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white"
              >
                <Icon name="tag" className="size-3.5" />
                {post.product.name} · {post.product.price}
              </button>
            ) : null}
          </MediaFrame>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              icon="heart"
              label={liked ? "Unlike post" : "Like post"}
              active={liked}
              onClick={() => toggleSet(setLikedPosts, post.id, liked ? "Like removed" : "Post liked")}
            >
              {formatNumber(likeCount)}
            </IconButton>
            <IconButton
              icon="send"
              label={reposted ? "Undo repost" : "Repost post"}
              active={reposted}
              onClick={() => toggleSet(setRepostedPosts, post.id, reposted ? "Repost removed" : "Post reposted")}
            >
              {formatNumber(repostCount)}
            </IconButton>
            <IconButton icon="comment" label="View comments" onClick={() => showToast(`${commentCount} comments`)}>
              {formatNumber(commentCount)}
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

        <div className="space-y-3 px-5 pb-5">
          <p className="text-sm leading-6 text-stone-700">
            <strong className="font-semibold text-stone-900">{post.author}</strong> {post.caption}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[...post.hashtags, ...post.tags].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearch(tag.replace("#", ""));
                  routeTo("explore");
                }}
                className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 transition hover:bg-stone-200"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="space-y-2 border-t border-stone-100 pt-3">
            {comments.map((comment, commentIndex) => (
              <p key={`${post.id}-comment-${commentIndex}`} className="text-sm leading-6 text-stone-600">
                {comment}
              </p>
            ))}
            <form className="flex gap-2 pt-1" onSubmit={(event) => submitComment(event, post)}>
              <input
                value={commentDraft}
                onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                className="h-9 min-w-0 flex-1 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-stone-900"
                placeholder="Add a real comment"
                aria-label={`Comment on ${post.author} post`}
              />
              <PrimaryButton icon="send" type="submit" className="size-9 px-0">
                <span className="sr-only">Comment</span>
              </PrimaryButton>
            </form>
          </div>
        </div>
      </Card>
    );
  }

  function renderStories() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="24 hours" title="Stories">
          <PrimaryButton icon="plus" onClick={() => openComposer("Story")}>
            Create story
          </PrimaryButton>
        </ViewHeader>

        <Card className="p-4">
          <div className="no-scrollbar flex gap-3 overflow-x-auto">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => setSelectedStory(story.id)}
                className={cx(
                  "flex min-w-24 flex-col items-center gap-2 rounded-md p-3 text-center transition",
                  story.id === selectedStoryData.id ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
                )}
              >
                <Avatar label={story.avatar} active={story.id === selectedStoryData.id} />
                <span className="max-w-24 truncate text-xs font-medium">{story.user}</span>
              </button>
            ))}
          </div>
        </Card>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-900">
            <img className="h-[min(72vh,720px)] min-h-[500px] w-full object-cover" src={selectedStoryData.media} alt={selectedStoryData.title} />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar label={selectedStoryData.avatar} size="sm" />
                  <div>
                    <strong className="block text-sm font-semibold text-white">{selectedStoryData.user}</strong>
                    <span className="text-xs text-white/70">{selectedStoryData.expires} left</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => routeTo("feed")}
                  aria-label="Close stories"
                  className="grid size-9 place-items-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Icon name="close" className="size-4" />
                </button>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <h2 className="text-2xl font-semibold tracking-tight text-white">{selectedStoryData.title}</h2>
              <p className="mt-1.5 max-w-xl text-sm text-white/75">{selectedStoryData.highlight}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-stone-900">Story tools</h2>
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
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 bg-white text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    <Icon name={item === "Music" ? "music" : item === "Link" ? "link" : "sparkles"} className="size-4" />
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-stone-900">Poll</h2>
                <Pill tone={pollVotes[selectedStoryData.id] ? "success" : "warn"}>
                  {pollVotes[selectedStoryData.id] ? "Voted" : "Open"}
                </Pill>
              </div>
              <div className="mt-3 space-y-2">
                {selectedStoryData.poll.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => voteStory(option)}
                    className={cx(
                      "flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm font-medium transition",
                      pollVotes[selectedStoryData.id] === option
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    <span>{option}</span>
                    <span className="text-xs">{selectedStoryData.pollResults[index]}%</span>
                  </button>
                ))}
              </div>
            </Card>

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
      <div className="space-y-8">
        <ViewHeader eyebrow="Video" title="Reels">
          <SecondaryButton icon="music" onClick={() => showToast("Music browser opened")}>
            Music
          </SecondaryButton>
          <PrimaryButton icon="video" onClick={() => openComposer("Reel")}>
            New reel
          </PrimaryButton>
        </ViewHeader>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reels.map((reel) => {
            const liked = likedReels.has(reel.id);
            const saved = savedReels.has(reel.id);
            return (
              <Card as="article" key={reel.id} className="overflow-hidden">
                <MediaFrame item={{ src: reel.src, alt: reel.title, type: "video", duration: "0:20" }} tall>
                  <button
                    type="button"
                    onClick={() => showToast(`Playing ${reel.title}`)}
                    className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-stone-900 shadow-sm transition hover:bg-white"
                    aria-label={`Play ${reel.title}`}
                  >
                    <Icon name="play" className="size-5 translate-x-0.5" />
                  </button>
                </MediaFrame>
                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar label={reel.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-stone-900">{reel.author}</strong>
                      <span className="block truncate text-xs text-stone-500">{reel.audio}</span>
                    </div>
                  </div>
                  <h2 className="text-base font-semibold tracking-tight text-stone-900">{reel.title}</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {reel.effects.map((effect) => (
                      <button
                        key={effect}
                        type="button"
                        onClick={() => {
                          setActiveCreatorTool("Content health");
                          routeTo("creator");
                          showToast(`${effect} opened in creator tools`);
                        }}
                        className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 transition hover:bg-stone-200"
                      >
                        {effect}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <IconButton
                      icon="heart"
                      label={liked ? "Unlike reel" : "Like reel"}
                      active={liked}
                      onClick={() => toggleSet(setLikedReels, reel.id, liked ? "Reel unliked" : "Reel liked")}
                    >
                      {reel.stats.likes}
                    </IconButton>
                    <IconButton icon="bookmark" label={saved ? "Unsave reel" : "Save reel"} active={saved} onClick={() => toggleSet(setSavedReels, reel.id, saved ? "Reel removed" : "Reel saved")} />
                    <IconButton icon="send" label="Share reel" onClick={() => sharePost({ caption: reel.title })} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMessages() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Conversations" title="Messages">
          <label className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={vanishMode}
              onChange={(event) => {
                setVanishMode(event.target.checked);
                showToast(event.target.checked ? "Disappearing mode on" : "Disappearing mode off");
              }}
              className="size-3.5 accent-stone-900"
            />
            Disappearing
          </label>
        </ViewHeader>

        <Card className="grid min-w-0 overflow-hidden lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="min-w-0 border-b border-stone-200 lg:border-b-0 lg:border-r">
            <div className="border-b border-stone-100 p-2">
              <label className="flex h-9 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3">
                <Icon name="search" className="size-4 shrink-0 text-stone-400" />
                <input
                  value={messageSearch}
                  onChange={(event) => setMessageSearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
                  placeholder="Search messages"
                  aria-label="Search messages"
                />
              </label>
            </div>
            <div className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto p-2 lg:grid lg:gap-0.5 lg:overflow-visible lg:p-2">
              {filteredThreads.map((thread) => {
                const messages = threadMessages[thread.id] || thread.messages;
                const lastMessage = messages[messages.length - 1]?.[1] || thread.members;
                const unread = threadMeta[thread.id]?.unread || 0;
                return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => selectThread(thread.id)}
                  className={cx(
                    "flex min-w-64 items-center gap-3 rounded-md p-2.5 text-left transition lg:min-w-0",
                    thread.id === selectedThreadData.id ? "bg-stone-100" : "hover:bg-stone-50"
                  )}
                >
                  <Avatar label={thread.avatar} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-stone-900">{thread.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {thread.type} · {lastMessage}
                    </span>
                  </span>
                  {unread ? <span className="grid size-5 place-items-center rounded-full bg-stone-900 text-[10px] font-medium text-white">{unread}</span> : null}
                </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[560px] min-w-0 flex-col">
            <header className="flex items-center gap-3 border-b border-stone-200 px-5 py-3">
              <Avatar label={selectedThreadData.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-stone-900">{selectedThreadData.name}</strong>
                <span className="block truncate text-xs text-stone-500">{selectedThreadData.members}</span>
              </div>
              <div className="flex gap-1.5">
                <IconButton icon="mic" label="Record voice message" onClick={() => showToast("Voice note recorded")} className="size-9 px-0" />
                <IconButton icon="camera" label="Send media" onClick={() => openComposer("Photo")} className="size-9 px-0" />
                <IconButton icon="users" label="Group settings" onClick={() => routeTo("collab")} className="size-9 px-0" />
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-5">
              {selectedMessages.map(([person, message], index) => {
                const fromSelf = person === "Daisy" || person === userProfile.name;
                return (
                  <div
                    key={`${person}-${message}-${index}`}
                    className={cx("flex", fromSelf ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cx(
                        "max-w-[78%] rounded-lg px-3.5 py-2 text-sm leading-6",
                        fromSelf ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-900"
                      )}
                    >
                      <strong className={cx("mb-0.5 block text-[11px] font-medium", fromSelf ? "text-white/70" : "text-stone-500")}>{person}</strong>
                      {message}
                    </div>
                  </div>
                );
              })}
            </div>

            <form className="flex items-center gap-2 border-t border-stone-200 p-3" onSubmit={sendMessage}>
              <input
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-stone-900"
                placeholder="Write a message"
                aria-label="Message"
              />
              <PrimaryButton icon="send" type="submit" className="size-10 px-0">
                <span className="sr-only">Send</span>
              </PrimaryButton>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  function renderExplore() {
    const filters = ["All", ...new Set(exploreTiles.map((tile) => tile.category))];

    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Discovery" title="Explore">
          <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-md border border-stone-200 bg-white p-0.5">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setExploreFilter(filter)}
                className={cx(
                  "h-8 shrink-0 rounded px-3 text-sm font-medium transition",
                  exploreFilter === filter ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </ViewHeader>

        <form
          className="flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 md:hidden"
          onSubmit={(event) => event.preventDefault()}
        >
          <Icon name="search" className="size-4 shrink-0 text-stone-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 text-sm text-stone-900 outline-none placeholder:text-stone-400"
            placeholder="Search posts, shops, audio"
            aria-label="Search Explore"
          />
        </form>

        <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExplore.map((tile, index) => (
            <button
              key={tile.title}
              type="button"
              onClick={() => {
                routeTo(tile.target);
                showToast(`${tile.title} opened`);
              }}
              className={cx(
                "group relative overflow-hidden rounded-lg border border-stone-200 bg-stone-900 text-left",
                index % 5 === 0 && "sm:col-span-2"
              )}
            >
              <img className="size-full object-cover opacity-90 transition group-hover:scale-[1.02] group-hover:opacity-100" src={tile.image} alt={tile.title} loading="lazy" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <span className="block text-base font-semibold tracking-tight text-white">{tile.title}</span>
                <span className="mt-0.5 block text-xs text-white/70">{tile.meta}</span>
              </span>
            </button>
          ))}
        </div>

        {filteredExplore.length === 0 ? (
          <Card className="p-10 text-center">
            <h2 className="text-base font-semibold text-stone-900">No matches</h2>
            <p className="mt-1 text-sm text-stone-500">Try another search or reset the filter.</p>
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
          </Card>
        ) : null}
      </div>
    );
  }

  function renderLive() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Broadcast" title="Live Studio">
          <label className="inline-flex h-9 min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700">
            <Icon name="edit" className="size-4 shrink-0" />
            <input
              value={liveTitle}
              onChange={(event) => setLiveTitle(event.target.value)}
              className="min-w-0 bg-transparent text-sm font-normal text-stone-900 outline-none"
              aria-label="Live title"
            />
          </label>
          <Pill tone={isLive ? "danger" : "neutral"}>{isLive ? "On air" : "Preview"}</Pill>
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

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-900">
            <img className="h-[min(72vh,720px)] min-h-[480px] w-full object-cover opacity-90" src="/assets/creator-studio.png" alt="Live studio preview" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Pill tone={isLive ? "danger" : "dark"}>{isLive ? "Live now" : "Preview"}</Pill>
              <Pill tone="dark">2.4K waiting</Pill>
            </div>
            <div className="absolute bottom-4 left-4 right-20 max-w-xl rounded-md bg-black/35 p-4 text-white backdrop-blur">
              <h2 className="text-xl font-semibold tracking-tight">{liveTitle}</h2>
              <p className="mt-1 text-sm text-white/75">Guests, shopping tags, Q&A, and moderation are staged before you go on air.</p>
            </div>
            <div className="absolute bottom-4 right-4 grid gap-2">
              {["heart", "send"].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setLiveReaction(name);
                    if (name === "send") sharePost({ caption: "Join my Friends live" });
                    showToast(`${name} sent`);
                  }}
                  className={cx(
                    "grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20",
                    liveReaction === name && "bg-white text-stone-900"
                  )}
                  aria-label={`${name} reaction`}
                >
                  <Icon name={name} className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <Card as="aside" className="flex min-h-[480px] flex-col">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-stone-900">Q&A and comments</h2>
              <p className="mt-0.5 text-xs text-stone-500">Guest queue and live chat.</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-5">
              {liveComments.map(([person, comment], index) => (
                <p key={`${person}-${comment}-${index}`} className="text-sm leading-6 text-stone-700">
                  <strong className="font-semibold text-stone-900">{person}</strong> {comment}
                </p>
              ))}
            </div>
            <div className="border-t border-stone-200 p-3">
              <SecondaryButton icon="users" onClick={() => routeTo("collab")} className="mb-2 w-full">
                Invite guest
              </SecondaryButton>
              <form className="flex gap-2" onSubmit={sendLiveComment}>
                <input
                  id="live-comment"
                  value={liveDraft}
                  onChange={(event) => setLiveDraft(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-md border border-stone-200 bg-white px-3 text-sm outline-none focus:border-stone-900"
                  placeholder="Add a comment"
                  aria-label="Live comment"
                />
                <PrimaryButton icon="send" type="submit" className="size-10 px-0">
                  <span className="sr-only">Send</span>
                </PrimaryButton>
              </form>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  function renderProfile() {
    return (
      <div className="space-y-8">
        <Card className="overflow-hidden">
          <div className="h-32 bg-stone-100" />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="ring-4 ring-white rounded-full">
                <Avatar label={userProfile.avatar} imageSrc={userProfile.photo} size="xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">@{userProfile.handle}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">{userProfile.name}</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-600">{userProfile.bio}</p>
                <button type="button" onClick={copyProfileLink} className="mt-1 text-sm font-medium text-stone-900 underline-offset-2 hover:underline">
                  {userProfile.link}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <SecondaryButton
                  icon="plus"
                  onClick={() => {
                    setEditingProfile((current) => !current);
                    setProfileDraft({
                      name: userProfile.name,
                      handle: userProfile.handle,
                      bio: userProfile.bio,
                      link: userProfile.link,
                      photo: userProfile.photo || ""
                    });
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

            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-stone-200 pt-5">
              {Object.entries(profileStats).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{key}</dt>
                  <dd className="mt-1 text-xl font-semibold text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>

            {editingProfile ? (
              <div className="mt-5 rounded-md border border-stone-200 bg-stone-50 p-4">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar label={userProfile.avatar} imageSrc={profileDraft.photo} size="lg" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900">Profile picture</p>
                      <p className="text-xs text-stone-500">Use a square image for the cleanest crop.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 transition hover:border-stone-300 hover:bg-stone-50">
                      <Icon name="upload" className="size-4 shrink-0" />
                      Change photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoChange}
                        className="sr-only"
                        aria-label="Change profile picture"
                      />
                    </label>
                    {profileDraft.photo ? (
                      <SecondaryButton
                        icon="close"
                        onClick={() => setProfileDraft((current) => ({ ...current, photo: "" }))}
                      >
                        Remove
                      </SecondaryButton>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Name
                    <input
                      value={profileDraft.name}
                      onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))}
                      className="mt-1 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-stone-800 outline-none focus:border-stone-900"
                    />
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Username
                    <div className="mt-1 flex h-10 rounded-md border border-stone-200 bg-white focus-within:border-stone-900">
                      <span className="grid h-full place-items-center px-3 text-sm font-normal normal-case tracking-normal text-stone-400">@</span>
                      <input
                        value={profileDraft.handle}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, handle: event.target.value }))}
                        className="min-w-0 flex-1 bg-transparent pr-3 text-sm font-normal normal-case tracking-normal text-stone-800 outline-none"
                        aria-label="Username"
                      />
                    </div>
                  </label>
                  <label className="text-xs font-medium uppercase tracking-wider text-stone-500">
                    Link
                    <input
                      value={profileDraft.link}
                      onChange={(event) => setProfileDraft((current) => ({ ...current, link: event.target.value }))}
                      className="mt-1 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-stone-800 outline-none focus:border-stone-900"
                    />
                  </label>
                </div>
                <label className="mt-3 block text-xs font-medium uppercase tracking-wider text-stone-500">
                  Bio
                  <textarea
                    value={profileDraft.bio}
                    onChange={(event) => setProfileDraft((current) => ({ ...current, bio: event.target.value }))}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-normal normal-case leading-6 tracking-normal text-stone-800 outline-none focus:border-stone-900"
                  />
                </label>
                <div className="mt-3 flex justify-end">
                  <PrimaryButton icon="check" onClick={saveProfile}>
                    Save profile
                  </PrimaryButton>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Highlights</p>
          <div className="no-scrollbar flex gap-3 overflow-x-auto">
            {stories.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => {
                  setSelectedStory(story.id);
                  routeTo("stories");
                }}
                className="flex min-w-44 items-center gap-3 rounded-lg border border-stone-200 bg-white p-3 text-left transition hover:bg-stone-50"
              >
                <Avatar label={story.avatar} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-stone-900">{story.highlight}</span>
                  <span className="block truncate text-xs text-stone-500">{story.user}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">Posts</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allPosts.flatMap((post) => post.media.map((item) => ({ ...item, postId: post.id }))).slice(0, 6).map((item, index) => (
              <button
                key={`${item.postId}-${index}`}
                type="button"
                onClick={() => routeTo("feed")}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:border-stone-300"
              >
                <MediaFrame item={item} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderCreator() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Pro" title="Dashboard" description="Performance and creator tools.">
          <SecondaryButton
            icon="upload"
            onClick={async () => {
              await platform.copy(`Reach ${metrics[0][1]}, engagement ${metrics[1][1]}, scheduled ${scheduledPosts.length}`);
              showToast("Insights report copied");
            }}
          >
            Export
          </SecondaryButton>
          <PrimaryButton icon="calendar" onClick={() => openComposer("Photo")}>
            Schedule
          </PrimaryButton>
        </ViewHeader>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, change]) => (
            <Card as="article" key={label} className="p-5">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</span>
              <strong className="mt-2 block text-2xl font-semibold tracking-tight text-stone-900">{value}</strong>
              <small className="font-medium text-emerald-700">{change}</small>
            </Card>
          ))}
        </div>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-stone-900">Publishing queue</h2>
                <p className="mt-1 text-sm text-stone-500">Scheduled posts and saved drafts from the composer.</p>
              </div>
              <Pill tone={scheduledPosts.length ? "info" : "neutral"}>{scheduledPosts.length} scheduled</Pill>
            </div>
            <div className="mt-4 space-y-3">
              {[...scheduledPosts, ...savedDrafts].slice(0, 5).map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-md border border-stone-200 p-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-900">{item.caption}</p>
                    <p className="text-xs text-stone-500">
                      {item.mode} · {item.asset} · {item.scheduledFor || "Draft"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <SecondaryButton
                      icon="calendar"
                      onClick={() => {
                        setComposerText(item.caption);
                        setComposerMode(item.mode);
                        setComposerUploads(normalizeUploads(item.uploads || item.upload));
                        setComposerOpen(true);
                        routeTo("feed");
                      }}
                    >
                      Edit
                    </SecondaryButton>
                    {item.scheduledFor ? <Pill tone="info">Queued</Pill> : <Pill tone="neutral">Draft</Pill>}
                  </div>
                </div>
              ))}
              {scheduledPosts.length === 0 && savedDrafts.length === 0 ? (
                <p className="rounded-md bg-stone-50 p-4 text-sm leading-6 text-stone-600">Use the feed composer to save drafts or schedule a post; they will appear here.</p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold tracking-tight text-stone-900">{activeCreatorTool}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {activeCreatorTool === "Scheduling"
                ? "Plan the next publish window, review drafts, and keep collaborators aligned before posts go live."
                : activeCreatorTool === "Promotions"
                  ? "Boost saved posts with clear goals, audience limits, and budget guardrails."
                  : activeCreatorTool === "Content health"
                    ? "Watch for reach dips, comment quality, saves, and signals that a format is fatiguing followers."
                    : "Track reach, engagement, saves, sales taps, and audience movement across surfaces."}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-stone-50 p-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">Drafts</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-900">{savedDrafts.length}</dd>
              </div>
              <div className="rounded-md bg-stone-50 p-3">
                <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">Queue</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-900">{scheduledPosts.length}</dd>
              </div>
            </dl>
          </Card>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {creatorTools.map(([title, copy, icon, action]) => (
            <Card
              as="article"
              key={title}
              className={cx(
                "p-5 transition",
                activeCreatorTool === title ? "border-stone-900" : ""
              )}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-stone-100 text-stone-700">
                  <Icon name={icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{copy}</p>
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
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderShop() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Commerce" title="Shop">
          <Pill tone="neutral">
            {cartCount} in cart · ${cartSubtotal.toFixed(2)}
          </Pill>
          <PrimaryButton
            icon="cart"
            onClick={() => showToast(cartCount ? "Checkout started" : "Cart is empty")}
          >
            Checkout
          </PrimaryButton>
        </ViewHeader>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => {
              const wished = wishlist.has(product.id);
              const quantity = cart[product.id] || 0;
              return (
                <Card as="article" key={product.id} className="overflow-hidden">
                  <MediaFrame item={{ src: product.image, alt: product.name, type: "photo" }} />
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Pill tone="neutral">{product.tag}</Pill>
                      {quantity ? <Pill tone="success">In cart: {quantity}</Pill> : null}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold tracking-tight text-stone-900">{product.name}</h2>
                        <p className="text-xs text-stone-500">{product.merchant}</p>
                      </div>
                      <strong className="text-base font-semibold text-stone-900">{product.price}</strong>
                    </div>
                    <p className="text-xs text-stone-500">{product.stock === 999 ? "Digital download" : `${product.stock} available`}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <PrimaryButton icon="cart" onClick={() => addToCart(product)}>
                        Add to cart
                      </PrimaryButton>
                      <IconButton
                        icon="bookmark"
                        label={wished ? "Remove from wishlist" : "Save to wishlist"}
                        active={wished}
                        onClick={() => toggleSet(setWishlist, product.id, wished ? "Removed from wishlist" : "Saved to wishlist")}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card as="aside" className="h-fit p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-stone-900">Cart</h2>
              <Pill tone={cartCount ? "success" : "neutral"}>{cartCount} items</Pill>
            </div>
            <div className="mt-4 space-y-3">
              {cartItems.length ? (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3 rounded-md border border-stone-200 p-3">
                    <img src={product.image} alt="" className="size-14 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900">{product.name}</p>
                      <p className="text-xs text-stone-500">{product.price} · {product.merchant}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <IconButton icon="minus" label={`Remove one ${product.name}`} onClick={() => updateCart(product.id, quantity - 1)} className="size-8 px-0" />
                        <span className="grid h-8 min-w-8 place-items-center rounded-md border border-stone-200 px-2 text-xs font-medium">{quantity}</span>
                        <IconButton icon="plus" label={`Add one ${product.name}`} onClick={() => updateCart(product.id, quantity + 1)} className="size-8 px-0" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-stone-50 p-4 text-sm leading-6 text-stone-600">Add products to see quantities, subtotal, and checkout state here.</p>
              )}
            </div>
            <div className="mt-5 border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <strong className="text-stone-900">${cartSubtotal.toFixed(2)}</strong>
              </div>
              <PrimaryButton
                icon="cart"
                onClick={() => showToast(cartCount ? "Checkout flow ready" : "Cart is empty")}
                className="mt-4 w-full"
              >
                Checkout
              </PrimaryButton>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  function renderCollab() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Partners" title="Collaborations">
          <SecondaryButton icon="mail" onClick={() => routeTo("messages")}>
            Message
          </SecondaryButton>
          <PrimaryButton icon="users" onClick={() => routeTo("profile")}>
            Invite
          </PrimaryButton>
        </ViewHeader>

        <div className="space-y-3">
          {collabItems.map(([title, copy]) => (
            <Card as="article" key={title} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-stone-100 text-stone-700">
                  <Icon name="link" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{copy}</p>
                  <label className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-stone-600">
                    <input
                      type="checkbox"
                      checked={collabApprovals[title] || false}
                      onChange={(event) => {
                        setCollabApprovals((current) => ({ ...current, [title]: event.target.checked }));
                        showToast(event.target.checked ? `${title} approved` : `${title} approval removed`);
                      }}
                      className="size-3.5 accent-stone-900"
                    />
                    Partner approval recorded
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill
                    tone={
                      collabStatuses[title] === "Active"
                        ? "success"
                        : collabStatuses[title] === "Needs review"
                          ? "warn"
                          : collabStatuses[title] === "Complete"
                            ? "neutral"
                            : "info"
                    }
                  >
                    {collabStatuses[title]}
                  </Pill>
                  <SecondaryButton icon="check" onClick={() => nextCollabStatus(title)}>
                    Update
                  </SecondaryButton>
                  <PrimaryButton
                    icon="upload"
                    onClick={() => {
                      if (!collabApprovals[title]) {
                        showToast("Record partner approval first");
                        return;
                      }
                      routeTo("feed");
                      showToast(`${title} ready in feed`);
                    }}
                  >
                    Publish
                  </PrimaryButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderSafety() {
    return (
      <div className="space-y-8">
        <ViewHeader eyebrow="Privacy" title="Safety controls">
          <label className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700">
            <input
              type="checkbox"
              checked={privateAccount}
              onChange={(event) => {
                setPrivateAccount(event.target.checked);
                setSafetyPrefs((current) => ({ ...current, "Private account": event.target.checked }));
                showToast(event.target.checked ? "Private account enabled" : "Private account disabled");
              }}
              className="size-3.5 accent-stone-900"
            />
            Private account
          </label>
          <PrimaryButton icon="shield" onClick={() => showToast("Safety check complete")}>
            Run check
          </PrimaryButton>
        </ViewHeader>

        <Card className="p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-stone-900">Hidden words</h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">Terms here are treated as filtered content in comments and messages.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {hiddenWords.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setHiddenWords((current) => current.filter((item) => item !== term));
                      showToast(`${term} removed`);
                    }}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-stone-100 px-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-200"
                  >
                    {term}
                    <Icon name="close" className="size-3" />
                  </button>
                ))}
              </div>
            </div>
            <form className="flex items-end gap-2" onSubmit={addHiddenWord}>
              <label className="min-w-0 flex-1 text-xs font-medium uppercase tracking-wider text-stone-500">
                New term
                <input
                  value={hiddenWordDraft}
                  onChange={(event) => setHiddenWordDraft(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm font-normal normal-case tracking-normal text-stone-800 outline-none focus:border-stone-900"
                  placeholder="Add phrase"
                />
              </label>
              <PrimaryButton icon="plus" type="submit" className="h-10">
                Add
              </PrimaryButton>
            </form>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {safetyTools.map(([title, copy, icon]) => {
            const enabled = title === "Private account" ? privateAccount : safetyPrefs[title];
            return (
              <Card as="article" key={title} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className={cx("grid size-10 shrink-0 place-items-center rounded-md", enabled ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700")}>
                    <Icon name={icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{copy}</p>
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
                    "mt-5 inline-flex h-9 w-full items-center justify-center rounded-md text-sm font-medium transition",
                    enabled ? "bg-stone-900 text-white hover:bg-stone-800" : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  )}
                >
                  {enabled ? "Enabled" : "Enable"}
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
}
