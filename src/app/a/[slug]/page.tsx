import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InvitationPreview } from "@/components/invitation-preview";
import { QrCodeCard } from "@/components/qr-code-card";
import { RsvpForm } from "@/components/rsvp-form";
import { ShareButton } from "@/components/share-button";
import { getInvitationBySlug, trackEvent } from "@/lib/db";
import { appUrl } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return {};

  const title = `${invitation.formData.groomName} va ${invitation.formData.brideName} to'y taklifnomasi`;
  const description = `${invitation.formData.venueName}, ${invitation.formData.eventDate}`;
  const url = `${appUrl()}/a/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default async function PublicInvitationPage({ params }: PageProps) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) notFound();

  await trackEvent(invitation.id, "opened");
  const publicUrl = `${appUrl()}/a/${slug}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <InvitationPreview data={invitation.formData} variant={invitation.templateId} className="max-w-[520px]" />
        </section>
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <RsvpForm slug={slug} />
          <QrCodeCard value={publicUrl} />
          <ShareButton slug={slug} url={publicUrl} />
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="font-medium text-primary">
              tuyga-taklif.uz
            </Link>{" "}
            orqali yaratildi
          </p>
        </aside>
      </div>
    </main>
  );
}
