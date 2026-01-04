import './globals.css'
import { ReactNode } from 'react'
import { LanguageProvider } from '../components/LanguageProvider'

export const metadata = {
  title: 'whattocook? — What to cook',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
