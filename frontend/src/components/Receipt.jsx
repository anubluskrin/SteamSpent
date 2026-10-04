import { useState } from "react";

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

function computeStats(games) {
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
  const {
    username,
    totalGames,
    totalPrice,
    totalPriceAfterDiscount,
    currency,
    games,
  } = result;
  const { freeCount, mostExpensive, average } = computeStats(games);
  const [showDiscounted, setShowDiscounted] = useState(false);

  const displayedTotal = showDiscounted ? totalPriceAfterDiscount : totalPrice;

  return (
    <div className="dashboard-results">
      <div className="metric-grid">
        <div className="card metric-card metric-card--primary">
          <div className="metric-card__toprow">
            <span className="metric-card__label">Total library</span>
            <div className="metric-card__toggle">
              <button
                className={
                  "metric-card__toggle-btn" +
                  (!showDiscounted ? " is-active" : "")
                }
                onClick={() => setShowDiscounted(false)}
              >
                Normal
              </button>
              <button
                className={
                  "metric-card__toggle-btn" +
                  (showDiscounted ? " is-active" : "")
                }
                onClick={() => setShowDiscounted(true)}
              >
                Diskon
              </button>
            </div>
          </div>
          <div className="metric-card__value metric-card__value--lg">
            {formatPrice(displayedTotal, currency)}
          </div>
          <div className="metric-card__note">
            {showDiscounted
              ? "Estimasi kalau semua game dibeli ulang hari ini, pas semuanya lagi diskon"
              : "Estimasi beli ulang dari nol hari ini — bukan harga waktu kamu beli dulu"}
          </div>
        </div>

        {mostExpensive && (
          <div className="card metric-card">
            <span className="metric-card__label">Game termahal</span>
            <div className="metric-card__value metric-card__value--sm">
              {formatPrice(mostExpensive.price, currency)}
            </div>
            <div className="metric-card__note metric-card__note--truncate">
              {mostExpensive.name}
            </div>
          </div>
        )}

        <div className="card metric-card">
          <span className="metric-card__label">Rata-rata harga</span>
          <div className="metric-card__value metric-card__value--sm">
            {formatPrice(Math.round(average), currency)}
          </div>
          <div className="metric-card__note">per game berbayar</div>
        </div>

        <div className="card metric-card">
          <span className="metric-card__label">Game gratis</span>
          <div className="metric-card__value metric-card__value--sm">
            {freeCount}
            <span className="metric-card__value-of">/{totalGames}</span>
          </div>
          <div className="metric-card__note">dari total library</div>
        </div>
      </div>

      <div className="card game-table">
        <div className="game-table__header">
          <span className="game-table__username">{username}</span>
          <span className="game-table__count">{totalGames} game</span>
        </div>

        <div className="game-table__body">
          {games.map((game) => {
            const discountPercent = getDiscountPercent(game);
            const showItemDiscount = showDiscounted && discountPercent;
            return (
              <div className="game-table__row" key={game.appid}>
                <img
                  src={game.coverUrl}
                  alt={game.name}
                  className="game-table__cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.visibility = "hidden";
                  }}
                />
                <span className="game-table__name">{game.name}</span>
                {showItemDiscount && (
                  <span className="game-table__discount">
                    -{discountPercent}%
                  </span>
                )}
                <span className="game-table__price-group">
                  {showItemDiscount && (
                    <span className="game-table__price-original">
                      {formatPrice(game.price, game.currency)}
                    </span>
                  )}
                  <span
                    className={
                      "game-table__price" +
                      (game.isFree ? " game-table__price--free" : "")
                    }
                  >
                    {formatPrice(
                      showItemDiscount ? game.discountPrice : game.price,
                      game.currency
                    )}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}