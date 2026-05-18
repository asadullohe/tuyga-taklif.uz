import Link from "next/link";
import { LoginClient } from "@/app/login/login-client";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 text-sm font-semibold text-primary">
        tuyga-taklif.uz
      </Link>
      <LoginClient />
    </main>
  );
}
