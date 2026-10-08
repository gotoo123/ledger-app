import { z } from "zod";
import { CATEGORIES, ENTRY_SOURCES, ENTRY_TYPES } from "./constants";
import { yuanToCents } from "./money";

export const entryInputSchema = z.object({
  type: z.enum(ENTRY_TYPES),
  amount: z.union([z.number().nonnegative(), z.string().min(1)]).transform((value, ctx) => {
    try {
      return yuanToCents(value);
    } catch (error) {
      ctx.addIssue({ code: "custom", message: error instanceof Error ? error.message : "金额格式错误" });
      return z.NEVER;
    }
  }),
  date: z.string().min(1),
  category: z.enum(CATEGORIES).catch("其他"),
  title: z.string().trim().max(100).optional().nullable(),
  paymentMethod: z.string().trim().max(40).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
  source: z.enum(ENTRY_SOURCES).default("manual"),
  rawText: z.string().trim().max(2000).optional().nullable(),
  imagePath: z.string().trim().max(500).optional().nullable(),
  tagIds: z.array(z.number().int().positive()).default([]),
});

export const entryUpdateSchema = entryInputSchema.partial().extend({
  tagIds: z.array(z.number().int().positive()).optional(),
});

export const tagInputSchema = z.object({
  name: z.string().trim().min(1, "标签名不能为空").max(30, "标签名太长"),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "颜色必须是十六进制色值").default("#1677ff"),
});

export type EntryInput = z.input<typeof entryInputSchema>;
export type EntryUpdateInput = z.input<typeof entryUpdateSchema>;
export type TagInput = z.input<typeof tagInputSchema>;
