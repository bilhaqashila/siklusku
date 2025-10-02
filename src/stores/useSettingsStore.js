"use client";

import { create } from "zustand";
import {
  STORAGE_KEYS,
  DEFAULT_VALUES,
  getLocalValue,
  setLocalValue
} from "@/lib/siklus/localStore";

const defaultSettings = DEFAULT_VALUES[STORAGE_KEYS.settings];

const useSettingsStore = create((set, get) => ({
  hydrated: false,
  settings: { ...defaultSettings },

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const settings = getLocalValue(STORAGE_KEYS.settings);
    set({ hydrated: true, settings });
  },

  toggleNudges: () => {
    const current = get().settings;
    const next = { ...current, nudgesEnabled: !current.nudgesEnabled };
    setLocalValue(STORAGE_KEYS.settings, next);
    set({ settings: next });
  },

  setReducedMotion: (value) => {
    const current = get().settings;
    const next = { ...current, reducedMotion: Boolean(value) };
    setLocalValue(STORAGE_KEYS.settings, next);
    set({ settings: next });
  }
}));

export default useSettingsStore;
