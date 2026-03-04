import { prisma } from "../config/prisma.js";

export const getDashboard = async (req, res) => {
	try {
		const { userId } = await req.auth();
		const defaultStats = {
			TO_READ: 0,
			IN_PROGRESS: 0,
			COMPLETED: 0,
		};

		const [books, notes, stats, count] = await Promise.all([
			prisma.book.findMany({
				where: {
					user: {
						clerkId: userId,
					},
				},
				orderBy: { createdAt: "desc" },
				take: 5,
			}),
			prisma.note.findMany({
				where: {
					user: {
						clerkId: userId,
					},
				},
				orderBy: { createdAt: "desc" },
				take: 5,
				include: {
					book: {
						select: {
							title: true,
						},
					},
				},
			}),
			prisma.book.groupBy({
				where: {
					user: {
						clerkId: userId,
					},
				},
				by: ["status"],
				_count: {
					id: true,
				},
			}),
			prisma.book.count({
				where: {
					user: {
						clerkId: userId,
					},
				},
			}),
		]);
		const formattedBooksByCategory = stats.reduce((acc, item) => {
			acc[item.status] = item._count.id;
			return acc;
		}, defaultStats);
		return res.status(200).json({
			books,
			notes,
			stats: {
				TOTAL: count,
				...formattedBooksByCategory,
			},
		});
	} catch (error) {
		console.log(error);
		console.log(error?.message);
		return res
			.status(500)
			.json({ error: "Failed to fetch dashboard data" });
	}
};
