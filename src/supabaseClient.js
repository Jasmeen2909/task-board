import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vykelsrpsvzzqfvastoh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5a2Vsc3Jwc3Z6enFmdmFzdG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjA1MjUsImV4cCI6MjA1OTgzNjUyNX0.K1NKduHiN6uN4MPBe_wt8qEOX3-j-9-aQ2-UkQkidX8'
export const supabase = createClient(supabaseUrl, supabaseKey)
