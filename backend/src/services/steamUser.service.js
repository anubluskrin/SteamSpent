import axios from "axios";
import { STEAM_API_KEY } from "../config/env.js";

const BASE_URL = "https://api.steampowered.com";

// SteamID64 selalu berupa angka 17 digit
const STEAM_ID64_REGEX = /^\d{17}$/;

/**
 * Terima berbagai format input dan selalu kembalikan SteamID64.
 * Format yang didukung:
 *  - Username biasa: "gaben"
 *  - Link custom URL: "https://steamcommunity.com/id/gaben"
 *  - SteamID64 langsung: "76561198792581668"
 *  - Link profil berbasis ID: "https://steamcommunity.com/profiles/76561198792581668"
 */
export async function resolveToSteamId64(input) {
  const trimmed = input.trim();

  // Kasus 1: link profil berbasis ID (/profiles/NOMOR)
  const profileLinkMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileLinkMatch) {
    return profileLinkMatch[1];
  }

  // Kasus 2: link custom URL (/id/username)
  const vanityLinkMatch = trimmed.match(/steamcommunity\.com\/id\/([^/]+)/);
  if (vanityLinkMatch) {
    return resolveVanityUrl(vanityLinkMatch[1]);
  }

  // Kasus 3: SteamID64 mentah, tanpa link
  if (STEAM_ID64_REGEX.test(trimmed)) {
    return trimmed;
  }

  // Kasus 4: username biasa, tanpa link
  return resolveVanityUrl(trimmed);
}

/**
 * Ubah username (vanity URL) jadi SteamID64.
 * Contoh: "gaben" -> "76561197960287930"
 */
export async function resolveVanityUrl(username) {
  const { data } = await axios.get(
    `${BASE_URL}/ISteamUser/ResolveVanityURL/v1/`,
    {
      params: {
        key: STEAM_API_KEY,
        vanityurl: username,
      },
    }
  );

  // success === 1 artinya ditemukan, selain itu berarti tidak ada / error
  if (data.response.success !== 1) {
    throw new Error("USERNAME_NOT_FOUND");
  }

  return data.response.steamid;
}

/**
 * Ambil semua game yang dimiliki user berdasarkan SteamID64.
 * Return array kosong kalau profil private.
 */
export async function getOwnedGames(steamId64) {
  const { data } = await axios.get(
    `${BASE_URL}/IPlayerService/GetOwnedGames/v1/`,
    {
      params: {
        key: STEAM_API_KEY,
        steamid: steamId64,
        include_appinfo: true,
        include_played_free_games: true,
      },
    }
  );

  const games = data.response.games;

  if (!games || games.length === 0) {
    throw new Error("LIBRARY_EMPTY_OR_PRIVATE");
  }

  return games.map((g) => ({
    appid: g.appid,
    name: g.name,
  }));
}