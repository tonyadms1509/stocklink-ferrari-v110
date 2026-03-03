export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      payouts: [
        { promoter: "John", amount: 1200, status: "confirmed" },
        { promoter: "Lisa", amount: 800, status: "pending" },
      ],
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
