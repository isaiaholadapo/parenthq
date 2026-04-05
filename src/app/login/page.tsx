"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // On success, useEffect takes over and routes to "/"
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your account access.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-500 animate-pulse font-medium">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-sm rounded-[24px] shadow-xl border-t-8 border-t-zinc-900 border-x-0 border-b-0 outline-none">
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-zinc-900">ParentHq</CardTitle>
          <CardDescription className="text-zinc-500 font-medium mt-1">Your private pregnancy dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 mt-6 pb-8">
          <Button 
            onClick={handleSignIn} 
            className="w-full rounded-2xl py-6 text-[15px] font-semibold tracking-wide shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign in with Google
          </Button>
          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start">
              <p className="text-sm text-red-600 font-medium leading-relaxed">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
