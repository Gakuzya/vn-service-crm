import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yzmsozkytbymeotmddao.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bXNvemt5dGJ5bWVvdG1kZGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MzQ1NDksImV4cCI6MjEwNjUxMDU0OX0.cJ8lELehtGXNTmkq3M_II8cOxJ9qEePSlMPQzBAbKHY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
