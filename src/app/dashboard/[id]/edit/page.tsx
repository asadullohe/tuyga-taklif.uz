import { notFound } from "next/navigation";
import { EditInvitationClient } from "@/app/dashboard/[id]/edit/edit-invitation-client";
import { AppHeader } from "@/components/app-header";
import { getInvitationForUser } from "@/lib/db";
import { requireUser } from "@/lib/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditInvitationPage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;
  const invitation = await getInvitationForUser(id, user.id);
  if (!invitation) notFound();

  return (
    <>
      <AppHeader user={user} />
      <EditInvitationClient invitation={invitation} />
    </>
  );
}
