import blackEarbudsImg from '../assets/earbuds.jpg';
import j40EarbudsImg from '../assets/j40_earbuds.jpg';

import type { ProductColor } from '../types';

export const PRODUCT_INFO = {
  name: "J40 V5.4 Wireless 4-in-1 Earbuds",
  nameBangla: "J40 V5.4 ওয়্যারলেস ফোর-ইন-ওয়ান ইয়ারবাডস",
  tagline: "এক কেসে ২ জোড়া ইয়ারবাডস! অত্যাধুনিক প্রযুক্তি ও প্রিমিয়াম সাউন্ডের অপূর্ব সমন্বয়।",
  regularPrice: 1490,
  basePrice: 1090,
  deliveryDhaka: 0,
  deliveryOutside: 0,
};

export const COLOR_VARIANTS: ProductColor[] = [
  {
    id: "black",
    name: "ব্ল্যাক (Black)",
    nameEn: "Black",
    hex: "#0F172A",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    image: blackEarbudsImg,
  },
  {
    id: "white",
    name: "হোয়াইট (White)",
    nameEn: "White",
    hex: "#F8FAFC",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    image: j40EarbudsImg,
  },
];

// Helper to convert English numbers to Bangla digits
export const toBanglaNumber = (num: number | string): string => {
  const banglaDigits: { [key: string]: string } = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  };
  return String(num).replace(/[0-9]/g, (match) => banglaDigits[match] || match);
};
