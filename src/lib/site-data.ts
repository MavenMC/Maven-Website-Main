import "server-only";
import { dbQuery } from "@/lib/db";

export type SiteStat = {
  id: number;
  label: string;
  value: string;
};

export type SitePost = {
  id: number;
  type: "news" | "blog" | "patch";
  title: string;
  summary: string | null;
  tag: string | null;
  cover: string | null;
  cover_label: string | null;
  published_at: Date | string | null;
};

export type SiteChangelogEntry = {
  id: number;
  version: string;
  title: string;
  items_json: string | null;
  published_at: Date | string | null;
};

export type SiteForumCategory = {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  variant: string | null;
};

export type SiteSocialLink = {
  id: number;
  label: string;
  url: string;
  icon: string | null;
};

export type SiteAnnouncement = {
  id: number;
  title: string;
  highlight: string | null;
  ip_text: string | null;
};

export async function getSiteAnnouncement() {
  try {
    const rows = await dbQuery<SiteAnnouncement[]>(
      `SELECT id, title, highlight, ip_text
       FROM site_announcements
       WHERE active = 1
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at >= NOW())
       ORDER BY sort_order ASC, id DESC
       LIMIT 1`,
    );
    return rows[0] ?? null;
  } catch (error) {
    console.warn('Tabela site_announcements não existe ou erro ao buscar anúncio:', error);
    return null;
  }
}

export async function getSiteStats(limit?: number) {
  try {
    const limitClause = limit ? `LIMIT ${Number(limit)}` : "";
    return await dbQuery<SiteStat[]>(
      `SELECT id, label, value
       FROM site_stats
       WHERE active = 1
       ORDER BY sort_order ASC, id ASC
       ${limitClause}`,
    );
  } catch (error) {
    console.warn('Tabela site_stats não existe ou erro ao buscar estatísticas:', error);
    return [];
  }
}

export async function getSitePosts(type: SitePost["type"], limit?: number) {
  try {
    const limitClause = limit ? `LIMIT ${Number(limit)}` : "";
    return await dbQuery<SitePost[]>(
      `SELECT id, type, title, summary, tag, cover, cover_label, published_at
       FROM site_posts
       WHERE type = :type AND active = 1
       ORDER BY published_at DESC, sort_order ASC, id DESC
       ${limitClause}`,
      { type },
    );
  } catch (error) {
    console.warn('Tabela site_posts não existe ou erro ao buscar posts:', error);
    return [];
  }
}

export async function getChangelogEntries(limit?: number) {
  try {
    const limitClause = limit ? `LIMIT ${Number(limit)}` : "";
    return await dbQuery<SiteChangelogEntry[]>(
      `SELECT id, version, title, items_json, published_at
       FROM site_changelog_entries
       WHERE active = 1
       ORDER BY published_at DESC, sort_order ASC, id DESC
       ${limitClause}`,
    );
  } catch (error) {
    console.warn('Tabela site_changelog_entries não existe ou erro ao buscar changelog:', error);
    return [];
  }
}

export async function getForumCategories(limit?: number) {
  try {
    const limitClause = limit ? `LIMIT ${Number(limit)}` : "";
    return await dbQuery<SiteForumCategory[]>(
      `SELECT id, title, description, icon, variant
       FROM site_forum_categories
       WHERE active = 1
       ORDER BY sort_order ASC, id ASC
       ${limitClause}`,
    );
  } catch (error) {
    console.warn('Tabela site_forum_categories não existe ou erro ao buscar categorias:', error);
    return [];
  }
}

export async function getSocialLinks(limit?: number) {
  try {
    const limitClause = limit ? `LIMIT ${Number(limit)}` : "";
    return await dbQuery<SiteSocialLink[]>(
      `SELECT id, label, url, icon
       FROM site_social_links
       WHERE active = 1
       ORDER BY sort_order ASC, id ASC
       ${limitClause}`,
    );
  } catch (error) {
    console.warn('Tabela site_social_links não existe ou erro ao buscar links sociais:', error);
    return [];
  }
}
