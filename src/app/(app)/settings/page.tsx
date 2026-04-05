"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-xl font-bold text-text-primary">Settings</h1>

      <div className="space-y-3">
        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-surface border border-border text-text-primary rounded-button hover:bg-surface-elevated transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
