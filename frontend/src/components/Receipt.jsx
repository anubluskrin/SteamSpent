function formatPrice(value, currency) {
  if (value === 0) return "GRATIS";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency || "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function Receipt({ result }) {
  const { username, totalGames, totalPrice, currency, games } = result;

  return (
    <div className="receipt">
      <div className="receipt__header">
        <div className="receipt__username">{username}</div>
        <div className="receipt__count">{totalGames} game di library</div>
      </div>

      <div className="receipt__items">
        {games.map((game) => (
          <div className="receipt__item" key={game.appid}>
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
    </div>
  );
}