import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import type { AppUser } from "@/types";

type AppHeaderProps = {
  user?: AppUser | null;
};

export async function AppHeader({ user: providedUser }: AppHeaderProps = {}) {
  const user = providedUser === undefined ? await getCurrentUser() : providedUser;

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#fdfbf7]/95 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <Link href={user ? "/dashboard" : "/"} className="flex min-w-0 items-center">
          <Image
            src="/taklifnoma-header-light-transparent.svg"
            alt="Taklifnoma"
            width={180}
            height={44}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {user ? <HeaderUser user={user} /> : <GuestActions />}
      </div>
    </header>
  );
}

function HeaderUser({ user }: { user: AppUser }) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const subtitle = user.username ? `@${user.username}` : user.role;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-emerald-950/10 bg-white/70 px-2 py-2 shadow-sm sm:gap-3 sm:px-2.5">
      <UserAvatar user={user} />
      <div className="min-w-0 max-w-[120px] text-right sm:max-w-[190px]">
        <p className="truncate text-sm font-semibold leading-5 text-slate-950">{fullName}</p>
        <p className="truncate text-xs leading-4 text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function UserAvatar({ user }: { user: AppUser }) {
  const initials = `${user.firstName?.[0] ?? "U"}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div
      className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-emerald-950/10 bg-[#12382f] bg-cover bg-center text-sm font-semibold text-white shadow-sm"
      style={user.photoUrl ? { backgroundImage: `url(${user.photoUrl})` } : undefined}
      aria-label={user.firstName}
    >
      {user.photoUrl ? null : initials}
    </div>
  );
}

function GuestActions() {
  return (
    <nav className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Kirish</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/dashboard/new">
          <Plus className="h-4 w-4" />
          Yaratish
        </Link>
      </Button>
    </nav>
  );
}
