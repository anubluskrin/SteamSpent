import axios from "axios";
import { getCachedPrice, savePriceToCache } from "./cache.service.js";

const STORE_URL = "https://store.steampowered.com/api/appdetails";
const DELAY_MS = 300; // jeda antar request biar tidak kena rate-limit

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch harga satu game langsung dari Steam Store API.
 */
async function fetchPriceFromStore(appid, cc = "id") {
  const { data } = await axios.get(STORE_URL, {
    params: { appids: appid, cc, filters: "price_overview,is_free" },
  });

  const entry = data[appid];

  if (!entry || !entry.success) {
    // Game tidak ditemukan / sudah dihapus dari store
    return { price: 0, discountPrice: null, currency: "IDR", isFree: false };
  }

  const details = entry.data;

  if (details.is_free) {
    return { price: 0, discountPrice: null, currency: "IDR", isFree: true };
  }

  if (!details.price_overview) {
    // Game berbayar tapi entah kenapa tidak ada info harga (jarang terjadi)
    return { price: 0, discountPrice: null, currency: "IDR", isFree: false };
  }

  return {
    price: details.price_overview.initial / 100, // Steam kasih harga dalam sen
    discountPrice: details.price_overview.final / 100,
    currency: details.price_overview.currency,
    isFree: false,
  };
}

/**
 * Ambil harga untuk banyak game sekaligus: cek cache dulu,
 * baru fetch dari Steam Store untuk yang belum ada / expired.
 */
export async function getPricesForGames(games) {
  const results = [];

  for (const game of games) {
    let priceData = await getCachedPrice(game.appid);

    if (!priceData) {
      priceData = await fetchPriceFromStore(game.appid);
      await savePriceToCache(game.appid, game.name, priceData);
      await sleep(DELAY_MS); // hanya delay kalau benar-benar hit API luar
    }

    results.push({
      appid: game.appid,
      name: game.name,
      price: Number(priceData.price),
      discountPrice: priceData.discountPrice
        ? Number(priceData.discountPrice)
        : null,
      currency: priceData.currency,
      isFree: priceData.isFree,
      coverUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    });
  }

  return results;
}