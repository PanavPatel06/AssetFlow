"use client";

import { useState } from "react";
import { NotificationsProvider } from "@/lib/notifications";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Wraps every authenticated screen: lays out the sidebar + top bar + a
// scrollable content area. The current user comes from the real Auth.js
// session (lib/currentUser.js), provided app-wide by <SessionProvider> in
// app/layout.js.
export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <NotificationsProvider>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}
