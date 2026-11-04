// अपनी Supabase प्रोजेक्ट सेटिंग्स (API) से ये दोनों वैल्यूज बदलें
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
