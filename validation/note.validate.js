import * as z from "zod";

const mongoIdSchema = z
	.string()
	.regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const noteIdSchema = z.object({
	id: mongoIdSchema,
});

export const noteSchema = z.object({
	title: z.string().min(1, "Title is required"),

	content: z.string().min(1, "Content is required"),

	bookId: mongoIdSchema,

	color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color hex code").optional(),

	pin: z.boolean().optional(),
});

export const noteUpdateSchema = noteSchema.omit({ bookId: true }).partial().extend({
	title: z.string().min(1, "Title is required").optional(),
	content: z.string().min(1, "Content is required").optional(),
	page: z.number().int().nonnegative().optional(),
	color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color hex code").optional(),
	pin: z.boolean().optional(),
});
