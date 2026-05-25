import "./globals.css";

export const metadata = {
  title: "Friends",
  description: "A modern social media dashboard prototype.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/app-icon.svg",
    apple: "/assets/app-icon.svg"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f7f2"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
