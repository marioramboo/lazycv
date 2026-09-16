import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { 
  Sparkles, 
  ShieldCheck, 
  FolderGit2, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Briefcase, 
  Zap, 
  Lock,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
              L
            </div>
            <span className="text-xl font-bold tracking-tight">LazyCV</span>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs font-mono">
              v1.0 Local-First
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#ai-providers" className="hover:text-foreground transition-colors">AI Providers</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" aria-label="GitHub Repository">
                <FolderGit2 className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="gap-2 font-medium shadow-sm">
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium gap-2 border shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              100% Free, Local-First & Open Source
            </Badge>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Your AI-Powered CV, <br />
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Tailored to Every Job
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect your GitHub, paste a job offer, and get an ATS-optimized CV in minutes.
              Open source. Runs locally on your machine. Your data stays yours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base gap-2 font-semibold shadow-md hover:shadow-lg transition-all">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-12 text-base gap-2 font-medium">
                  <FolderGit2 className="h-5 w-5" />
                  View on GitHub
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-5 shadow-sm" />
                <span>Zero Account Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <span>Local IndexedDB Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Instant ATS Optimization</span>
              </div>
            </div>
          </div>

          {/* Interactive Card Mockup Preview */}
          <div className="mt-16 mx-auto max-w-5xl rounded-2xl border bg-card/60 backdrop-blur-sm p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">lazycv-editor-v1.0</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-xs">
                ATS Match: 96%
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-3 p-4 rounded-xl bg-background border">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <FileText className="h-4 w-4" />
                  Tailored CV
                </div>
                <p className="text-xs text-muted-foreground">
                  Bullets auto-generated to highlight key requirements from the target job posting.
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="h-2 w-full bg-primary/20 rounded animate-pulse" />
                  <div className="h-2 w-4/5 bg-primary/10 rounded" />
                  <div className="h-2 w-3/5 bg-primary/10 rounded" />
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-background border">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <Briefcase className="h-4 w-4" />
                  Cover Letter & Prep
                </div>
                <p className="text-xs text-muted-foreground">
                  Custom cover letter & interview cheat sheet with probable technical questions.
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="h-2 w-full bg-emerald-500/20 rounded" />
                  <div className="h-2 w-3/4 bg-emerald-500/10 rounded" />
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-background border">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                  <FolderGit2 className="h-4 w-4" />
                  GitHub Sync
                </div>
                <p className="text-xs text-muted-foreground">
                  Imports stars, tech stacks, and README summaries directly into your project portfolio.
                </p>
                <div className="flex items-center gap-1.5 pt-2">
                  <Badge variant="secondary" className="text-[10px]">TypeScript</Badge>
                  <Badge variant="secondary" className="text-[10px]">Next.js</Badge>
                  <Badge variant="secondary" className="text-[10px]">Tailwind</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30 border-y">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything You Need for Your Job Search
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Designed for developers and professionals who want maximum control, privacy, and results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">AI-Powered Generation</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tailored CVs, cover letters, and interview cheat sheets using your preferred AI models.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">ATS Optimized</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Live keyword match scoring and clean semantic layouts that pass Applicant Tracking Systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">GitHub Integration</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Automatically pull your real repositories, tech stack tags, and project highlights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">100% Local & Private</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  No cloud database or accounts. All data is saved safely in your browser IndexedDB.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Get Your ATS CV in 3 Easy Steps
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Streamline your job application workflow from start to finish.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-extrabold text-xl flex items-center justify-center shadow">
                1
              </div>
              <h3 className="text-xl font-semibold">Build Your Profile</h3>
              <p className="text-muted-foreground text-sm">
                Enter your work history, skills, education, and connect your GitHub repositories in minutes.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-extrabold text-xl flex items-center justify-center shadow">
                2
              </div>
              <h3 className="text-xl font-semibold">Paste Job Offer</h3>
              <p className="text-muted-foreground text-sm">
                Paste the job description URL or text. LazyCV extracts key skill requirements automatically.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-card border shadow-sm">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-extrabold text-xl flex items-center justify-center shadow">
                3
              </div>
              <h3 className="text-xl font-semibold">Export & Apply</h3>
              <p className="text-muted-foreground text-sm">
                Export your pixel-perfect PDF/DOCX CV, cover letter, and interview pack ZIP instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported AI Providers */}
      <section id="ai-providers" className="py-20 bg-muted/30 border-y">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Bring Your Own AI Provider
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              LazyCV works seamlessly with cloud AI services or completely offline local LLMs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card border text-center space-y-3">
              <div className="font-bold text-lg">OpenAI</div>
              <Badge variant="outline">GPT-4o & GPT-4o-mini</Badge>
              <p className="text-xs text-muted-foreground">High accuracy ATS optimization and concise bullet drafting.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border text-center space-y-3">
              <div className="font-bold text-lg">Anthropic</div>
              <Badge variant="outline">Claude 3.5 Sonnet</Badge>
              <p className="text-xs text-muted-foreground">Nuanced phrasing, compelling cover letters, and natural tone.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border text-center space-y-3">
              <div className="font-bold text-lg">Google Gemini</div>
              <Badge variant="outline">Gemini 1.5 Flash & Pro</Badge>
              <p className="text-xs text-muted-foreground">Fast generation speeds with comprehensive context handling.</p>
            </div>

            <div className="p-6 rounded-xl bg-card border text-center space-y-3">
              <div className="font-bold text-lg">Ollama (Local)</div>
              <Badge variant="outline">Llama 3, DeepSeek, Mistral</Badge>
              <p className="text-xs text-muted-foreground">100% offline generation with zero external API calls needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build Your Tailored CV?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-base sm:text-lg">
            No signup, no subscription, no tracking. Start generating optimized applications right away.
          </p>
          <Link href="/dashboard" className="inline-block">
            <Button size="lg" variant="secondary" className="px-8 h-12 text-base font-bold shadow">
              Open LazyCV App
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">LazyCV</span>
            <span>— Open Source under MIT License</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="https://github.com" target="_blank" className="hover:text-foreground transition-colors">
              GitHub Repo
            </Link>
            <span className="flex items-center gap-1">
              Made with <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 inline" /> for Job Seekers
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
