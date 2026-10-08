import { getSqlite } from "./db";

const sqlite = getSqlite();
import { entryInputSchema, entryUpdateSchema, type EntryInput, type EntryUpdateInput } from "./validation";

export type EntryTag = {
  id: number;
  name: string;
  color: string;
};

export type LedgerEntry = {
  id: number;
  type: "expense" | "income";
  amount: number;
  date: string;
  category: string;
  title: string | null;
  paymentMethod: string | null;
  note: string | null;
  source: "manual" | "text" | "voice" | "image";
  rawText: string | null;
  imagePath: string | null;
  createdAt: string;
  updatedAt: string;
  tags: EntryTag[];
};

type EntryRow = Omit<LedgerEntry, "paymentMethod" | "rawText" | "imagePath" | "createdAt" | "updatedAt" | "tags"> & {
  payment_method: string | null;
  raw_text: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

type EntryFilters = {
  date?: string;
  from?: string;
  to?: string;
  type?: string;
  category?: string;
  tagId?: number;
};

function mapEntry(row: EntryRow, tags: EntryTag[]): LedgerEntry {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    date: row.date,
    category: row.category,
    title: row.title,
    paymentMethod: row.payment_method,
    note: row.note,
    source: row.source,
    rawText: row.raw_text,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags,
  };
}

function getTagsByEntryIds(entryIds: number[]) {
  if (entryIds.length === 0) return new Map<number, EntryTag[]>();

  const placeholders = entryIds.map(() => "?").join(", ");
  const rows = sqlite
    .prepare(
      `SELECT entry_tags.entry_id AS entryId, tags.id, tags.name, tags.color
       FROM entry_tags
       JOIN tags ON tags.id = entry_tags.tag_id
       WHERE entry_tags.entry_id IN (${placeholders})
       ORDER BY tags.name ASC`,
    )
    .all(...entryIds) as Array<EntryTag & { entryId: number }>;

  const tagMap = new Map<number, EntryTag[]>();
  for (const row of rows) {
    const tags = tagMap.get(row.entryId) ?? [];
    tags.push({ id: row.id, name: row.name, color: row.color });
    tagMap.set(row.entryId, tags);
  }
  return tagMap;
}

function buildWhere(filters: EntryFilters) {
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.date) {
    clauses.push("entries.date >= ? AND entries.date <= ?");
    params.push(`${filters.date}T00:00:00.000`, `${filters.date}T23:59:59.999`);
  }

  if (filters.from) {
    clauses.push("entries.date >= ?");
    params.push(`${filters.from}T00:00:00.000`);
  }

  if (filters.to) {
    clauses.push("entries.date <= ?");
    params.push(`${filters.to}T23:59:59.999`);
  }

  if (filters.type && filters.type !== "all") {
    clauses.push("entries.type = ?");
    params.push(filters.type);
  }

  if (filters.category && filters.category !== "all") {
    clauses.push("entries.category = ?");
    params.push(filters.category);
  }

  if (filters.tagId) {
    clauses.push("entries.id IN (SELECT entry_id FROM entry_tags WHERE tag_id = ?)");
    params.push(filters.tagId);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export function listEntries(filters: EntryFilters = {}) {
  const { where, params } = buildWhere(filters);
  const rows = sqlite
    .prepare(
      `SELECT entries.*
       FROM entries
       ${where}
       ORDER BY entries.date DESC, entries.id DESC`,
    )
    .all(...params) as EntryRow[];
  const tagMap = getTagsByEntryIds(rows.map((row) => row.id));
  return rows.map((row) => mapEntry(row, tagMap.get(row.id) ?? []));
}

export function getEntry(id: number) {
  const row = sqlite.prepare("SELECT * FROM entries WHERE id = ?").get(id) as EntryRow | undefined;
  if (!row) return null;
  return mapEntry(row, getTagsByEntryIds([id]).get(id) ?? []);
}

export function createEntry(input: EntryInput) {
  const data = entryInputSchema.parse(input);
  const now = new Date().toISOString();

  const transaction = sqlite.transaction(() => {
    const result = sqlite
      .prepare(
        `INSERT INTO entries (type, amount, date, category, title, payment_method, note, source, raw_text, image_path, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        data.type,
        data.amount,
        data.date,
        data.category,
        data.title || null,
        data.paymentMethod || null,
        data.note || null,
        data.source,
        data.rawText || null,
        data.imagePath || null,
        now,
        now,
      );

    const entryId = Number(result.lastInsertRowid);
    for (const tagId of data.tagIds) {
      sqlite.prepare("INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)").run(entryId, tagId);
    }
    return entryId;
  });

  return getEntry(transaction());
}

export function updateEntry(id: number, input: EntryUpdateInput) {
  const current = getEntry(id);
  if (!current) return null;

  const data = entryUpdateSchema.parse(input);
  const next = {
    type: data.type ?? current.type,
    amount: data.amount ?? current.amount,
    date: data.date ?? current.date,
    category: data.category ?? current.category,
    title: data.title === undefined ? current.title : data.title || null,
    paymentMethod: data.paymentMethod === undefined ? current.paymentMethod : data.paymentMethod || null,
    note: data.note === undefined ? current.note : data.note || null,
    source: data.source ?? current.source,
    rawText: data.rawText === undefined ? current.rawText : data.rawText || null,
    imagePath: data.imagePath === undefined ? current.imagePath : data.imagePath || null,
    tagIds: data.tagIds ?? current.tags.map((tag) => tag.id),
  };
  const now = new Date().toISOString();

  const transaction = sqlite.transaction(() => {
    sqlite
      .prepare(
        `UPDATE entries
         SET type = ?, amount = ?, date = ?, category = ?, title = ?, payment_method = ?, note = ?, source = ?, raw_text = ?, image_path = ?, updated_at = ?
         WHERE id = ?`,
      )
      .run(
        next.type,
        next.amount,
        next.date,
        next.category,
        next.title,
        next.paymentMethod,
        next.note,
        next.source,
        next.rawText,
        next.imagePath,
        now,
        id,
      );

    sqlite.prepare("DELETE FROM entry_tags WHERE entry_id = ?").run(id);
    for (const tagId of next.tagIds) {
      sqlite.prepare("INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)").run(id, tagId);
    }
  });

  transaction();
  return getEntry(id);
}

export function deleteEntry(id: number) {
  const result = sqlite.prepare("DELETE FROM entries WHERE id = ?").run(id);
  return result.changes > 0;
}
