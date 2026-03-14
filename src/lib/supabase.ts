import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ahvdfhgfifyoddweagln.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodmRmaGdmbGZ5b2Rkd2VhZ2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTA1NzUsImV4cCI6MjA4OTA4NjU3NX0.zOG2wXKcFAr8zQb3Tk2SHvcitibG_Pn8LwjWgysQI3c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
