import JoinCoupleForm from "@/components/couple/JoinCoupleForm";
import Link from "next/link";

export default function JoinCouplePage() {
  return (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Join Your Partner
        </h1>
        <p className="text-text-secondary text-sm">
          Enter the invite code from your partner
        </p>
      </div>

      <JoinCoupleForm />

      <Link
        href="/couple"
        className="block text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
      >
        Back
      </Link>
    </div>
  );
}
