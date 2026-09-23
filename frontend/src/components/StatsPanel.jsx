import { useEffect, useState } from "react";
import { getStats } from "../services/api.js";

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function StatsPanel({ onClose }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  const maxDistributionCount = stats
    ? Math.max(...stats.distribution.map((d) => d.count), 1)
    : 1;
  const maxTimesSeen = stats
    ? Math.max(...stats.topGames.map((g) => g.timesSeen), 1)
    : 1;

  return (
    <div className="stats-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">Statistik Komunitas</h2>
        <button className="stats-panel__close" onClick={onClose}>
          ✕
        </button>
      </div>

      {error && <p className="state-message state-message--error">{error}</p>}

      {!stats && !error && (
        <p className="state-message">Memuat statistik…</p>
      )}

      {stats && (
        <>
          <div className="stats-panel__summary">
            <div className="stats-panel__summary-item">
              <span className="stats-panel__summary-value">
                {stats.totalSearches}
              </span>
              <span className="stats-panel__summary-label">
                total pencarian
              </span>
            </div>
            <div className="stats-panel__summary-item">
              <span className="stats-panel__summary-value">
                {formatPrice(stats.averageTotalPrice)}
              </span>
              <span className="stats-panel__summary-label">rata-rata</span>
            </div>
            <div className="stats-panel__summary-item">
              <span className="stats-panel__summary-value">
                {formatPrice(stats.medianTotalPrice)}
              </span>
              <span className="stats-panel__summary-label">median</span>
            </div>
            <div className="stats-panel__summary-item">
              <span className="stats-panel__summary-value">
                {stats.totalUniqueGames}
              </span>
              <span className="stats-panel__summary-label">game unik</span>
            </div>
          </div>

          {stats.totalSearches === 0 ? (
            <p className="state-message">
              Belum ada data pencarian yang terkumpul.
            </p>
          ) : (
            <>
              <div className="stats-panel__section">
                <h3 className="stats-panel__section-title">
                  Sebaran total harga library
                </h3>
                {stats.distribution.map((bucket) => (
                  <div className="stats-panel__bar-row" key={bucket.label}>
                    <span className="stats-panel__bar-label">
                      {bucket.label}
                    </span>
                    <div className="stats-panel__bar-track">
                      <div
                        className="stats-panel__bar-fill"
                        style={{
                          width: `${(bucket.count / maxDistributionCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="stats-panel__bar-count">
                      {bucket.count}
                    </span>
                  </div>
                ))}
              </div>

              {stats.topGames.length > 0 && (
                <div className="stats-panel__section">
                  <h3 className="stats-panel__section-title">
                    Game paling sering muncul
                  </h3>
                  {stats.topGames.map((game) => (
                    <div className="stats-panel__bar-row" key={game.appid}>
                      <span className="stats-panel__bar-label stats-panel__bar-label--name">
                        {game.name}
                      </span>
                      <div className="stats-panel__bar-track">
                        <div
                          className="stats-panel__bar-fill"
                          style={{
                            width: `${(game.timesSeen / maxTimesSeen) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="stats-panel__bar-count">
                        {game.timesSeen}×
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}