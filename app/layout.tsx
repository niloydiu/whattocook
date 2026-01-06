import "./globals.css";
import { ReactNode } from "react";
import { LanguageProvider } from "../components/LanguageProvider";

const svgFavicon =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><rect width='256' height='256' fill='transparent'/><rect x='0' y='0' width='96' height='256' rx='32' fill='%2307a0ff'/><rect x='160' y='0' width='96' height='256' rx='32' fill='%2307a0ff'/><polygon points='96,0 160,128 96,256' fill='%23085fbd'/><polygon points='96,256 0,256 0,128 96,128' fill='%23085fbd'/></svg>";

export const metadata = {
  title: "whattoCook? — Discover what to cook today",
  description: "Find the perfect recipe based on what you have in your kitchen. Created by Niloy Kumar Mohonta.",
  icons: {
    icon: svgFavicon,
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
        {/* Inline SVG favicon (data URL) to ensure the provided logo shows without copying files */}
        <link rel="icon" href={svgFavicon} />
      </head>
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
