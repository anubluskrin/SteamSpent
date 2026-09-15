import { useRef, useState } from "react";
import html2canvas from "html2canvas";

function formatPrice(value, currency) {
  if (value === 0) return "GRATIS";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function getDiscountPercent(game) {
  if (
    game.isFree ||
    !game.discountPrice ||
    game.discountPrice >= game.price ||
    game.price === 0
  ) {
    return null;
  }
  return Math.round((1 - game.discountPrice / game.price) * 100);
}

function computeStats(games, totalGames, totalPrice) {
  const freeCount = games.filter((g) => g.price === 0).length;
  const paidGames = games.filter((g) => g.price > 0);

  const mostExpensive = games.reduce(
    (max, g) => (g.price > (max?.price ?? -1) ? g : max),
    null
  );

  const average =
    paidGames.length > 0
      ? paidGames.reduce((sum, g) => sum + g.price, 0) / paidGames.length
      : 0;

  return { freeCount, mostExpensive, average };
}

export default function Receipt({ result }) {
  const { username, totalGames, totalPrice, currency, games } = result;
  const { freeCount, mostExpensive, average } = computeStats(
    games,
    totalGames,
    totalPrice
  );
  const receiptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (!receiptRef.current) return;
    setIsDownloading(true);

    const itemsEl = receiptRef.current.querySelector(".receipt__items");
    const originalMaxHeight = itemsEl?.style.maxHeight;
    const originalOverflow = itemsEl?.style.overflow;

    try {
      // Buka sementara area scroll-nya supaya seluruh daftar game
      // ikut terfoto, bukan cuma bagian yang kelihatan di layar
      if (itemsEl) {
        itemsEl.style.maxHeight = "none";
        itemsEl.style.overflow = "visible";
      }

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: "#14181d",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `steam-library-${username}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Diamkan saja — download gambar itu fitur pelengkap, bukan inti
    } finally {
      if (itemsEl) {
        itemsEl.style.maxHeight = originalMaxHeight ?? "";
        itemsEl.style.overflow = originalOverflow ?? "";
      }
      setIsDownloading(false);
    }
  }

  return (
    <div>
      <div className="receipt" ref={receiptRef}>
      <div className="receipt__header">
        <div className="receipt__username">{username}</div>
        <div className="receipt__count">{totalGames} game di library</div>
      </div>

      <div className="receipt__items">
        {games.map((game) => {
          const discountPercent = getDiscountPercent(game);
          return (
            <div className="receipt__item" key={game.appid}>
              <img
                src={game.coverUrl}
                alt={game.name}
                className="receipt__item-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.style.visibility = "hidden";
                }}
              />
              <span className="receipt__item-name">{game.name}</span>
              {discountPercent && (
                <span className="receipt__item-discount">
                  -{discountPercent}%
                </span>
              )}
              <span className="receipt__item-price-group">
                {discountPercent && (
                  <span className="receipt__item-price-original">
                    {formatPrice(game.price, game.currency)}
                  </span>
                )}
                <span
                  className={
                    "receipt__item-price" +
                    (game.isFree ? " receipt__item-price--free" : "")
                  }
                >
                  {formatPrice(
                    discountPercent ? game.discountPrice : game.price,
                    game.currency
                  )}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="receipt__total">
        <div className="receipt__total-row">
          <span className="receipt__total-label">Total</span>
          <span className="receipt__total-value">
            {formatPrice(totalPrice, currency)}
          </span>
        </div>
        <div className="receipt__total-note">
          Estimasi kalau semua game ini dibeli ulang dari nol hari ini —
          bukan harga waktu kamu beli dulu
        </div>
      </div>

      {mostExpensive && (
        <div className="receipt__stats">
          <div className="receipt__stat">
            <span className="receipt__stat-label">Game termahal</span>
            <span className="receipt__stat-value">
              <span className="receipt__stat-name">
                {mostExpensive.name}
              </span>{" "}
              <span className="receipt__stat-price">
                {formatPrice(mostExpensive.price, currency)}
              </span>
            </span>
          </div>
          <div className="receipt__stat">
            <span className="receipt__stat-label">
              Rata-rata harga (game berbayar)
            </span>
            <span className="receipt__stat-value">
              {formatPrice(Math.round(average), currency)}
            </span>
          </div>
          <div className="receipt__stat">
            <span className="receipt__stat-label">Game gratis</span>
            <span className="receipt__stat-value">
              {freeCount} dari {totalGames} game
            </span>
          </div>
        </div>
      )}
      </div>

      <button
        className="receipt__download-btn"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        {isDownloading ? "Menyiapkan gambar…" : "⬇ Download sebagai gambar"}
      </button>
    </div>
  );
}