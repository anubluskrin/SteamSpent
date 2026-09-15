function formatPrice(value, currency) {
  if (value === 0) return "GRATIS";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    minimumFractionDigits: 0,
  }).format(value);
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

  return (
    <div className="receipt">
      <div className="receipt__header">
        <div className="receipt__username">{username}</div>
        <div className="receipt__count">{totalGames} game di library</div>
      </div>

      <div className="receipt__items">
        {games.map((game) => (
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
            <span
              className={
                "receipt__item-price" +
                (game.isFree ? " receipt__item-price--free" : "")
              }
            >
              {formatPrice(game.price, game.currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="receipt__total">
        <div className="receipt__total-row">
          <span className="receipt__total-label">Total</span>
          <span className="receipt__total-value">
            {formatPrice(totalPrice, currency)}
          </span>
        </div>
        <div className="receipt__total-note">
          Harga sebelum diskon, kurs mengikuti harga toko Steam
        </div>
      </div>

      {mostExpensive && (
        <div className="receipt__stats">
          <div className="receipt__stat">
            <span className="receipt__stat-label">Game termahal</span>
            <span className="receipt__stat-value">
              {mostExpensive.name} —{" "}
              {formatPrice(mostExpensive.price, currency)}
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
