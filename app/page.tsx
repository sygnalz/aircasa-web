"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const callSecureApi = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log("Supabase getSession() →", { data, error });
    const token = data?.session?.access_token;
    console.log("Access token being sent:", token?.slice(0, 20) + "...");

    if (!token) {
      alert("No session token. Please sign in first.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/secure`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    console.log("API raw response:", text);
    try {
      alert(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      alert(text);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>AirCasa Auth Test (Next.js)</h1>
      {loading ? (
        <p>Checking session…</p>
      ) : email ? (
        <>
          <p>Signed in as: {email}</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={signOut}>Sign out</button>
            <button onClick={callSecureApi}>Call Secure API (local)</button>
          </div>
        </>
      ) : (
        <button onClick={signIn}>Sign in with Google</button>
      )}
    </main>
  );
}
