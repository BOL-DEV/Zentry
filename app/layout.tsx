import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zentra",
  description: "A minimal workspace to sketch ideas fast.",
  icons: {
    icon: "/fav-logo-black.svg",
    shortcut: "/fav-logo-black.svg",
    apple: "/fav-logo-black.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased flex flex-col bg-purple-100 text-slate-900 dark:bg-slate-950 dark:text-white`}
      >
        <ReactQueryProvider>
          <div className="flex-1">{children}</div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
