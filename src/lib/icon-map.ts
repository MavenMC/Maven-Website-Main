import {
  type LucideIcon,
  Instagram,
  LifeBuoy,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Twitch,
  Users,
  Youtube,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  avisos: Megaphone,
  announcement: Megaphone,
  lifebuoy: LifeBuoy,
  "life-buoy": LifeBuoy,
  suporte: LifeBuoy,
  support: LifeBuoy,
  sparkles: Sparkles,
  sugestoes: Sparkles,
  ideas: Sparkles,
  users: Users,
  clans: Users,
  shieldcheck: ShieldCheck,
  "shield-check": ShieldCheck,
  denuncias: ShieldCheck,
  reports: ShieldCheck,
  messagesquare: MessageSquare,
  "message-square": MessageSquare,
  chat: MessageSquare,
  discord: MessageSquare,
  instagram: Instagram,
  youtube: Youtube,
  twitch: Twitch,
};

export function resolveIcon(name: string | null | undefined, fallback: LucideIcon) {
  if (!name) return fallback;
  const key = name.trim().toLowerCase();
  return ICONS[key] ?? fallback;
}
