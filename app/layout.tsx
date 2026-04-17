// ============================================================
// Wamanafo SHS Frontend — Root Layout
// ============================================================

import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSerifDisplay = DM_Serif_Display({
  weight:   ["400"],
  subsets:  ["latin"],
  variable: "--font-serif",
  display:  "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets:  ["latin"],
  variable: "--font-sans",
  display:  "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets:  ["latin"],
  variable: "--font-mono",
  display:  "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "Wamanafo Senior High Technical School Academic System",
    template: "%s | Wamanafo SHS",
  },
  description: "Senior High School Report Card and Attendance Management System",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSerifDisplay.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
