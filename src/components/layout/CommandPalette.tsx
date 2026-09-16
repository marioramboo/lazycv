"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, 
  User, 
  FolderGit2, 
  Sparkles, 
  History, 
  Kanban, 
  Settings, 
  Search,
  ArrowRight
} from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const routes = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: "home overview stats" },
    { name: "Profile", href: "/dashboard/profile", icon: User, keywords: "personal experience education skills" },
    { name: "Projects", href: "/dashboard/projects", icon: FolderGit2, keywords: "github repos code portfolio" },
    { name: "Generate CV", href: "/dashboard/generate", icon: Sparkles, keywords: "ai resume tailor builder job" },
    { name: "CV History", href: "/dashboard/history", icon: History, keywords: "resumes versions past downloads" },
    { name: "Job Application Tracker", href: "/dashboard/tracker", icon: Kanban, keywords: "applications status kanban interview" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, keywords: "ai provider api key backup export data" },
  ];

  const filteredRoutes = routes.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.keywords.toLowerCase().includes(q);
  });

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border shadow-2xl">
        <div className="flex items-center border-b px-3 bg-card">
          <Search className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
          <Input
            placeholder="Type a command or search page... (e.g. Generate, Settings)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-sm h-12 bg-transparent"
            autoFocus
          />
          <kbd className="hidden sm:inline-block pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredRoutes.length === 0 ? (
            <p className="p-4 text-center text-xs text-muted-foreground">
              No matching pages found for &quot;{query}&quot;
            </p>
          ) : (
            <div className="space-y-1">
              {filteredRoutes.map((r) => (
                <button
                  key={r.href}
                  onClick={() => handleSelect(r.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm hover:bg-primary/10 hover:text-primary transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <r.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t px-3 py-2 text-[10px] text-muted-foreground flex justify-between items-center bg-muted/40 font-mono">
          <span>Navigation Palette</span>
          <span>Press Ctrl+K to toggle anytime</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
