import "./globals.css";
import { ReactNode } from "react";
import { LanguageProvider } from "../components/LanguageProvider";

export const metadata = {
  title: "whattocook? — What to cook",
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
      </head>
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
