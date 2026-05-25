const paths = {
  activity: [
    <path key="a" d="M4 12h4l3-7 4 14 3-7h2" />
  ],
  analytics: [
    <path key="a" d="M4 19V5" />,
    <path key="b" d="M4 19h17" />,
    <path key="c" d="M8 15l3-4 3 2 5-7" />
  ],
  bell: [
    <path key="a" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />,
    <path key="b" d="M10 21h4" />
  ],
  bookmark: [<path key="a" d="M6 4h12v17l-6-4-6 4z" />],
  calendar: [
    <rect key="a" x="4" y="5" width="16" height="16" rx="2" />,
    <path key="b" d="M16 3v4" />,
    <path key="c" d="M8 3v4" />,
    <path key="d" d="M4 11h16" />
  ],
  camera: [
    <path key="a" d="M4 8h4l2-3h4l2 3h4v11H4z" />,
    <circle key="b" cx="12" cy="13" r="3" />
  ],
  cart: [
    <path key="a" d="M6 6h15l-2 8H8z" />,
    <path key="b" d="M6 6 5 3H2" />,
    <circle key="c" cx="9" cy="20" r="1" />,
    <circle key="d" cx="18" cy="20" r="1" />
  ],
  check: [<path key="a" d="m5 12 4 4L19 6" />],
  chevronLeft: [<path key="a" d="m15 18-6-6 6-6" />],
  chevronRight: [<path key="a" d="m9 18 6-6-6-6" />],
  close: [
    <path key="a" d="M6 6l12 12" />,
    <path key="b" d="M18 6 6 18" />
  ],
  comment: [<path key="a" d="M21 12a8 8 0 0 1-8 8H6l-3 3v-8a8 8 0 1 1 18-3Z" />],
  compass: [
    <circle key="a" cx="12" cy="12" r="9" />,
    <path key="b" d="m15 9-2 6-4 2 2-6z" />
  ],
  heart: [<path key="a" d="M20 8c0 6-8 11-8 11S4 14 4 8a4 4 0 0 1 7-3 4 4 0 0 1 9 3Z" />],
  home: [
    <path key="a" d="M3 11 12 4l9 7" />,
    <path key="b" d="M6 10v10h12V10" />
  ],
  link: [
    <path key="a" d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />,
    <path key="b" d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
  ],
  lock: [
    <rect key="a" x="5" y="10" width="14" height="10" rx="2" />,
    <path key="b" d="M8 10V7a4 4 0 0 1 8 0v3" />
  ],
  mail: [
    <rect key="a" x="3" y="5" width="18" height="14" rx="2" />,
    <path key="b" d="m4 7 8 6 8-6" />
  ],
  mic: [
    <rect key="a" x="9" y="3" width="6" height="11" rx="3" />,
    <path key="b" d="M5 11a7 7 0 0 0 14 0" />,
    <path key="c" d="M12 18v3" />
  ],
  music: [
    <path key="a" d="M9 18V5l11-2v13" />,
    <circle key="b" cx="6" cy="18" r="3" />,
    <circle key="c" cx="17" cy="16" r="3" />
  ],
  play: [<path key="a" d="M8 5v14l11-7z" />],
  plus: [
    <path key="a" d="M12 5v14" />,
    <path key="b" d="M5 12h14" />
  ],
  search: [
    <circle key="a" cx="11" cy="11" r="7" />,
    <path key="b" d="m20 20-4-4" />
  ],
  send: [
    <path key="a" d="m22 2-7 20-4-9-9-4z" />,
    <path key="b" d="M22 2 11 13" />
  ],
  shield: [<path key="a" d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />],
  shop: [
    <path key="a" d="M4 10h16l-1 10H5z" />,
    <path key="b" d="M7 10V7a5 5 0 0 1 10 0v3" />
  ],
  sparkles: [<path key="a" d="M12 3 9 9l-6 3 6 3 3 6 3-6 6-3-6-3z" />],
  tag: [
    <path key="a" d="M20 13 13 20 4 11V4h7z" />,
    <circle key="b" cx="8" cy="8" r="1" />
  ],
  upload: [
    <path key="a" d="M12 16V4" />,
    <path key="b" d="m7 9 5-5 5 5" />,
    <path key="c" d="M5 20h14" />
  ],
  users: [
    <path key="a" d="M16 21v-2a4 4 0 0 0-8 0v2" />,
    <circle key="b" cx="12" cy="7" r="4" />,
    <path key="c" d="M22 21v-2a4 4 0 0 0-3-3.87" />,
    <path key="d" d="M16 3.13a4 4 0 0 1 0 7.75" />
  ],
  video: [
    <rect key="a" x="3" y="6" width="13" height="12" rx="2" />,
    <path key="b" d="m16 10 5-3v10l-5-3z" />
  ]
};

export function Icon({ name, label, className = "size-5", strokeWidth = 2 }) {
  return (
    <svg
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      className={className}
      fill="none"
      role={label ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
    >
      {paths[name] || paths.sparkles}
    </svg>
  );
}
