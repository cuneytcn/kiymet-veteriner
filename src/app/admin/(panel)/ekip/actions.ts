"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/lib/db";

const memberSchema = z.object({
  name: z.string().trim().min(2, "İsim gerekli.").max(80),
  title: z.string().trim().min(2, "Unvan gerekli.").max(80),
  bio: z.string().trim().max(600),
  photo: z.string().trim().max(300),
  order: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});

export type TeamState = { ok?: boolean; error?: string; message?: string } | null;

function revalidateTeam() {
  revalidatePath("/hakkimizda");
  revalidatePath("/admin/ekip");
}

export async function saveMember(
  id: string | null,
  _prev: TeamState,
  formData: FormData,
): Promise<TeamState> {
  const user = await requireUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = memberSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    title: String(formData.get("title") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    photo: String(formData.get("photo") ?? ""),
    order: formData.get("order") ?? 0,
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    title: d.title,
    bio: d.bio || null,
    photo: d.photo || null,
    order: d.order,
    published: d.published,
  };

  try {
    if (id) {
      await db.teamMember.update({ where: { id }, data });
    } else {
      await db.teamMember.create({ data });
    }
  } catch (error) {
    console.error("[admin] ekip:", error);
    return { error: "Kaydedilemedi." };
  }

  revalidateTeam();
  return { ok: true, message: id ? "Güncellendi." : "Ekip üyesi eklendi." };
}

export async function deleteMember(id: string) {
  const user = await requireUser();
  if (!user) return { ok: false };

  await db.teamMember.delete({ where: { id } }).catch(() => null);
  revalidateTeam();
  return { ok: true };
}

export async function toggleMemberPublished(id: string, published: boolean) {
  const user = await requireUser();
  if (!user) return { ok: false };

  await db.teamMember
    .update({ where: { id }, data: { published } })
    .catch(() => null);

  revalidateTeam();
  return { ok: true };
}
