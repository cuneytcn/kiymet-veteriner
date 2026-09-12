"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PriceCategory, PriceItem } from "@prisma/client";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { EmptyState, FormFooter } from "@/components/admin/form-shell";
import {
  deleteCategory,
  deleteItem,
  saveCategory,
  saveItem,
  type PriceState,
} from "./actions";

type CategoryWithItems = PriceCategory & { items: PriceItem[] };

export function PriceManager({
  categories,
}: {
  categories: CategoryWithItems[];
}) {
  const [editingCategory, setEditingCategory] = useState<
    PriceCategory | null | "new"
  >(null);

  return (
    <div className="grid gap-6">
      {editingCategory !== null && (
        <CategoryForm
          key={editingCategory === "new" ? "new" : editingCategory.id}
          category={editingCategory === "new" ? null : editingCategory}
          onDone={() => setEditingCategory(null)}
        />
      )}

      {editingCategory === null && (
        <div>
          <Button type="button" size="md" onClick={() => setEditingCategory("new")}>
            <Plus aria-hidden />
            Yeni Kategori
          </Button>
        </div>
      )}

      {categories.length === 0 ? (
        <EmptyState
          title="Fiyat listesi boş"
          description="Önce bir kategori ekleyin (örn. Aşılar), sonra içine işlemleri ve ücretlerini girin."
        />
      ) : (
        <div className="grid gap-5">
          {categories.map((category) => (
            <CategoryBlock
              key={category.id}
              category={category}
              onEdit={() => setEditingCategory(category)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryBlock({
  category,
  onEdit,
}: {
  category: CategoryWithItems;
  onEdit: () => void;
}) {
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const closeItem = () => {
    setAddingItem(false);
    setEditingItem(null);
  };

  return (
    <section className="overflow-hidden rounded-card border border-line bg-white">
      <header className="flex flex-wrap items-center gap-4 border-b border-line bg-cream px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-head text-lg font-bold text-navy">
            {category.title}
          </h2>
          {category.note && (
            <p className="text-sm text-muted">{category.note}</p>
          )}
        </div>

        <span className="text-sm whitespace-nowrap text-muted">
          Sıra: {category.order}
        </span>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-white hover:text-brand"
          title="Kategoriyi düzenle"
          aria-label="Kategoriyi düzenle"
        >
          <Pencil className="size-4" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
          title="Kategoriyi sil"
          aria-label="Kategoriyi sil"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </header>

      {confirming && (
        <div className="flex flex-wrap items-center gap-3 bg-danger-soft px-5 py-4">
          <p className="flex-1 text-sm font-medium text-navy">
            <strong>{category.title}</strong> kategorisi ve içindeki{" "}
            {category.items.length} işlem silinecek. Emin misiniz?
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteCategory(category.id);
                router.refresh();
              })
            }
          >
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Sil
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            Vazgeç
          </Button>
        </div>
      )}

      <ul className="px-5">
        {category.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onEdit={() => {
              setAddingItem(false);
              setEditingItem(item);
            }}
          />
        ))}

        {category.items.length === 0 && (
          <li className="py-6 text-center text-sm text-muted">
            Bu kategoride henüz işlem yok.
          </li>
        )}
      </ul>

      <div className="px-5 pt-2 pb-5">
        {addingItem || editingItem ? (
          <ItemForm
            key={editingItem?.id ?? "new"}
            categoryId={category.id}
            item={editingItem}
            onDone={closeItem}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingItem(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <Plus className="size-4" aria-hidden />
            İşlem ekle
          </button>
        )}
      </div>
    </section>
  );
}

function ItemRow({ item, onEdit }: { item: PriceItem; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-dashed border-line py-3 last:border-0">
      <span className="min-w-0 flex-1">
        <span className="block text-[0.9375rem] text-navy">{item.name}</span>
        {item.note && (
          <span className="block text-xs text-muted">{item.note}</span>
        )}
      </span>

      <span className="font-head font-bold whitespace-nowrap text-brand tabular-nums">
        {item.price}
      </span>

      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-cream hover:text-brand"
        title="Düzenle"
        aria-label={`${item.name} düzenle`}
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
        title="Sil"
        aria-label={`${item.name} sil`}
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>

      {confirming && (
        <span className="flex w-full items-center gap-3 rounded-lg bg-danger-soft px-3 py-2">
          <span className="flex-1 text-sm text-navy">Silinsin mi?</span>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await deleteItem(item.id);
                router.refresh();
              })
            }
          >
            Sil
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirming(false)}
          >
            Vazgeç
          </Button>
        </span>
      )}
    </li>
  );
}

function CategoryForm({
  category,
  onDone,
}: {
  category: PriceCategory | null;
  onDone: () => void;
}) {
  const action = saveCategory.bind(null, category?.id ?? null);
  const [state, formAction, pending] = useActionState<PriceState, FormData>(
    action,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (!state?.ok) return;
    const timer = setTimeout(() => {
      router.refresh();
      onDone();
    }, 700);
    return () => clearTimeout(timer);
  }, [state, router, onDone]);

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-card border-2 border-brand-line bg-white p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-head text-lg font-bold text-navy">
          {category ? "Kategoriyi düzenle" : "Yeni kategori"}
        </h2>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-cream hover:text-navy"
          aria-label="Kapat"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Kategori adı" htmlFor="title" required>
          <Input
            id="title"
            name="title"
            defaultValue={category?.title ?? ""}
            placeholder="Aşılar"
          />
        </Field>

        <Field label="Not" htmlFor="note" hint="Başlığın altında görünür">
          <Input id="note" name="note" defaultValue={category?.note ?? ""} />
        </Field>

        <Field label="Sıra" htmlFor="order">
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={category?.order ?? 0}
          />
        </Field>
      </div>

      <FormFooter
        state={state}
        pending={pending}
        label={category ? "Güncelle" : "Ekle"}
        sticky={false}
      />
    </form>
  );
}

function ItemForm({
  categoryId,
  item,
  onDone,
}: {
  categoryId: string;
  item: PriceItem | null;
  onDone: () => void;
}) {
  const action = saveItem.bind(null, item?.id ?? null);
  const [state, formAction, pending] = useActionState<PriceState, FormData>(
    action,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (!state?.ok) return;
    const timer = setTimeout(() => {
      router.refresh();
      onDone();
    }, 600);
    return () => clearTimeout(timer);
  }, [state, router, onDone]);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border-2 border-brand-line bg-cream p-4"
    >
      <input type="hidden" name="categoryId" value={categoryId} />

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_2fr_auto]">
        <Field label="İşlem adı" htmlFor={`name-${item?.id ?? "new"}`} required>
          <Input
            id={`name-${item?.id ?? "new"}`}
            name="name"
            defaultValue={item?.name ?? ""}
            placeholder="Kuduz Aşısı"
          />
        </Field>

        <Field label="Ücret" htmlFor={`price-${item?.id ?? "new"}`} required>
          <Input
            id={`price-${item?.id ?? "new"}`}
            name="price"
            defaultValue={item?.price ?? ""}
            placeholder="1.500₺"
          />
        </Field>

        <Field label="Not" htmlFor={`note-${item?.id ?? "new"}`}>
          <Input
            id={`note-${item?.id ?? "new"}`}
            name="note"
            defaultValue={item?.note ?? ""}
            placeholder="Irk ve kiloya göre değişir"
          />
        </Field>

        <Field label="Sıra" htmlFor={`order-${item?.id ?? "new"}`}>
          <Input
            id={`order-${item?.id ?? "new"}`}
            name="order"
            type="number"
            min={0}
            defaultValue={item?.order ?? 0}
            className="w-20"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {item ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>
          Vazgeç
        </Button>

        {state?.error && (
          <span role="alert" className="text-sm font-medium text-danger">
            {state.error}
          </span>
        )}
        {state?.ok && (
          <span role="status" className="text-sm font-medium text-success">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
