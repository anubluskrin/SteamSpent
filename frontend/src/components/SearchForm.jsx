import { useState } from "react";

export default function SearchForm({ onSearch, isLoading }) {
  const [username, setUsername] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || isLoading) return;
    onSearch(username.trim());
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="username atau link profil steam"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Menghitung…" : "Hitung"}
      </button>
    </form>
  );
}