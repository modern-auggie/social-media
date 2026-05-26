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
    media: "https://picsum.photos/seed/maya-studio/900/1400",
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
    media: "https://picsum.photos/seed/northskin-shelf/900/1400",
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
    media: "https://picsum.photos/seed/eli-stage/900/1400",
    stickers: ["Music", "Countdown", "Questions"],
    poll: ["Tutorial", "Freestyle"],
    pollResults: [67, 33],
    highlight: "Reels"
  },
  {
    id: "weekend-bake",
    user: "rye.studio",
    avatar: "RS",
    expires: "11h",
    title: "Weekend bake",
    media: "https://picsum.photos/seed/rye-bake/900/1400",
    stickers: ["Poll", "Question", "GIF"],
    poll: ["Sourdough", "Brioche"],
    pollResults: [72, 28],
    highlight: "Recipes"
  },
  {
    id: "coast-trip",
    user: "june.walks",
    avatar: "JW",
    expires: "15h",
    title: "Coast trip",
    media: "https://picsum.photos/seed/june-coast/900/1400",
    stickers: ["Music", "Link", "Countdown"],
    poll: ["Sunrise", "Sunset"],
    pollResults: [58, 42],
    highlight: "Travel"
  },
  {
    id: "atelier",
    user: "kai.makes",
    avatar: "KM",
    expires: "20h",
    title: "Atelier hours",
    media: "https://picsum.photos/seed/kai-atelier/900/1400",
    stickers: ["Poll", "Music", "Question"],
    poll: ["Wheel", "Glaze"],
    pollResults: [49, 51],
    highlight: "Ceramics"
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
      { type: "photo", src: "https://picsum.photos/seed/maya-desk/1200/900", alt: "Creator studio desk" },
      { type: "photo", src: "https://picsum.photos/seed/maya-light/1200/900", alt: "Studio lighting" },
      { type: "photo", src: "https://picsum.photos/seed/maya-board/1200/900", alt: "Production board" }
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
    type: "carousel",
    media: [
      { type: "photo", src: "https://picsum.photos/seed/skin-flat/1200/900", alt: "Skincare flat lay" },
      { type: "photo", src: "https://picsum.photos/seed/skin-counter/1200/900", alt: "Bathroom counter" }
    ],
    caption: "A softer morning routine built around refillable packaging and clean shelf space.",
    hashtags: ["#shopsmall", "#sustainableskincare", "#morningroutine"],
    tags: ["@maya.creates"],
    stats: { likes: 9034, comments: 208, saves: 2201, shares: 177 },
    product: { name: "Hydration Trio", price: "$48", merchant: "Northskin" },
    comments: ["That counter styling is perfect.", "Saved this for later."]
  },
  {
    id: "post-3",
    author: "june.walks",
    avatar: "JW",
    location: "Big Sur, CA",
    published: "1h",
    type: "carousel",
    media: [
      { type: "photo", src: "https://picsum.photos/seed/coast-1/1200/900", alt: "Coastline at sunrise" },
      { type: "photo", src: "https://picsum.photos/seed/coast-2/1200/900", alt: "Trailhead view" },
      { type: "photo", src: "https://picsum.photos/seed/coast-3/1200/900", alt: "Tidepool details" },
      { type: "photo", src: "https://picsum.photos/seed/coast-4/1200/900", alt: "Roadside diner" }
    ],
    caption: "Slow weekend chasing fog and finding the quietest pull-offs.",
    hashtags: ["#weekendroute", "#california", "#takealongread"],
    tags: ["@kai.makes"],
    stats: { likes: 12410, comments: 318, saves: 980, shares: 132 },
    comments: ["Saving this for next month.", "Which trail is #2?"]
  },
  {
    id: "post-4",
    author: "rye.studio",
    avatar: "RS",
    location: "Brooklyn, NY",
    published: "3h",
    type: "carousel",
    media: [
      { type: "photo", src: "https://picsum.photos/seed/bread-1/1200/900", alt: "Sourdough crumb" },
      { type: "photo", src: "https://picsum.photos/seed/bread-2/1200/900", alt: "Boules cooling" },
      { type: "photo", src: "https://picsum.photos/seed/bread-3/1200/900", alt: "Flour and starter" }
    ],
    caption: "Cold proof was the move. Letting them speak for themselves today.",
    hashtags: ["#sourdough", "#weekendbake", "#crumbshot"],
    tags: ["@northskin"],
    stats: { likes: 7211, comments: 142, saves: 511, shares: 89 },
    comments: ["That ear though.", "Recipe pinned?"]
  },
  {
    id: "post-5",
    author: "kai.makes",
    avatar: "KM",
    location: "Oakland Atelier",
    published: "5h",
    type: "carousel",
    media: [
      { type: "photo", src: "https://picsum.photos/seed/clay-1/1200/900", alt: "Throwing a bowl" },
      { type: "photo", src: "https://picsum.photos/seed/clay-2/1200/900", alt: "Glaze samples" },
      { type: "photo", src: "https://picsum.photos/seed/clay-3/1200/900", alt: "Drying rack" }
    ],
    caption: "Spent the morning chasing one good curve. Found three.",
    hashtags: ["#ceramics", "#studiolife", "#wip"],
    tags: ["@maya.creates"],
    stats: { likes: 5840, comments: 96, saves: 612, shares: 41 },
    comments: ["Need a glaze breakdown.", "Those rims!"]
  },
  {
    id: "post-6",
    author: "rinphoto",
    avatar: "RP",
    location: "Tokyo, JP",
    published: "8h",
    type: "carousel",
    media: [
      { type: "photo", src: "https://picsum.photos/seed/tokyo-1/1200/900", alt: "Neon alley" },
      { type: "photo", src: "https://picsum.photos/seed/tokyo-2/1200/900", alt: "Rain reflection" },
      { type: "photo", src: "https://picsum.photos/seed/tokyo-3/1200/900", alt: "Cafe interior" },
      { type: "photo", src: "https://picsum.photos/seed/tokyo-4/1200/900", alt: "Vending machine" }
    ],
    caption: "Twelve hours of walking, four rolls of film. The city did the rest.",
    hashtags: ["#filmphotography", "#tokyodiaries", "#streetphoto"],
    tags: ["@june.walks"],
    stats: { likes: 21340, comments: 612, saves: 1820, shares: 305 },
    comments: ["Rolls 2 and 3 are unreal.", "What stock are you shooting?"]
  }
];

export const reels = [
  {
    id: "reel-1",
    author: "eli.moves",
    avatar: "EM",
    src: "https://picsum.photos/seed/eli-reel/900/1400",
    title: "Three beats, one transition",
    audio: "Original audio - Eli Moves",
    effects: ["Speed ramp", "Beat sync", "Auto captions"],
    stats: { plays: "1.2M", likes: "94K", comments: "4.8K" }
  },
  {
    id: "reel-2",
    author: "maya.creates",
    avatar: "MC",
    src: "https://picsum.photos/seed/maya-reel/900/1400",
    title: "Shoot list in 20 seconds",
    audio: "Soft Focus - Studio Mix",
    effects: ["Template", "Text overlay", "Green screen"],
    stats: { plays: "318K", likes: "22K", comments: "930" }
  },
  {
    id: "reel-3",
    author: "northskin",
    avatar: "NS",
    src: "https://picsum.photos/seed/northskin-reel/900/1400",
    title: "Refill routine in one shelf",
    audio: "Morning Room - Northskin",
    effects: ["Product tags", "Voiceover", "Saved template"],
    stats: { plays: "411K", likes: "31K", comments: "1.1K" }
  },
  {
    id: "reel-4",
    author: "june.walks",
    avatar: "JW",
    src: "https://picsum.photos/seed/june-reel/900/1400",
    title: "One mile, four lookouts",
    audio: "Slow Road - June Walks",
    effects: ["Template", "Auto captions", "Color grade"],
    stats: { plays: "212K", likes: "16K", comments: "740" }
  },
  {
    id: "reel-5",
    author: "rye.studio",
    avatar: "RS",
    src: "https://picsum.photos/seed/rye-reel/900/1400",
    title: "Crumb-shot in 12 seconds",
    audio: "Kitchen Tap - Rye Studio",
    effects: ["Beat sync", "Voiceover", "Auto captions"],
    stats: { plays: "640K", likes: "48K", comments: "2.1K" }
  },
  {
    id: "reel-6",
    author: "kai.makes",
    avatar: "KM",
    src: "https://picsum.photos/seed/kai-reel/900/1400",
    title: "Centering a bowl",
    audio: "Wheel Loop - Kai Makes",
    effects: ["Slow motion", "Voiceover", "Saved template"],
    stats: { plays: "180K", likes: "11K", comments: "510" }
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
