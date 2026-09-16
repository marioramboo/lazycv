"use client"
import { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const segments = pathname.split('/').filter(Boolean)
  const titleSegment = segments.length > 1 ? segments[1] : 'Overview'
  const title = titleSegment.replace(/-/g, ' ')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
           <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
           <SheetDescription className="sr-only">Navigate through the application</SheetDescription>
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold capitalize">{title}</h1>
      </div>
      
      <ThemeToggle />
    </header>
  )
}
