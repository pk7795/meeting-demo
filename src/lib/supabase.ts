import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | undefined

export const getSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      'https://umtbnqpwylnzogusjaff.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdGJucXB3eWxuem9ndXNqYWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk3NjM4NjgsImV4cCI6MjAwNTMzOTg2OH0.9G52Vdf-GBElt4hyiFvS3VKGYFYxGxIEgFUOBUFN3dA'
    )
  }

  return supabaseClient
}
