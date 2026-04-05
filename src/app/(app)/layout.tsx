import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has a couple
  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .single();

  // Allow access to couple pages even without couple_id
  // but redirect to /couple for other app pages
  const needsCouple = !profile?.couple_id;

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <main className="max-w-lg mx-auto px-4 py-4">
        {needsCouple ? (
          <CoupleGuard>{children}</CoupleGuard>
        ) : (
          children
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function CoupleGuard({ children }: { children: React.ReactNode }) {
  // This component renders children but the couple page will handle
  // showing the right UI. We pass through to allow /couple and /couple/join.
  return <>{children}</>;
}
