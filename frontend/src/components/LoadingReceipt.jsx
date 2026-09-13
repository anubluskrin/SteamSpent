import { useEffect, useState } from "react";

const STATUS_MESSAGES = [
  "Menghubungi Steam…",
  "Mengambil daftar game…",
  "Mengecek harga tiap game…",
  "Menjumlahkan total…",
];

export default function LoadingReceipt() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-receipt">
      <div className="loading-receipt__slot">
        <div className="loading-receipt__slot-glow" />
      </div>

      <div className="loading-receipt__paper">
        <div className="loading-receipt__header shimmer" />
        <div className="loading-receipt__header shimmer loading-receipt__header--sub" />

        <div className="loading-receipt__items">
          {[0, 1, 2, 3].map((i) => (
            <div
              className="loading-receipt__item"
              key={i}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="loading-receipt__cover shimmer" />
              <div className="loading-receipt__line shimmer" />
              <div className="loading-receipt__price shimmer" />
            </div>
          ))}
        </div>
      </div>

      <p className="loading-receipt__status" key={statusIndex}>
        {STATUS_MESSAGES[statusIndex]}
      </p>
    </div>
  );
}