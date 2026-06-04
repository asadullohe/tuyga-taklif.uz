"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type InvitationDeleteButtonProps = {
  invitationId: string;
  title: string;
  redirectTo?: string;
};

export function InvitationDeleteButton({ invitationId, title, redirectTo }: InvitationDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function closeModal() {
    if (isDeleting) return;
    setOpen(false);
    setError(null);
  }

  async function deleteInvitation() {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setError("Taklifnoma o'chirilmadi. Qayta urinib ko'ring.");
        setIsDeleting(false);
        return;
      }

      setOpen(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setError("Taklifnoma o'chirilmadi. Internet aloqasini tekshiring.");
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        O'chirish
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-invitation-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-lg border border-red-950/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">Tasdiqlash</p>
                <h2 id="delete-invitation-title" className="mt-2 text-xl font-semibold text-slate-950">
                  Taklifnomani o'chirasizmi?
                </h2>
              </div>
              <button
                type="button"
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                onClick={closeModal}
                disabled={isDeleting}
                aria-label="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <p className="text-sm leading-6 text-slate-600">
                <b className="font-semibold text-slate-950">{title}</b> butunlay o'chadi. Public link,
                RSVP javoblar va analytics yozuvlari ham o'chiriladi.
              </p>

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isDeleting}>
                Bekor qilish
              </Button>
              <Button type="button" variant="destructive" onClick={deleteInvitation} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
