import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">DaysWeMet</h1>
        <p className="text-text-secondary text-sm">
          Start building your memories together
        </p>
      </div>

      <AuthForm mode="signup" />

      <p className="mt-6 text-sm text-text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary-muted transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
