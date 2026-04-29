import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  date,
  integer,
} from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  isSubsidized: boolean("is_subsidized").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceLogs = pgTable(
  "attendance_logs",
  {
    id: serial("id").primaryKey(),
    memberId: integer("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    semesterId: integer("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    loggedAt: timestamp("logged_at").defaultNow().notNull(),
    loggedBy: text("logged_by").notNull(),
  }
);

export const compMembers = pgTable("comp_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  year: text("year").notNull(),
  events: text("events").array().notNull().default([]),
  bio: text("bio"),
  headshotUrl: text("headshot_url"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleryAlbums = pgTable("gallery_albums", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  cloudinaryId: text("cloudinary_id").notNull(),
  secureUrl: text("secure_url").notNull(),
  filename: text("filename").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  albumId: integer("album_id").references(() => galleryAlbums.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  role: text("role", { enum: ["president", "eboard"] }).notNull(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Member = typeof members.$inferSelect;
export type Semester = typeof semesters.$inferSelect;
export type AttendanceLog = typeof attendanceLogs.$inferSelect;
export type CompMember = typeof compMembers.$inferSelect;
export type GalleryAlbum = typeof galleryAlbums.$inferSelect;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
