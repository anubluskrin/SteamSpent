import { useEffect, useRef } from "react";

const COLORS = ["#5eead4", "#a78bfa", "#0089e4", "#2444fb", "#60a5fa"];
const MAX_STARS = 500;
const SPAWN_INTERVAL = 90; // ms antar kemunculan bintang baru

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createStar(width) {
  const angle = randomBetween(
    (110 * Math.PI) / 180,
    (111 * Math.PI) / 180
  );
  return {
    x: randomBetween(0, width * 1.1),
    y: randomBetween(100, -20),
    angle,
    speed: randomBetween(1, 20),
    length: randomBetween(900, 220),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: randomBetween(0.6, 1),
  };
}

export default function Landing({ onEnter }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let animationId;
    let lastSpawn = 0;
    let width, height, dpr;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function draw(timestamp) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      if (timestamp - lastSpawn > SPAWN_INTERVAL && stars.length < MAX_STARS) {
        stars.push(createStar(width));
        lastSpawn = timestamp;
      }

      stars.forEach((star) => {
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Titik kepala bersinar
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 12;
        ctx.shadowColor = star.color;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
      });

      stars = stars.filter(
        (star) => star.y < height + 100 && star.x > -100
      );

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="landing">
      <canvas ref={canvasRef} className="landing__canvas" />
      <div className="landing__content">
        <h1 className="landing__title">Steam Library Total</h1>
        <p className="landing__subtitle">
          Seandainya kamu beli ulang semua game di library Steam-mu hari
          ini, dari nol — berapa totalnya?
        </p>
        <button className="landing__cta" onClick={onEnter}>
          Mulai Hitung
        </button>
      </div>
    </div>
  );
}