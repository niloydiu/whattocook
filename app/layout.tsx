import "./globals.css";
import { ReactNode } from "react";
import { LanguageProvider } from "../components/LanguageProvider";
import { ScrollCaptureProvider } from "../components/ScrollCaptureProvider";
import ChatBot from "../components/ChatBot";
import MovableLinkButton from "../components/MovableLinkButton";
import FloatingNav from "../components/FloatingNav";
import CookingTracker from "../components/CookingTracker";

export const metadata = {
  title: "whattoCook? — Discover what to cook today",
  description:
    "Find the perfect recipe based on what you have in your kitchen. Created by Niloy Kumar Mohonta.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                // Ensure dark class is always removed
                document.documentElement.classList.remove('dark');
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Hind+Siliguri:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Use a cache-busted user-provided PNG favicon to force fresh fetch */}
        <link rel="icon" href="/favicon.v2.png" type="image/png" sizes="any" />
        <link
          rel="icon"
          href="/favicon-16.v2.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="/favicon-48.png"
          type="image/png"
          sizes="48x48"
        />
        <link
          rel="icon"
          href="/favicon-96.png"
          type="image/png"
          sizes="96x96"
        />
        <link
          rel="icon"
          href="/favicon-256.png"
          type="image/png"
          sizes="256x256"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.v2.png" />
        <meta name="theme-color" content="#0b6ed8" />
      </head>
      <body suppressHydrationWarning={true}>
        <ScrollCaptureProvider>
          <LanguageProvider>
            <FloatingNav />
            <MovableLinkButton />
            {children}
            <ChatBot />
            <CookingTracker />
          </LanguageProvider>
        </ScrollCaptureProvider>
      </body>
    </html>
  );
}
