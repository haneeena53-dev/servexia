import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Servexia — Smart Proximity Services Platform",
    template: "%s | Servexia",
  },
  description:
    "Discover trusted service providers near you. Book appointments, chat in real time, and read verified reviews — all on one smart map.",
  keywords: [
    "nearby services",
    "local providers",
    "booking platform",
    "doctor near me",
    "mechanic near me",
    "proximity marketplace",
  ],
  openGraph: {
    title: "Servexia — Smart Proximity Services Platform",
    description:
      "Discover trusted service providers near you. Book, chat, and review — all on one smart map.",
    type: "website",
    locale: "en_US",
    siteName: "Servexia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
