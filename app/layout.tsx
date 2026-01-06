import "./globals.css";
import { ReactNode } from "react";
import { LanguageProvider } from "../components/LanguageProvider";

export const metadata = {
  title: "whattoCook? — Discover what to cook today",
  description: "Find the perfect recipe based on what you have in your kitchen. Created by Niloy Kumar Mohonta.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
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
        {/* Use the user-provided PNG favicon from /public for consistent rendering */}
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
