import { useState } from "react";
import SearchForm from "./components/SearchForm.jsx";
import Receipt from "./components/Receipt.jsx";
import LoadingReceipt from "./components/LoadingReceipt.jsx";
import { calculateLibraryPrice } from "./services/api.js";

export default function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch(username) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await calculateLibraryPrice(username);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <h1 className="app__title">Steam Library Total</h1>
      <p className="app__subtitle">
        Masukkan username Steam, lihat berapa total kalau semua game di
        library-mu dibeli dengan harga penuh hari ini.
      </p>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      <p className="app__hint">
        Tidak punya link custom (steamcommunity.com/id/...)? Paste saja link
        profil Steam kamu apa adanya.
      </p>

      {isLoading && <LoadingReceipt />}

      {error && (
        <p className="state-message state-message--error">{error}</p>
      )}

      {result && !isLoading && <Receipt result={result} />}
    </div>
  );
}