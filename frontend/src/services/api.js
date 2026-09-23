const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function calculateLibraryPrice(username) {
  const response = await fetch(`${API_BASE_URL}/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Terjadi kesalahan");
  }

  return data;
}

export async function getStats() {
  const response = await fetch(`${API_BASE_URL}/stats`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Terjadi kesalahan");
  }

  return data;
}