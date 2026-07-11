"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setInstallEvent(event);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  if (!installEvent || dismissed) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-teal-700/20 bg-white p-3 shadow-lg dark:bg-slate-900">
      <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">
        Install Vidya Bus for quicker access.
      </p>
      <button
        type="button"
        onClick={install}
        className="rounded-lg bg-[#0f6570] px-3 py-2 text-sm font-medium text-white hover:bg-[#0b515a]"
      >
        Install
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install prompt"
        className="px-1 text-lg leading-none text-slate-500 hover:text-slate-800 dark:hover:text-white"
      >
        ×
      </button>
    </aside>
  );
}
