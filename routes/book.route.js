import { Router } from "express";
import {
	getBookById,
	createBook,
	updateBook,
	deleteBook,
	getBooks,
} from "../controllers/book.controller.js";

const router = Router();

// GET all books
router.get("/", getBooks);

// GET single book
router.get("/:bookId", getBookById);

// CREATE book
router.post("/", createBook);

// UPDATE book
router.patch("/:bookId", updateBook);

// DELETE books (bulk delete)
router.delete("/", deleteBook);

export default router;
