import { supabase } from "../lib/supabaseClient";

// Option 1: OTP-based signup (has rate limits)
export async function startSignupOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
}

export function verifyEmailOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
}

export async function setPassword(password: string) {
  return supabase.auth.updateUser({ password });
}

// Option 2: Direct password-based signup (no rate limits)
export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
}

export async function loginWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}


