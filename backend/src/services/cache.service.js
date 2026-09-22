import { prisma } from "../../lib/prisma.js";

const CACHE_TTL_HOURS = 24;

/**
 * Ambil harga game dari cache DB, return null kalau tidak ada / sudah kadaluarsa.
 */
export async function getCachedPrice(appid) {
  const cached = await prisma.game.findUnique({ where: { appid } });

  if (!cached) return null;

  const ageHours =
    (Date.now() - cached.lastUpdated.getTime()) / (1000 * 60 * 60);

  if (ageHours > CACHE_TTL_HOURS) return null;

  return cached;
}

/**
 * Simpan / update harga game ke cache DB, sekaligus catat ke riwayat harga.
 * Fungsi ini cuma dipanggil kalau harga BENERAN baru di-fetch dari Steam
 * (bukan dari cache) — jadi riwayat otomatis tercatat kira-kira tiap 24 jam
 * per game, seiring cache-nya kadaluarsa dan di-refresh.
 */
export async function savePriceToCache(appid, name, priceData) {
  const [game] = await Promise.all([
    prisma.game.upsert({
      where: { appid },
      update: {
        name,
        price: priceData.price,
        discountPrice: priceData.discountPrice,
        currency: priceData.currency,
        isFree: priceData.isFree,
        lastUpdated: new Date(),
      },
      create: {
        appid,
        name,
        price: priceData.price,
        discountPrice: priceData.discountPrice,
        currency: priceData.currency,
        isFree: priceData.isFree,
      },
    }),
    prisma.priceHistory.create({
      data: {
        appid,
        price: priceData.price,
        discountPrice: priceData.discountPrice,
        currency: priceData.currency,
        isFree: priceData.isFree,
      },
    }),
  ]);

  return game;
}