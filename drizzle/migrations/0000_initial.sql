CREATE TABLE `entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `type` text NOT NULL,
  `amount` integer NOT NULL,
  `date` text NOT NULL,
  `category` text NOT NULL,
  `title` text,
  `payment_method` text,
  `note` text,
  `source` text DEFAULT 'manual' NOT NULL,
  `raw_text` text,
  `image_path` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entries_date_idx` ON `entries` (`date`);
--> statement-breakpoint
CREATE INDEX `entries_type_idx` ON `entries` (`type`);
--> statement-breakpoint
CREATE INDEX `entries_category_idx` ON `entries` (`category`);
--> statement-breakpoint
CREATE TABLE `tags` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `color` text DEFAULT '#1677ff' NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);
--> statement-breakpoint
CREATE TABLE `entry_tags` (
  `entry_id` integer NOT NULL,
  `tag_id` integer NOT NULL,
  PRIMARY KEY(`entry_id`, `tag_id`),
  FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
