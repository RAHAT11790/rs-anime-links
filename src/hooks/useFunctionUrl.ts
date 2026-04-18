import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the configurable base URL used for edge-function calls.
 * Falls back to the project's default Supabase URL if admin hasn't set one.
 */
export function useFunctionBaseUrl() {
  const [baseUrl, setBaseUrl] = useState<string>(import.meta.env.VITE_SUPABASE_URL || "");

  useEffect(() => {
    supabase
      .from("settings")
      .select("value")
      .eq("key", "function_base_url")
      .maybeSingle()
      .then(({ data }) => {
        const v = (data?.value as string) || "";
        if (v && typeof v === "string" && v.trim().length > 0) setBaseUrl(v.trim().replace(/\/$/, ""));
      });
  }, []);

  return baseUrl;
}

/** Build a full edge-function URL from the configured base. */
export function buildFunctionUrl(base: string, name: string) {
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/functions/v1/${name}`;
}
