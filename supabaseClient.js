// supabaseClient.js
const SUPABASE_URL = "https://gnfrvwgpilhvknjfhmwx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZnJ2d2dwaWxodmtuamZobXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjA3OTMsImV4cCI6MjA3MjgzNjc5M30.Pq5zgWEyAd_cTDivICMGflFCGs1m0n4xZxye31vpMOs";

window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);