import AuthForm from "@/components/auth/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">DaysWeMet</h1>
        <p className="text-text-secondary text-sm">
          A calendar made of your memories
        </p>
      </div>

      <AuthForm mode="login" />

      <p className="mt-6 text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary hover:text-primary-muted transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
