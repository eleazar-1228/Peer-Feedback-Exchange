import { supabase } from "../lib/supabaseClient";

export async function startSignupOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
}

export async function verifyEmailOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: "email", //change to signup if "email" fails
  });
}

export function setPassword(password: string) {
  return supabase.auth.updateUser({ password });

  
}

// ✅ ADD THIS (fixes "no exported member")
export function loginWithPassword(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
}


