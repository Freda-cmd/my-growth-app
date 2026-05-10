import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rjhpiaxipntqjkfqfbze.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaHBpYXhpcG50cWprZnFmYnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzM0MjUsImV4cCI6MjA5MjE0OTQyNX0.RuTstnmLjCps04Pi_MZPp7fl0x0gH9zEHvsxlW933Tc";

export const supabase = createClient(supabaseUrl, supabaseKey);