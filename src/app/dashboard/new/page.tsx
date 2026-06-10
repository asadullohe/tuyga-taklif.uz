import { NewInvitationClient } from "@/app/dashboard/new/new-invitation-client";
import { AppHeader } from "@/components/app-header";
import { getActiveTemplates } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function NewInvitationPage() {
  const user = await requireUser();
  const templates = await getActiveTemplates();
  return (
    <>
      <AppHeader user={user} />
      <NewInvitationClient templates={templates} />
    </>
  );
}
