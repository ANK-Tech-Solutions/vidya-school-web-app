import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { DEFAULT_BRANDING } from "@/lib/constants";

const ui = Plus_Jakarta_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
});

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: DEFAULT_BRANDING.appName,
  description: "Clearer, safer school journeys.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: DEFAULT_BRANDING.appName,
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f6570",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ui.variable} ${display.variable}`}>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
