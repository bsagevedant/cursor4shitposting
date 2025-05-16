"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/lib/supabase";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { user } = useUser();

  useEffect(() => {
    const syncThemeWithUserSettings = async () => {
      if (!user) return;

      try {
        // Check if the table exists and user has a profile
        const { data, error } = await supabase
          .from('user_profiles')
          .select('dark_mode')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid error when no record exists

        // Only update theme if we have valid data
        if (data && data.dark_mode !== undefined) {
          document.documentElement.classList.toggle('dark', data.dark_mode);
        }
      } catch (error) {
        // Just log the error, but don't throw - this prevents UI disruption
        console.error('Error syncing theme:', error);
      }
    };

    syncThemeWithUserSettings();
  }, [user]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}