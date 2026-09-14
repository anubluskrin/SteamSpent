import { resolveToSteamId64, getOwnedGames } from "../src/services/steamUser.service.js";
import { getPricesForGames } from "../src/services/steamPrice.service.js";
import { prisma } from "../lib/prisma.js";

export default async function handler(req, res) {
  // CORS: izinkan diakses dari domain frontend Vercel kamu
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Username wajib diisi" });
  }

  try {
    const steamId64 = await resolveToSteamId64(username);
    const games = await getOwnedGames(steamId64);
    const gamesWithPrices = await getPricesForGames(games);

    const total = gamesWithPrices.reduce((sum, g) => sum + g.price, 0);
    const totalAfterDiscount = gamesWithPrices.reduce(
      (sum, g) => sum + (g.discountPrice ?? g.price),
      0
    );

    prisma.searchLog
      .create({
        data: { steamId64, vanityName: username, totalPrice: total },
      })
      .catch(() => {});

    return res.status(200).json({
      username,
      steamId64,
      totalGames: gamesWithPrices.length,
      totalPrice: total,
      totalPriceAfterDiscount: totalAfterDiscount,
      currency: gamesWithPrices[0]?.currency ?? "IDR",
      games: gamesWithPrices,
    });
  } catch (err) {
    if (err.message === "USERNAME_NOT_FOUND") {
      return res.status(404).json({
        error:
          "Username tidak ditemukan. Kalau ini nama tampilan (bukan link), coba paste link profil Steam kamu, contoh: steamcommunity.com/profiles/7656...",
      });
    }
    if (err.message === "LIBRARY_EMPTY_OR_PRIVATE") {
      return res
        .status(403)
        .json({ error: "Library kosong atau profil di-private" });
    }

    console.error(err);
    return res.status(500).json({ error: "Terjadi kesalahan di server" });
  }
}