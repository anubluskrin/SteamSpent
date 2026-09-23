import { prisma } from "../lib/prisma.js";

const DISTRIBUTION_BUCKETS = [
  { label: "< 500rb", min: 0, max: 500_000 },
  { label: "500rb–2jt", min: 500_000, max: 2_000_000 },
  { label: "2jt–5jt", min: 2_000_000, max: 5_000_000 },
  { label: "5jt–10jt", min: 5_000_000, max: 10_000_000 },
  { label: "> 10jt", min: 10_000_000, max: Infinity },
];

function percentile(sortedValues, p) {
  if (sortedValues.length === 0) return 0;
  const idx = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sortedValues[lower];
  return (
    sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (idx - lower)
  );
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  try {
    const [searchLogs, topGames, totalUniqueGames] = await Promise.all([
      prisma.searchLog.findMany({ select: { totalPrice: true } }),
      prisma.game.findMany({
        orderBy: { timesSeen: "desc" },
        take: 10,
        where: { timesSeen: { gt: 0 } },
        select: { appid: true, name: true, timesSeen: true },
      }),
      prisma.game.count(),
    ]);

    const totalSearches = searchLogs.length;
    const prices = searchLogs
      .map((s) => Number(s.totalPrice))
      .sort((a, b) => a - b);

    const average =
      totalSearches > 0
        ? Math.round(prices.reduce((sum, v) => sum + v, 0) / totalSearches)
        : 0;
    const median = Math.round(percentile(prices, 50));

    const distribution = DISTRIBUTION_BUCKETS.map((bucket) => ({
      label: bucket.label,
      count: prices.filter((p) => p >= bucket.min && p < bucket.max).length,
    }));

    return res.status(200).json({
      totalSearches,
      averageTotalPrice: average,
      medianTotalPrice: median,
      totalUniqueGames,
      distribution,
      topGames: topGames.map((g) => ({
        appid: g.appid,
        name: g.name,
        timesSeen: g.timesSeen,
        coverUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
}