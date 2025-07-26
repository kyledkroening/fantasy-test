import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fantasy Football League Central',
  description: 'Complete history and analytics for your fantasy football league (2008-2024)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}