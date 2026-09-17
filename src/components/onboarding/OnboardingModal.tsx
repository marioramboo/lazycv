"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettingsStore } from "@/stores/settings-store";
import { useProfileStore } from "@/stores/profile-store";
import { AIProviderType } from "@/types/ai";
import { Sparkles, Bot, User, FolderGit2, CheckCircle2, ArrowRight, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

export function OnboardingModal() {
  const router = useRouter();
  const { 
    onboardingCompleted, 
    setOnboardingCompleted,
    aiProvider,
    setProvider,
    apiKey,
    setApiKey,
    ollamaBaseUrl,
    setOllamaBaseUrl
  } = useSettingsStore();

  const { personalInfo, updatePersonalInfo, loadProfile } = useProfileStore();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [githubPat, setGithubPat] = useState("");

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    // Show modal if onboarding has not been completed yet
    if (!onboardingCompleted) {
      setOpen(true);
    }
  }, [onboardingCompleted]);

  useEffect(() => {
    if (personalInfo) {
      setFullName(personalInfo.fullName || "");
      setEmail(personalInfo.email || "");
    }
  }, [personalInfo]);

  const handleFinish = () => {
    setOnboardingCompleted(true);
    setOpen(false);
    toast.success("Welcome aboard! Let's generate your first CV.");
    router.push("/dashboard/generate");
  };

  const handleSkipAll = () => {
    setOnboardingCompleted(true);
    setOpen(false);
    toast("Onboarding skipped. You can configure your settings anytime!");
  };

  const handleSaveProfileStep = () => {
    updatePersonalInfo({ fullName, email });
    setStep(4);
  };

  const totalSteps = 5;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        // If closed manually via ESC or outside click, mark onboarding complete so it doesn't nag
        setOnboardingCompleted(true);
        setOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-lg p-6 overflow-hidden">
        {/* Progress Header */}
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Welcome to LazyCV</span>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? "w-6 bg-primary"
                    : i + 1 < step
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="py-6 space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold">Build ATS CVs in Minutes</DialogTitle>
              <DialogDescription className="text-muted-foreground pt-2">
                LazyCV is your local-first, open-source AI job application assistant. Connect your profile, pick an AI provider, and tailor CVs for every job offer.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 pt-2 text-left text-xs text-muted-foreground">
              <div className="p-3 rounded-lg border bg-muted/30">
                <span className="font-medium text-foreground block mb-1">🔒 100% Private</span>
                All data is stored locally in your browser DB.
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <span className="font-medium text-foreground block mb-1">🤖 Multi-AI</span>
                Support for OpenAI, Claude, Gemini, and Ollama.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="ghost" size="sm" onClick={handleSkipAll}>
                Skip Onboarding
              </Button>
              <Button onClick={() => setStep(2)} className="gap-2">
                Next: AI Setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure AI */}
        {step === 2 && (
          <div className="py-4 space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Bot className="h-4 w-4" />
                Step 2 of 5: AI Provider Configuration
              </div>
              <DialogTitle className="text-xl">Choose Your AI Model</DialogTitle>
              <DialogDescription className="text-xs">
                Enter your API key or local Ollama server address. You can change this anytime in Settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-provider">AI Provider</Label>
                <Select
                  value={aiProvider}
                  onValueChange={(val) => setProvider(val as AIProviderType)}
                >
                  <SelectTrigger id="onboard-provider">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4o / mini)</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="ollama">Ollama (Local LLM)</SelectItem>
                    <SelectItem value="nvidia">Nvidia NIM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {aiProvider === "ollama" ? (
                <div className="space-y-2">
                  <Label htmlFor="onboard-ollama">Ollama URL</Label>
                  <Input
                    id="onboard-ollama"
                    value={ollamaBaseUrl}
                    onChange={(e) => setOllamaBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="onboard-apikey">API Key</Label>
                  <Input
                    id="onboard-apikey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter ${aiProvider.toUpperCase()} API Key`}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                  Skip for now
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Set Up Profile */}
        {step === 3 && (
          <div className="py-4 space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <User className="h-4 w-4" />
                Step 3 of 5: Personal Details
              </div>
              <DialogTitle className="text-xl">Set Up Your Profile</DialogTitle>
              <DialogDescription className="text-xs">
                Enter your basic contact details to populate generated CV headers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-name">Full Name</Label>
                <Input
                  id="onboard-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboard-email">Email Address</Label>
                <Input
                  id="onboard-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(4)}>
                  Complete later
                </Button>
                <Button onClick={handleSaveProfileStep}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Connect GitHub */}
        {step === 4 && (
          <div className="py-4 space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <FolderGit2 className="h-4 w-4" />
                Step 4 of 5: GitHub Integration
              </div>
              <DialogTitle className="text-xl">Import Projects from GitHub</DialogTitle>
              <DialogDescription className="text-xs">
                (Optional) Enter your GitHub Personal Access Token to pull public repos directly into your portfolio.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="onboard-github">GitHub PAT / Token</Label>
                <Input
                  id="onboard-github"
                  type="password"
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                You can also add and manage projects manually on the Projects page at any time.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(5)}>
                  Skip
                </Button>
                <Button onClick={() => setStep(5)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Ready! */}
        {step === 5 && (
          <div className="py-6 space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold">You&apos;re All Set!</DialogTitle>
              <DialogDescription className="text-muted-foreground pt-1">
                Your setup is complete. You are ready to generate your first ATS-optimized CV, cover letter, and interview prep kit.
              </DialogDescription>
            </DialogHeader>

            <div className="pt-4 flex justify-center">
              <Button size="lg" onClick={handleFinish} className="w-full sm:w-auto px-8 gap-2 font-bold shadow-md">
                Generate Your First CV
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
