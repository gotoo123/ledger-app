import { sqliteTable, integer, text, primaryKey, index } from "drizzle-orm/sqlite-core";

export const entries = sqliteTable(
  "entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type", { enum: ["expense", "income"] }).notNull(),
    amount: integer("amount").notNull(),
    date: text("date").notNull(),
    category: text("category").notNull(),
    title: text("title"),
    paymentMethod: text("payment_method"),
    note: text("note"),
    source: text("source", { enum: ["manual", "text", "voice", "image"] }).notNull().default("manual"),
    rawText: text("raw_text"),
    imagePath: text("image_path"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("entries_date_idx").on(table.date),
    index("entries_type_idx").on(table.type),
    index("entries_category_idx").on(table.category),
  ],
);

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#1677ff"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const entryTags = sqliteTable(
  "entry_tags",
  {
    entryId: integer("entry_id")
      .notNull()
      .references(() => entries.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.entryId, table.tagId] })],
);

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
