"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ColorwayId, L, RequestOptionId } from "@/data/taxonomy";
import { productBySlug } from "@/data/products";

export type StudioSelection = {
  family: string;
  silhouette: string;
  bodyColor: string;
  capColor: string;
  accentColor: string;
  finish: string;
  decoration: string;
  inkColor: string;
  hasLogo: boolean;
  logoName?: string;
  shades: string[];
  applicator?: string;
  quantity: string;
  notes?: string;
};

export type InquiryItem = {
  id: string;
  /** "product" = catalogue reference model; "concept" = legacy item from the earlier concept catalogue. */
  kind: "product" | "concept" | "studio";
  slug?: string;
  model?: string;
  title: L;
  image?: string;
  colorway?: ColorwayId;
  shade?: L;
  notes?: string;
  /** Customisation topics the buyer wants to discuss (requests, not confirmed capabilities). */
  requests?: RequestOptionId[];
  quantity?: string;
  /** Human-readable lines describing a studio configuration, in both languages. */
  lines?: L[];
  studio?: StudioSelection;
  /** Small PNG preview captured from the studio viewer (data URL, kept local). */
  preview?: string;
  addedAt: number;
};

type State = {
  items: InquiryItem[];
  shortlist: string[];
  compare: string[];
  add: (item: Omit<InquiryItem, "id" | "addedAt">) => string;
  update: (id: string, patch: Partial<InquiryItem>) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleShortlist: (slug: string) => void;
  toggleCompare: (slug: string) => boolean;
  clearCompare: () => void;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useInquiry = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      shortlist: [],
      compare: [],
      add: (item) => {
        const id = uid();
        set({ items: [...get().items, { ...item, id, addedAt: Date.now() }] });
        return id;
      },
      update: (id, patch) => set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      toggleShortlist: (slug) => {
        const s = get().shortlist;
        set({ shortlist: s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug] });
      },
      toggleCompare: (slug) => {
        const c = get().compare;
        if (c.includes(slug)) {
          set({ compare: c.filter((x) => x !== slug) });
          return true;
        }
        if (c.length >= 3) return false;
        set({ compare: [...c, slug] });
        return true;
      },
      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: "yalilai-inquiry-v1",
      version: 2,
      // v2 replaced the concept catalogue: drop references to models that no longer exist.
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Partial<Pick<State, "items" | "shortlist" | "compare">>;
        if (version < 2) {
          return {
            items: (s.items ?? []).filter((i) => i.kind === "studio" || (i.slug && productBySlug.has(i.slug))),
            shortlist: (s.shortlist ?? []).filter((x) => productBySlug.has(x)),
            compare: [],
          };
        }
        return s;
      },
      skipHydration: true,
      storage: createJSONStorage(() => {
        try {
          const k = "__yl_probe__";
          window.localStorage.setItem(k, "1");
          window.localStorage.removeItem(k);
          return window.localStorage;
        } catch {
          // Private mode / blocked storage: fall back to an in-memory store.
          const mem = new Map<string, string>();
          return {
            getItem: (n: string) => mem.get(n) ?? null,
            setItem: (n: string, v: string) => void mem.set(n, v),
            removeItem: (n: string) => void mem.delete(n),
          };
        }
      }),
      partialize: (s) => ({ items: s.items, shortlist: s.shortlist, compare: s.compare }),
    },
  ),
);
