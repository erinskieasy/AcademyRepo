import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Courses table - stores courses that contain sections
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sections table - stores sections within courses
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assets table - stores all types of assets (video files, video links, audio files, general links)
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'video_file' | 'video_link' | 'audio_file' | 'link'
  title: text("title").notNull(),
  url: text("url").notNull(),
  metadata: jsonb("metadata"), // stores additional info like file size, duration, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quizzes table - stores quiz documents with questions and answers
export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  json: jsonb("json").notNull(), // stores the quiz questions and answers
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for validation
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

// Quiz JSON structure validation
export const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correctAnswer: z.number().min(0, "Correct answer index required"),
}).refine(
  (data) => data.correctAnswer < data.options.length,
  { message: "Correct answer index must be within options range", path: ["correctAnswer"] }
);

export const quizJsonSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1, "At least 1 question required"),
});

// Types
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizJson = z.infer<typeof quizJsonSchema>;

// Asset type constants
export const ASSET_TYPES = {
  VIDEO_FILE: 'video_file',
  VIDEO_LINK: 'video_link',
  AUDIO_FILE: 'audio_file',
  LINK: 'link',
} as const;

export type AssetType = typeof ASSET_TYPES[keyof typeof ASSET_TYPES];
