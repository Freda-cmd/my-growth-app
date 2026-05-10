import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "你的Project URL";
const supabaseKey = "你的anon public key";

export const supabase = createClient(supabaseUrl, supabaseKey);