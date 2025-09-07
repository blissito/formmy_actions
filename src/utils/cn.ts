import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * Based on shadcn/ui pattern - handles Tailwind class conflicts automatically
 * 
 * @example
 * cn("bg-red-500", "bg-blue-500") // "bg-blue-500" (last wins)
 * cn("px-4 py-2", "p-3") // "p-3" (more specific wins)
 * cn("text-sm", false && "text-lg", "font-bold") // "text-sm font-bold"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}