import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BIO_FONT_SIZE_CLASS = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
} as const;

export function bioTextClass(bio: {
  bioFontSize: "sm" | "base" | "lg";
  bioBold: boolean;
  bioItalic: boolean;
}) {
  return cn(
    BIO_FONT_SIZE_CLASS[bio.bioFontSize],
    bio.bioBold && "font-bold",
    bio.bioItalic && "italic"
  );
}
