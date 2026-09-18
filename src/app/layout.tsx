import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/components/TranslationProvider";
import TopBar from "@/components/TopBar";
import { UserProvider } from "@/context/UserContext";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import PendingTasksAlerts from "@/components/PendingTasksAlerts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "ANTA",
  description: "Système d'exploitation de la résidence immobilière",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-neutral-50 antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <TranslationProvider />
            <OnboardingWizard />
            <TopBar />
            <PendingTasksAlerts />
            {children}
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
