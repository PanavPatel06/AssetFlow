"use client";

import { useState } from "react";
import { CurrentUserProvider } from "@/lib/currentUser";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Wraps every authenticated screen: provides the (mock) current user, and lays
// out the sidebar + top bar + scrollable content area.
export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <CurrentUserProvider>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </CurrentUserProvider>
  );
}
