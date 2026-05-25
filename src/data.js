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
    id: "studio-day",
    user: "maya.creates",
    avatar: "MC",
    expires: "4h",
    title: "Studio day",
    media: "/assets/creator-studio.png",
    stickers: ["Poll", "Music", "GIF"],
    poll: ["Desk tour", "Edit bay"],
    pollResults: [54, 46],
    highlight: "Behind the scenes"
  },
  {
    id: "launch-kit",
    user: "northskin",
    avatar: "NS",
    expires: "9h",
    title: "Launch kit",
    media: "/assets/shop-skincare.png",
    stickers: ["Link", "Quiz", "Question"],
    poll: ["Routine", "Ingredients"],
    pollResults: [61, 39],
    highlight: "Products"
  },
  {
    id: "dance-cut",
    user: "eli.moves",
    avatar: "EM",
    expires: "22h",
    title: "New move",
    media: "/assets/reel-dance.png",
    stickers: ["Music", "Countdown", "Questions"],
    poll: ["Tutorial", "Freestyle"],
    pollResults: [67, 33],
    highlight: "Reels"
  }
];

export const posts = [
  {
    id: "post-1",
    author: "maya.creates",
    avatar: "MC",
    location: "Arts District Studio",
    published: "18m",
    type: "carousel",
    media: [
      { type: "photo", src: "/assets/creator-studio.png", alt: "Creator studio desk" },
      { type: "video", src: "/assets/reel-dance.png", alt: "Vertical dance clip", duration: "0:18" },
      { type: "photo", src: "/assets/shop-skincare.png", alt: "Product flat lay" }
    ],
    caption: "A tiny tour of today's production board and all the little details that make a shoot feel alive.",
    hashtags: ["#creatorworkflow", "#studiolife", "#behindthescenes"],
    tags: ["@eli.moves", "@northskin"],
    stats: { likes: 18432, comments: 512, saves: 1390, shares: 248 },
    comments: ["The lighting setup is so clean.", "Need the full desk breakdown."]
  },
  {
    id: "post-2",
    author: "northskin",
    avatar: "NS",
    location: "Portland, OR",
    published: "42m",
    type: "photo",
    media: [{ type: "photo", src: "/assets/shop-skincare.png", alt: "Sustainable skincare product collection" }],
    caption: "A softer morning routine built around refillable packaging and clean shelf space.",
    hashtags: ["#shopsmall", "#sustainableskincare", "#morningroutine"],
    tags: ["@maya.creates"],
    stats: { likes: 9034, comments: 208, saves: 2201, shares: 177 },
    product: { name: "Hydration Trio", price: "$48", merchant: "Northskin" },
    comments: ["That counter styling is perfect.", "Saved this for later."]
  }
];

export const reels = [
  {
    id: "reel-1",
    author: "eli.moves",
    avatar: "EM",
    src: "/assets/reel-dance.png",
    title: "Three beats, one transition",
    audio: "Original audio - Eli Moves",
    effects: ["Speed ramp", "Beat sync", "Auto captions"],
    stats: { plays: "1.2M", likes: "94K", comments: "4.8K" }
  },
  {
    id: "reel-2",
    author: "maya.creates",
    avatar: "MC",
    src: "/assets/creator-studio.png",
    title: "Shoot list in 20 seconds",
    audio: "Soft Focus - Studio Mix",
    effects: ["Template", "Text overlay", "Green screen"],
    stats: { plays: "318K", likes: "22K", comments: "930" }
  },
  {
    id: "reel-3",
    author: "northskin",
    avatar: "NS",
    src: "/assets/shop-skincare.png",
    title: "Refill routine in one shelf",
    audio: "Morning Room - Northskin",
    effects: ["Product tags", "Voiceover", "Saved template"],
    stats: { plays: "411K", likes: "31K", comments: "1.1K" }
  }
];

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
  { title: "Creator desks", meta: "178K posts", image: "/assets/creator-studio.png", target: "feed", category: "Posts" },
  { title: "Dance edits", meta: "42K reels", image: "/assets/reel-dance.png", target: "reels", category: "Reels" },
  { title: "Refill beauty", meta: "19K shops", image: "/assets/shop-skincare.png", target: "shop", category: "Shops" },
  { title: "Live Q&A", meta: "Trending now", image: "/assets/creator-studio.png", target: "live", category: "Live" },
  { title: "Portland makers", meta: "12K places", image: "/assets/shop-skincare.png", target: "shop", category: "Places" },
  { title: "Beat sync", meta: "Audio trend", image: "/assets/reel-dance.png", target: "reels", category: "Audio" }
];

export const products = [
  { id: "p1", name: "Hydration Trio", price: "$48", merchant: "Northskin", image: "/assets/shop-skincare.png", tag: "Best seller", stock: 24 },
  { id: "p2", name: "Studio Creator Kit", price: "$129", merchant: "Maya Creates", image: "/assets/creator-studio.png", tag: "Creator pick", stock: 8 },
  { id: "p3", name: "Motion Preset Pack", price: "$24", merchant: "Eli Moves", image: "/assets/reel-dance.png", tag: "Digital", stock: 999 }
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
