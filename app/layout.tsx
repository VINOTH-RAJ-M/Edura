import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edura — AI-Powered Support & Academy Management",
  description: "AI-Powered Student Support, Academy Management & Complaint Resolution System.",
  icons: {
    icon: "/edura-logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
