import { prisma } from "../config/prisma.js";
import { formatZodError } from "../config/zodFormat.js";
import {
	bookIdSchema,
	bookSchema,
	bookUpdateSchema,
} from "../validation/book.validate.js";

/* ---------------- GET ALL BOOKS ---------------- */
export const getBooks = async (req, res) => {
	try {
		const page = req.query.page ? parseInt(req.query.page) : 1;
		const limit = req.query.limit ? parseInt(req.query.limit) : 10;
		const { userId } = await req.auth();
		const offset = (page - 1) * limit;
		const [books, count] = await Promise.all([
			await prisma.book.findMany({
				where: {
					user: {
						clerkId: userId,
					},
				},
				orderBy: { createdAt: "desc" },
				skip: offset,
				take: limit,
			}),
			await prisma.book.count(),
		]);
		return res.status(200).json({
			books,
			count,
		});
	} catch (error) {
		console.log(error);
		console.log(error?.message);
		return res.status(500).json({ error: "Failed to fetch books" });
	}
};

/* ---------------- GET BOOK BY ID ---------------- */
export const getBookById = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const validate = bookIdSchema.safeParse(req.params);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const { bookId } = validate.data;

		const book = await prisma.book.findFirst({
			where: {
				id: bookId,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!book) {
			return res.status(404).json({ message: "Not found" });
		}

		return res.status(200).json(book);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to fetch book" });
	}
};

/* ---------------- CREATE BOOK ---------------- */
export const createBook = async (req, res) => {
	try {
		const { userId } = await req.auth();

		const validate = await bookSchema.safeParseAsync(req.body);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}

		const createdBook = await prisma.book.create({
			data: {
				...validate.data,
				user: {
					connect: {
						clerkId: userId,
					},
				},
			},
		});

		return res.status(201).json({
			data: createdBook,
			message: "Book created successfully",
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: error.message || "Failed to create book" });
	}
};

/* ---------------- UPDATE BOOK ---------------- */
export const updateBook = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const idValidate = await bookIdSchema.safeParseAsync(req.params);

		if (!idValidate.success) {
			return res.status(400).json({
				error: formatZodError(idValidate.error),
			});
		}
		const { bookId: id } = idValidate.data;
		const validate = await bookUpdateSchema.safeParseAsync(req.body);
		if (!validate.success) {
			return res.status(400).json({
				error: formatZodError(validate.error),
			});
		}
		const book = await prisma.book.findFirst({
			where: {
				id,
				user: {
					clerkId: userId,
				},
			},
		});

		if (!book) {
			return res.status(404).json({ message: "Not found" });
		}

		const updatedBook = await prisma.book.update({
			where: { id },
			data: validate.data,
		});

		return res.status(200).json({
			data: updatedBook,
			message: "Book updated successfully",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to update book" });
	}
};

/* ---------------- DELETE BOOK(S) ---------------- */
export const deleteBook = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const { ids } = req.body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: "Ids array required" });
		}

		const result = await prisma.book.deleteMany({
			where: {
				user: {
					clerkId: userId,
				},
				id: { in: ids },
			},
		});

		if (result.count === 0) {
			return res.status(404).json({ message: "Not found" });
		}

		return res.status(200).json({
			count: result.count,
			message: "Deleted book(s) successfully",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Failed to delete book" });
	}
};
