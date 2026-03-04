import "dotenv/config";
import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { inngest, functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import bookRoutes from "./routes/book.route.js";
import noteRoutes from "./routes/note.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import { protect } from "./middlewares/protect.js";

const app = express();
app.use(cors({
    origin: "https://booky-client-js.vercel.app", // your Vite frontend
    credentials: true,
  }));
app.use(express.json());
app.use(clerkMiddleware());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.send("Server is running");
});

// Inngest Routes
app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes
app.use("/api/books", protect, bookRoutes);
app.use("/api/notes", protect, noteRoutes);
app.use("/api/dashboard", protect,dashboardRoutes);

app.listen(PORT, () => {
	console.log(`Server is live at http://localhost:${PORT}`);
});
