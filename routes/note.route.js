import { Router } from "express";
import {
	getNotes,
	getNotesByBookId,
	createNote,
	updateNote,
	deleteNote,
} from "../controllers/note.controller.js";

const router = Router();

// GET all notes
router.get("/", getNotes);

// GET notes by book ID
router.get("/book/:bookId", getNotesByBookId);

// CREATE note
router.post("/", createNote);

// UPDATE note
router.patch("/:id", updateNote);

// DELETE note
router.delete("/:id", deleteNote);

export default router;
