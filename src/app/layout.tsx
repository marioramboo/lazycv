import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LazyCV — AI-Powered CV Generator",
    template: "%s | LazyCV"
  },
  description: "An open-source, local-first web application that generates ATS-optimized CVs, cover letters, and interview packs using AI.",
  keywords: ["CV Generator", "Resume Builder", "ATS Optimization", "AI Resume", "Local First", "Open Source"],
  openGraph: {
    title: "LazyCV — AI-Powered CV Generator",
    description: "Connect your GitHub, paste a job offer, and get an ATS-optimized CV in minutes. 100% local and open source.",
    type: "website",
    siteName: "LazyCV"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
