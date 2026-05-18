import { NewInvitationClient } from "@/app/dashboard/new/new-invitation-client";
import { getActiveTemplates } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function NewInvitationPage() {
  await requireUser();
  const templates = await getActiveTemplates();
  return <NewInvitationClient templates={templates} />;
}
