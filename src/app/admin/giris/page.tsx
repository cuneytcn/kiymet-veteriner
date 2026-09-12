import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/img/logo.webp"
            alt="Kıymet Veteriner Kliniği"
            width={600}
            height={201}
            className="mx-auto h-14 w-auto"
            priority
          />
          <h1 className="mt-5 font-head text-2xl font-bold text-navy">
            Yönetim Paneli
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Devam etmek için giriş yapın.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
