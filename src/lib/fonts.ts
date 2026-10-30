import { Bodoni_Moda, Jost, Noto_Serif_SC } from "next/font/google";

export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-bodoni",
  display: "swap",
});

export const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

/** Chinese display serif — loaded on demand via unicode-range slices (not preloaded). */
export const notoSerifSC = Noto_Serif_SC({
  weight: ["500", "600"],
  variable: "--font-noto-serif-sc",
  display: "swap",
  preload: false,
});
