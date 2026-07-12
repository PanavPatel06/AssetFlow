"use client";

// Mock "who am I logged in as" for Phase 1. It persists your choice in
// localStorage so the role stays put as you navigate. In Phase 3 this gets
// replaced by the real authenticated session from Auth.js.

import { createContext, useContext, useEffect, useState } from "react";
import { employees, getEmployee } from "./mockData";

const DEFAULT_USER_ID = "e1"; // Priya Sharma (Admin)
const STORAGE_KEY = "assetflow.currentUserId";

const CurrentUserContext = createContext(null);

export function CurrentUserProvider({ children }) {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);

  // Restore the previously selected mock user on first mount (client only).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && getEmployee(saved)) setUserId(saved);
  }, []);

  function selectUser(id) {
    setUserId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  const user = getEmployee(userId) || getEmployee(DEFAULT_USER_ID);

  return (
    <CurrentUserContext.Provider value={{ user, selectUser, allUsers: employees }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used inside <CurrentUserProvider>");
  }
  return ctx;
}
