import { getSqlite } from "./db";

const sqlite = getSqlite();
import { tagInputSchema, type TagInput } from "./validation";

export type LedgerTag = {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  entryCount: number;
};

type TagRow = {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  entry_count?: number;
};

function mapTag(row: TagRow): LedgerTag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    entryCount: row.entry_count ?? 0,
  };
}

export function listTags() {
  const rows = sqlite
    .prepare(
      `SELECT tags.*, COUNT(entry_tags.entry_id) AS entry_count
       FROM tags
       LEFT JOIN entry_tags ON entry_tags.tag_id = tags.id
       GROUP BY tags.id
       ORDER BY tags.name ASC`,
    )
    .all() as TagRow[];
  return rows.map(mapTag);
}

export function createTag(input: TagInput) {
  const data = tagInputSchema.parse(input);
  const now = new Date().toISOString();
  const result = sqlite
    .prepare("INSERT INTO tags (name, color, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .run(data.name, data.color, now, now);
  return getTag(Number(result.lastInsertRowid));
}

export function getTag(id: number) {
  const row = sqlite
    .prepare(
      `SELECT tags.*, COUNT(entry_tags.entry_id) AS entry_count
       FROM tags
       LEFT JOIN entry_tags ON entry_tags.tag_id = tags.id
       WHERE tags.id = ?
       GROUP BY tags.id`,
    )
    .get(id) as TagRow | undefined;
  return row ? mapTag(row) : null;
}

export function updateTag(id: number, input: TagInput) {
  const data = tagInputSchema.parse(input);
  const now = new Date().toISOString();
  const result = sqlite
    .prepare("UPDATE tags SET name = ?, color = ?, updated_at = ? WHERE id = ?")
    .run(data.name, data.color, now, id);
  return result.changes > 0 ? getTag(id) : null;
}

export function deleteTag(id: number) {
  const transaction = sqlite.transaction(() => {
    sqlite.prepare("DELETE FROM entry_tags WHERE tag_id = ?").run(id);
    return sqlite.prepare("DELETE FROM tags WHERE id = ?").run(id);
  });
  return transaction().changes > 0;
}
