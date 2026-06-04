import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { makeSlug } from "@/lib/slug";
import { defaultWeddingData, seedTemplates, weddingTemplateFields } from "@/lib/templates";
import type {
  AnalyticsEventType,
  AppUser,
  Invitation,
  InvitationTemplate,
  Rsvp,
  WeddingFormData
} from "@/types";

type TelegramUserInput = {
  telegramId: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
};

type TemplateInput = {
  name: string;
  description: string;
  previewImageUrl?: string | null;
  status: "active" | "inactive";
};

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

type DemoStore = {
  users: AppUser[];
  templates: InvitationTemplate[];
  invitations: Invitation[];
  rsvps: Rsvp[];
};

const globalForDemoStore = globalThis as typeof globalThis & {
  __tuygaTaklifDemoStore?: DemoStore;
};

const memory =
  globalForDemoStore.__tuygaTaklifDemoStore ??
  (globalForDemoStore.__tuygaTaklifDemoStore = {
    users: [],
    templates: [...seedTemplates],
    invitations: [],
    rsvps: []
  });

const globalForTemplateSeed = globalThis as typeof globalThis & {
  __tuygaTaklifTemplatesSeeded?: boolean;
};

function templateToRow(template: InvitationTemplate) {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    description: template.description,
    preview_image_url: template.previewImageUrl,
    template_schema: template.schema,
    status: template.status
  };
}

async function ensureSeedTemplates(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>) {
  if (globalForTemplateSeed.__tuygaTaklifTemplatesSeeded) return;

  const { error } = await supabase.from("templates").upsert(seedTemplates.map(templateToRow), {
    onConflict: "id"
  });

  if (error) {
    console.error("[templates-seed]", error.message);
    return;
  }

  globalForTemplateSeed.__tuygaTaklifTemplatesSeeded = true;
}

function templateFromRow(row: Record<string, any>): InvitationTemplate {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    previewImageUrl: row.preview_image_url,
    schema: row.template_schema,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function userFromRow(row: Record<string, any>): AppUser {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    photoUrl: row.photo_url,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function invitationFromRow(row: Record<string, any>): Invitation {
  return {
    id: row.id,
    userId: row.user_id,
    templateId: row.template_id,
    slug: row.slug,
    formData: row.form_data,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    template: row.templates ? templateFromRow(row.templates) : undefined
  };
}

function rsvpFromRow(row: Record<string, any>): Rsvp {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    guestName: row.guest_name,
    status: row.status,
    guestCount: row.guest_count,
    createdAt: row.created_at
  };
}

function supabaseOrNull() {
  return getSupabaseAdmin();
}

export async function getUserById(userId: string) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (error || !data) return null;
    return userFromRow(data);
  }

  return memory.users.find((user) => user.id === userId) ?? null;
}

export async function upsertTelegramUser(input: TelegramUserInput) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          telegram_id: input.telegramId,
          first_name: input.firstName,
          last_name: input.lastName,
          username: input.username,
          photo_url: input.photoUrl,
          updated_at: now()
        },
        { onConflict: "telegram_id" }
      )
      .select("*")
      .single();

    if (error) throw error;
    return userFromRow(data);
  }

  const existing = memory.users.find((user) => user.telegramId === input.telegramId);
  if (existing) {
    Object.assign(existing, {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      photoUrl: input.photoUrl,
      updatedAt: now()
    });
    return existing;
  }

  const user: AppUser = {
    id: id(),
    telegramId: input.telegramId,
    firstName: input.firstName,
    lastName: input.lastName,
    username: input.username,
    photoUrl: input.photoUrl,
    role: memory.users.length === 0 ? "admin" : "user",
    createdAt: now(),
    updatedAt: now()
  };
  memory.users.push(user);
  return user;
}

export async function getActiveTemplates() {
  const supabase = supabaseOrNull();
  if (supabase) {
    await ensureSeedTemplates(supabase);

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data.map(templateFromRow);
  }

  return memory.templates.filter((template) => template.status === "active");
}

export async function getTemplateById(templateId: string) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase.from("templates").select("*").eq("id", templateId).single();
    if (error || !data) return null;
    return templateFromRow(data);
  }

  return memory.templates.find((template) => template.id === templateId) ?? null;
}

export async function listUserInvitations(userId: string) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("invitations")
      .select("*, templates(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(invitationFromRow);
  }

  return memory.invitations
    .filter((invitation) => invitation.userId === userId)
    .map((invitation) => ({
      ...invitation,
      template: memory.templates.find((template) => template.id === invitation.templateId)
    }));
}

export async function getInvitationForUser(invitationId: string, userId: string) {
  const invitations = await listUserInvitations(userId);
  return invitations.find((invitation) => invitation.id === invitationId) ?? null;
}

export async function createInvitation(userId: string, templateId: string, formData: WeddingFormData) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        user_id: userId,
        template_id: templateId,
        form_data: formData,
        status: "draft"
      })
      .select("*, templates(*)")
      .single();
    if (error) throw error;
    return invitationFromRow(data);
  }

  const invitation: Invitation = {
    id: id(),
    userId,
    templateId,
    slug: null,
    formData,
    status: "draft",
    createdAt: now(),
    updatedAt: now(),
    template: memory.templates.find((template) => template.id === templateId)
  };
  memory.invitations.unshift(invitation);
  return invitation;
}

export async function updateInvitation(invitationId: string, userId: string, formData: WeddingFormData) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("invitations")
      .update({ form_data: formData, updated_at: now() })
      .eq("id", invitationId)
      .eq("user_id", userId)
      .select("*, templates(*)")
      .single();
    if (error) throw error;
    return invitationFromRow(data);
  }

  const invitation = memory.invitations.find((item) => item.id === invitationId && item.userId === userId);
  if (!invitation) return null;
  invitation.formData = formData;
  invitation.updatedAt = now();
  return invitation;
}

export async function publishInvitation(invitationId: string, userId: string) {
  const invitation = await getInvitationForUser(invitationId, userId);
  if (!invitation) return null;

  const baseSlug = makeSlug(`${invitation.formData.groomName}-va-${invitation.formData.brideName}`);
  let slug = baseSlug;
  let counter = 2;
  while (await getInvitationBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("invitations")
      .update({ slug, status: "published", published_at: now(), updated_at: now() })
      .eq("id", invitationId)
      .eq("user_id", userId)
      .select("*, templates(*)")
      .single();
    if (error) throw error;
    return invitationFromRow(data);
  }

  const stored = memory.invitations.find((item) => item.id === invitationId && item.userId === userId);
  if (!stored) return null;
  stored.slug = slug;
  stored.status = "published";
  stored.publishedAt = now();
  stored.updatedAt = now();
  return stored;
}

export async function getInvitationBySlug(slug: string) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("invitations")
      .select("*, templates(*)")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    if (error || !data) return null;
    return invitationFromRow(data);
  }

  const invitation = memory.invitations.find((item) => item.slug === slug && item.status === "published");
  if (!invitation) return null;
  return {
    ...invitation,
    template: memory.templates.find((template) => template.id === invitation.templateId)
  };
}

export async function createRsvp(invitationId: string, input: Omit<Rsvp, "id" | "invitationId" | "createdAt">) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("rsvps")
      .insert({
        invitation_id: invitationId,
        guest_name: input.guestName,
        status: input.status,
        guest_count: input.guestCount
      })
      .select("*")
      .single();
    if (error) throw error;
    return rsvpFromRow(data);
  }

  const rsvp: Rsvp = {
    id: id(),
    invitationId,
    guestName: input.guestName,
    status: input.status,
    guestCount: input.guestCount,
    createdAt: now()
  };
  memory.rsvps.push(rsvp);
  return rsvp;
}

export async function listRsvpsForInvitation(invitationId: string) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .eq("invitation_id", invitationId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map(rsvpFromRow);
  }

  return memory.rsvps
    .filter((rsvp) => rsvp.invitationId === invitationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function trackEvent(
  invitationId: string,
  eventType: AnalyticsEventType,
  metadata?: Record<string, unknown>
) {
  const supabase = supabaseOrNull();
  if (supabase) {
    await supabase.from("analytics_events").insert({
      invitation_id: invitationId,
      event_type: eventType,
      metadata: metadata ?? {}
    });
  }
}

export async function listAdminOverview() {
  const supabase = supabaseOrNull();
  if (supabase) {
    const [templates, invitations, rsvps] = await Promise.all([
      supabase.from("templates").select("*").order("created_at", { ascending: false }),
      supabase.from("invitations").select("*, templates(*)").order("created_at", { ascending: false }).limit(100),
      supabase.from("rsvps").select("*").order("created_at", { ascending: false }).limit(100)
    ]);

    if (templates.error) throw templates.error;
    if (invitations.error) throw invitations.error;
    if (rsvps.error) throw rsvps.error;

    return {
      templates: templates.data.map(templateFromRow),
      invitations: invitations.data.map(invitationFromRow),
      rsvps: rsvps.data.map(rsvpFromRow)
    };
  }

  return {
    templates: memory.templates,
    invitations: memory.invitations.map((invitation) => ({
      ...invitation,
      template: memory.templates.find((template) => template.id === invitation.templateId)
    })),
    rsvps: memory.rsvps
  };
}

export async function createTemplate(input: TemplateInput) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("templates")
      .insert({
        id: makeSlug(input.name),
        name: input.name,
        category: "wedding",
        description: input.description,
        preview_image_url: input.previewImageUrl || null,
        template_schema: weddingTemplateFields,
        status: input.status
      })
      .select("*")
      .single();
    if (error) throw error;
    return templateFromRow(data);
  }

  const template: InvitationTemplate = {
    id: makeSlug(input.name),
    name: input.name,
    category: "wedding",
    description: input.description,
    previewImageUrl: input.previewImageUrl || null,
    schema: weddingTemplateFields,
    status: input.status,
    createdAt: now(),
    updatedAt: now()
  };
  memory.templates.unshift(template);
  return template;
}

export async function updateTemplate(templateId: string, input: Partial<TemplateInput>) {
  const supabase = supabaseOrNull();
  if (supabase) {
    const { data, error } = await supabase
      .from("templates")
      .update({
        name: input.name,
        description: input.description,
        preview_image_url: input.previewImageUrl,
        status: input.status,
        updated_at: now()
      })
      .eq("id", templateId)
      .select("*")
      .single();
    if (error) throw error;
    return templateFromRow(data);
  }

  const template = memory.templates.find((item) => item.id === templateId);
  if (!template) return null;
  Object.assign(template, input, { updatedAt: now() });
  return template;
}

export function demoWeddingData() {
  return defaultWeddingData;
}
