import * as z from "zod";

const mongoIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

// Note
export const noteIdSchema = z.object({
    id: mongoIdSchema,
});

export const noteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    page: z.number().int().nonnegative().default(1),
    pin: z.boolean().default(false),
    bookId: mongoIdSchema,
});

export const noteUpdateSchema = noteSchema.omit({ bookId: true }).partial().extend({
    id: mongoIdSchema,
    title: z.string().min(1, "Title is required").optional(),
    content: z.string().min(1, "Content is required").optional(),
    page: z.number().int().nonnegative().optional(),
    pin: z.boolean().optional(),
});

// Book
export const bookIdSchema = z.object({
    bookId: mongoIdSchema,
});

export const bookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    publishedYear: z.number().int().min(1000).max(new Date().getFullYear()),
    coverImage: z.string().url().optional().or(z.literal("")),
    status: z.enum(["IN_PROGRESS", "COMPLETED", "TO_READ"]).default("TO_READ"),
    readPages: z.number().int().nonnegative().default(0),
    totalPages: z.number().int().positive("Total pages must be at least 1"),
});

export const bookUpdateSchema = bookSchema.partial();