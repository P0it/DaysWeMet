import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BackgroundImage from "@/components/layout/BackgroundImage";
import FloatingAddButton from "@/components/layout/FloatingAddButton";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .single();

  const needsCouple = !profile?.couple_id;

  return (
    <div className="min-h-screen relative">
      <BackgroundImage />
      <main className="max-w-lg mx-auto px-4 py-3 relative">
        {needsCouple ? (
          <CoupleGuard>{children}</CoupleGuard>
        ) : (
          children
        )}
      </main>
      <FloatingAddButton />
    </div>
  );
}

function CoupleGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
