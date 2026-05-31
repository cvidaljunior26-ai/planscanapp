import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://iijtakqrmehzaeswitzi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpanRha3FybWVoemFlc3dpdHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMjQxMTIsImV4cCI6MjA5MjcwMDExMn0.MZhixyK82gNO2Im4WP3XmuVC_Rrygw7xMVC_s0X57-4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables. Check .env file.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
