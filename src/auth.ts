import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(120),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: {
    signIn: "/admin/giris",
    error: "/admin/giris",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        // Kullanıcı yoksa da hash karşılaştırması yap: yanıt süresinden
        // hesabın varlığı anlaşılmasın.
        const hash =
          user?.passwordHash ??
          "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";

        const valid = await bcrypt.compare(parsed.data.password, hash);
        if (!user || !valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "EDITOR";
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? session.user.id;
        (session.user as { role?: string }).role =
          (token.role as string) ?? "EDITOR";
      }
      return session;
    },
  },
});

/** Admin sayfalarında oturum zorunluluğu. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "EDITOR";
  };
}

/** Yalnızca yöneticilere açık ekranlar (kullanıcı yönetimi gibi). */
export async function requireAdmin() {
  const user = await requireUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
