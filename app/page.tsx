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

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>AirCasa Auth Test (Next.js)</h1>
      {loading ? (
        <p>Checking session…</p>
      ) : email ? (
        <>
          <p>Signed in as: {email}</p>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <button onClick={signIn}>Sign in with Google</button>
      )}
    </main>
  );
}
