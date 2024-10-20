// app/layout.tsx

import SideBar from '@/components/SideNav'
import '@/app/globals.css'
import PromptComponent from '@/components/PromptComponent'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <header>
          {/* Your header content */}
        </header>
        <div className="flex">
          <SideBar />
          <PromptComponent />
          
        </div>
          <main>
            {children}
          </main>
        <footer>
          {/* Your footer content */}
        </footer>
      </body>
    </html>
  )
}