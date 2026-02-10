import { supabase } from "../lib/supabaseClient";

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
    type: "signup", //change to signup if "email" fails
  });
}

export async function setPassword(password: string) {
  return supabase.auth.updateUser({ password });
  
}

// ✅ ADD THIS (fixes "no exported member")
export async function loginWithPassword(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
}


