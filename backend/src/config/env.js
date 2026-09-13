import "dotenv/config";

export const STEAM_API_KEY = process.env.STEAM_API_KEY;
export const PORT = process.env.PORT || 3000;

if (!STEAM_API_KEY) {
  console.warn("⚠️  STEAM_API_KEY belum diisi di file .env");
}