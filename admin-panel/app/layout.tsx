import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Central Church Admin',
  description: 'Admin panel for Central Church App',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FDFAF4] text-[#1A1611] antialiased">{children}</body>
    </html>
  )
}
