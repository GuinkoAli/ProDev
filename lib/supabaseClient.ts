import { createBrowserClient } from '@supabase/ssr'

// NOTE: This file is for client-side Supabase access.
// Do not use it in Server Components or Route Handlers.
export const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}