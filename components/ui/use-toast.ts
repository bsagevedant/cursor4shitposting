// Shadcn/ui toast hook
// This is a minimal implementation that will be used for toast notifications

import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"

import {
  useToast as useToastImpl,
} from "@/hooks/use-toast"

export const useToast = useToastImpl;

export type { Toast, ToastActionElement, ToastProps }