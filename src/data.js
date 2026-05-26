export const currentUser = {
  name: "Daisy",
  handle: "daisybuilds",
  avatar: "DB",
  bio: "Designer, builder, and weekend host.",
  link: "friends.app/daisy",
  stats: { posts: 218, followers: "86.4K", following: 612 }
};

export const navItems = [
  { id: "feed", label: "Feed", icon: "home" },
  { id: "stories", label: "Stories", icon: "sparkles" },
  { id: "reels", label: "Reels", icon: "play" },
  { id: "messages", label: "DMs", icon: "mail" },
  { id: "explore", label: "Explore", icon: "compass" },
  { id: "live", label: "Live", icon: "video" },
  { id: "profile", label: "Profile", icon: "users" },
  { id: "creator", label: "Pro", icon: "analytics" },
  { id: "shop", label: "Shop", icon: "cart" },
  { id: "collab", label: "Collab", icon: "link" },
  { id: "safety", label: "Safety", icon: "shield" }
];

export const stories = [
  {
    id: "friends-app",
    user: "Friends Social Media App",
    avatar: "FA",
    avatarPhoto: "/assets/app-icon.svg",
    expires: "24h",
    title: "Welcome to Friends",
    media: "/assets/app-icon.svg",
    stickers: ["Link", "Music", "Poll"],
    poll: ["Explore", "Create"],
    pollResults: [55, 45],
    highlight: "About"
  },
  {
    id: "happy-sheep",
    user: "Happy Sheep",
    avatar: "HS",
    avatarPhoto: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f411.png",
    expires: "12h",
    title: "Pasture vibes",
    media: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f411.svg",
    stickers: ["Poll", "GIF", "Question"],
    poll: ["Meadow", "Barn"],
    pollResults: [62, 38],
    highlight: "Farm"
  },
  {
    id: "brain-spark",
    user: "Brain Spark",
    avatar: "BS",
    avatarPhoto: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f4a1.png",
    expires: "8h",
    title: "Today's idea",
    media: "https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f4a1.svg",
    stickers: ["Question", "Link", "Music"],
    poll: ["Yes", "Not yet"],
    pollResults: [70, 30],
    highlight: "Ideas"
  }
];

export const posts = [];

export const reels = [];

export const messageThreads = [
  {
    id: "thread-1",
    name: "Launch partners",
    members: "Maya, Eli, Northskin",
    avatar: "LP",
    unread: 3,
    type: "Group",
    messages: [
      ["Maya", "Carousel is approved. Dropping the collab invite now."],
      ["Eli", "Voice note sent with the final reel timing."],
      ["Northskin", "Product tags are ready for review."]
    ]
  },
  {
    id: "thread-2",
    name: "Rin Photo",
    members: "Rin",
    avatar: "RP",
    unread: 0,
    type: "Disappearing",
    messages: [
      ["Rin", "Sending two selects that expire tonight."],
      ["Daisy", "Perfect. I will save the approved one to the board."]
    ]
  },
  {
    id: "thread-3",
    name: "Creator Support",
    members: "Support",
    avatar: "CS",
    unread: 1,
    type: "Priority",
    messages: [
      ["Support", "Your branded content disclosure is ready for a final check."],
      ["Daisy", "Thanks. I will review it from the collab board."]
    ]
  }
];

export const exploreTiles = [
  { title: "Creator desks", meta: "178K posts", image: "https://picsum.photos/seed/explore-desk/1200/800", target: "feed", category: "Posts" },
  { title: "Dance edits", meta: "42K reels", image: "https://picsum.photos/seed/explore-dance/1200/800", target: "reels", category: "Reels" },
  { title: "Refill beauty", meta: "19K shops", image: "https://picsum.photos/seed/explore-shelf/1200/800", target: "shop", category: "Shops" },
  { title: "Live Q&A", meta: "Trending now", image: "https://picsum.photos/seed/explore-live/1200/800", target: "live", category: "Live" },
  { title: "Portland makers", meta: "12K places", image: "https://picsum.photos/seed/explore-portland/1200/800", target: "shop", category: "Places" },
  { title: "Beat sync", meta: "Audio trend", image: "https://picsum.photos/seed/explore-audio/1200/800", target: "reels", category: "Audio" },
  { title: "Film diaries", meta: "31K posts", image: "https://picsum.photos/seed/explore-film/1200/800", target: "feed", category: "Posts" },
  { title: "Bakery week", meta: "Trending now", image: "https://picsum.photos/seed/explore-bake/1200/800", target: "feed", category: "Posts" },
  { title: "Atelier visits", meta: "8.4K reels", image: "https://picsum.photos/seed/explore-clay/1200/800", target: "reels", category: "Reels" },
  { title: "Coast routes", meta: "24K places", image: "https://picsum.photos/seed/explore-coast/1200/800", target: "feed", category: "Places" },
  { title: "Night markets", meta: "9.1K places", image: "https://picsum.photos/seed/explore-night/1200/800", target: "feed", category: "Places" },
  { title: "Indie audio", meta: "Saved by 12K", image: "https://picsum.photos/seed/explore-indie/1200/800", target: "reels", category: "Audio" }
];

export const products = [
  { id: "p1", name: "Hydration Trio", price: "$48", merchant: "Northskin", image: "https://picsum.photos/seed/prod-hydration/900/700", tag: "Best seller", stock: 24 },
  { id: "p2", name: "Studio Creator Kit", price: "$129", merchant: "Maya Creates", image: "https://picsum.photos/seed/prod-creator/900/700", tag: "Creator pick", stock: 8 },
  { id: "p3", name: "Motion Preset Pack", price: "$24", merchant: "Eli Moves", image: "https://picsum.photos/seed/prod-presets/900/700", tag: "Digital", stock: 999 },
  { id: "p4", name: "Sourdough Starter", price: "$18", merchant: "Rye Studio", image: "https://picsum.photos/seed/prod-rye/900/700", tag: "New", stock: 56 },
  { id: "p5", name: "Coast Trail Map", price: "$12", merchant: "June Walks", image: "https://picsum.photos/seed/prod-map/900/700", tag: "Digital", stock: 999 },
  { id: "p6", name: "Hand-thrown Mug", price: "$42", merchant: "Kai Makes", image: "https://picsum.photos/seed/prod-mug/900/700", tag: "Limited", stock: 6 }
];

export const metrics = [
  ["Reach", "1.8M", "+18%"],
  ["Engagement", "9.6%", "+3.2%"],
  ["Follower growth", "12.4K", "+21%"],
  ["Shop taps", "8.2K", "+14%"]
];

export const creatorTools = [
  ["Insights", "Track posts, stories, reels, live, and shop performance.", "analytics", "Open insights"],
  ["Scheduling", "Plan posts, reels, and stories across the content calendar.", "calendar", "Open calendar"],
  ["Promotions", "Turn high-performing posts into ads with audience controls.", "activity", "Boost post"],
  ["Content health", "Review reach, watch time, saves, and follower intent.", "shield", "Review health"]
];

export const collabItems = [
  ["Collab post", "Appears on @maya.creates and @northskin feeds.", "Ready to publish"],
  ["Branded content", "Creator partnership disclosure and approval flow.", "Needs review"],
  ["Revenue share", "Track product taps and partner-attributed sales.", "Active"]
];

export const safetyTools = [
  ["Private account", "Approve followers before they see posts.", "lock"],
  ["Hidden words", "Filter comments and messages with custom terms.", "check"],
  ["Restrict", "Limit interactions without notifying the account.", "shield"],
  ["Block and mute", "Remove accounts or quiet their content.", "close"],
  ["Report", "Send harmful posts, profiles, or messages for review.", "shield"],
  ["Teen supervision", "Shared controls, time limits, and activity summaries.", "users"]
];
