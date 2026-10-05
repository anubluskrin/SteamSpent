import axios from "axios";
import {
  getCachedPrice,
  savePriceToCache,
  incrementTimesSeen,
} from "./cache.service.js";

const STORE_URL = "https://store.steampowered.com/api/appdetails";
const BATCH_SIZE = 20; // jumlah game yang diproses bersamaan per batch
const BATCH_DELAY_MS = 120; // jeda antar batch (bukan antar game satu-satu lagi)
const TIME_BUDGET_MS = 55000; // berhenti proses game baru setelah 45 detik

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
    return { price: 0, discountPrice: null, currency: "IDR", isFree: false };
  }

  const details = entry.data;

  if (details.is_free) {
    return { price: 0, discountPrice: null, currency: "IDR", isFree: true };
  }

  if (!details.price_overview) {
    return { price: 0, discountPrice: null, currency: "IDR", isFree: false };
  }

  return {
    price: details.price_overview.initial / 100,
    discountPrice: details.price_overview.final / 100,
    currency: details.price_overview.currency,
    isFree: false,
  };
}

/**
 * Proses satu game: cek cache dulu, fetch dari Steam Store kalau belum ada.
 */
async function processGame(game) {
  let priceData = await getCachedPrice(game.appid);
  let wasFetchedFresh = false;

  if (!priceData) {
    priceData = await fetchPriceFromStore(game.appid);
    await savePriceToCache(game.appid, game.name, priceData);
    wasFetchedFresh = true;
  }

  await incrementTimesSeen(game.appid);

  return {
    result: {
      appid: game.appid,
      name: game.name,
      price: Number(priceData.price),
      discountPrice: priceData.discountPrice
        ? Number(priceData.discountPrice)
        : null,
      currency: priceData.currency,
      isFree: priceData.isFree,
      coverUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    },
    wasFetchedFresh,
  };
}

/**
 * Ambil harga untuk banyak game sekaligus, diproses per-batch (paralel),
 * berhenti otomatis kalau sudah mendekati batas waktu function serverless
 * (bukan dibatasi jumlah game tetap) — supaya akun yang sebagian besar
 * game-nya sudah ke-cache tetap bisa diproses penuh walau jumlahnya besar.
 */
export async function getPricesForGames(games) {
  const results = [];
  const startTime = Date.now();
  let stoppedEarly = false;

  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    if (Date.now() - startTime > TIME_BUDGET_MS) {
      stoppedEarly = true;
      break;
    }

    const batch = games.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map(processGame));

    let anyFetchedFresh = false;
    for (const { result, wasFetchedFresh } of batchResults) {
      results.push(result);
      if (wasFetchedFresh) anyFetchedFresh = true;
    }

    if (anyFetchedFresh && i + BATCH_SIZE < games.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return { results, stoppedEarly };
}