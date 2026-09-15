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
  const {
    username,
    totalGames,
    totalPrice,
    totalPriceAfterDiscount,
    currency,
    games,
  } = result;
  const { freeCount, mostExpensive, average } = computeStats(
    games,
    totalGames,
    totalPrice
  );
  const [showDiscounted, setShowDiscounted] = useState(false);

  const displayedTotal = showDiscounted ? totalPriceAfterDiscount : totalPrice;

  return (
    <div className="receipt">
      <div className="receipt__header">
        <div className="receipt__username">{username}</div>
        <div className="receipt__count">{totalGames} game di library</div>
      </div>

      <div className="receipt__items">
        {games.map((game) => {
          const discountPercent = getDiscountPercent(game);
          const showItemDiscount = showDiscounted && discountPercent;
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
              {showItemDiscount && (
                <span className="receipt__item-discount">
                  -{discountPercent}%
                </span>
              )}
              <span className="receipt__item-price-group">
                {showItemDiscount && (
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
                    showItemDiscount ? game.discountPrice : game.price,
                    game.currency
                  )}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="receipt__total">
        <div className="receipt__toggle">
          <button
            className={
              "receipt__toggle-btn" + (!showDiscounted ? " is-active" : "")
            }
            onClick={() => setShowDiscounted(false)}
          >
            Harga normal
          </button>
          <button
            className={
              "receipt__toggle-btn" + (showDiscounted ? " is-active" : "")
            }
            onClick={() => setShowDiscounted(true)}
          >
            Kalau lagi diskon
          </button>
        </div>

        <div className="receipt__total-row">
          <span className="receipt__total-label">Total</span>
          <span className="receipt__total-value">
            {formatPrice(displayedTotal, currency)}
          </span>
        </div>
        <div className="receipt__total-note">
          {showDiscounted
            ? "Estimasi kalau semua game dibeli ulang hari ini, pas semuanya lagi diskon seperti sekarang"
            : "Estimasi kalau semua game ini dibeli ulang dari nol hari ini — bukan harga waktu kamu beli dulu"}
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
  );
}