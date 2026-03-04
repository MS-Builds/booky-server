import { prisma } from "../config/prisma.js";
import { formatZodError } from "../config/zodFormat.js";
import { bookIdSchema } from "../validation/book.validate.js";
import {
	noteIdSchema,
	noteSchema,
	noteUpdateSchema,
} from "../validation/note.validate.js";

/* ---------------- GET ALL NOTES ---------------- */
export const getNotes = async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.max(10, parseInt(req.query.limit) || 10);
		const offset = (page - 1) * limit;

		const { userId } = await req.auth();

		const [notes, count] = await Promise.all([
			await prisma.note.findMany({
				where: {
					user: { clerkId: userId },
				},
				orderBy: { createdAt: "desc" },
				skip: offset,
				take: limit,
				include: {
					book: {
						select: {
							title: true, // only fetch book title
						},
					},
				},
			}),

			await prisma.note.count(),
		]);

		// Optional: map to include bookName directly
		const notesWithBookName = notes.map((note) => ({
			...note,
			bookName: note.book?.title || null,
			book: undefined, // remove nested book object if you want only name
		}));

		return res.status(200).json({
			notes: notesWithBookName,
			count,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to fetch notes" });
	}
};
/* ---------------- GET NOTES BY BOOK ID ---------------- */
export const getNotesByBookId = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const validate = bookIdSchema.safeParse(req.params);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const { bookId } = validate.data;
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.max(1, parseInt(req.query.limit) || 10);
		const skip = (page - 1) * limit;

		const [notes, count] = await Promise.all([
			prisma.note.findMany({
				where: {
					user: { clerkId: userId },
					book: {
						id: bookId
					},
				},
				include: {
					book: {
						select: {
							title: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.note.count({
				where: {
					user: { clerkId: userId },
					bookId,
				},
			}),
		]);

		return res.status(200).json({ notes, count });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to fetch notes" });
	}
};

/* ---------------- CREATE NOTE ---------------- */
export const createNote = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const validate = noteSchema.safeParse(req.body);

		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const { bookId, ...data } = validate.data;

		const book = await prisma.book.findFirst({
			where: {
				id: bookId,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		const note = await prisma.note.create({
			data: {
				...data,
				book: {
					connect: {
						id: bookId,
					},
				},
				user: {
					connect: {
						clerkId: userId,
					},
				},
			},
		});

		return res.status(201).json(note);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to create note" });
	}
};

/* ---------------- UPDATE NOTE ---------------- */
export const updateNote = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const paramValidate = noteIdSchema.safeParse(req.params);
		if (!paramValidate.success) {
			return res.status(400).json({
				error: formatZodError(paramValidate.error),
			});
		}

		const bodyValidate = noteUpdateSchema.safeParse(req.body);
		if (!bodyValidate.success) {
			return res.status(400).json({
				error: formatZodError(bodyValidate.error),
			});
		}

		const { id } = paramValidate.data;
		const data = bodyValidate.data;
		const note = await prisma.note.findFirst({
			where: {
				id,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		const updatedNote = await prisma.note.update({
			where: { id },
			data: {
				title: data.title,
				content: data.content,
				page: data.page
			},
		});

		return res.status(200).json(updatedNote);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to update note" });
	}
};

/* ---------------- DELETE NOTE ---------------- */
export const deleteNote = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const validate = noteIdSchema.safeParse(req.params);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const { id } = validate.data;

		const note = await prisma.note.findFirst({
			where: {
				id,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		await prisma.note.delete({
			where: { id },
		});

		return res.status(200).json({
			message: "Note deleted successfully",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to delete note" });
	}
};
