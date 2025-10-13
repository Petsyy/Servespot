// src/utils/badgeAlerts.js
import Swal from "sweetalert2";
import confetti from "canvas-confetti";

export const showNewBadgeAlert = (badge) => {
  if (!badge || !badge.name) return;

  // Play "level-up" sound
  try {
    const audio = new Audio("/sounds/popup.ogg");
    audio.volume = 0.9;
    setTimeout(() => audio.play().catch(() => {}), 100);
  } catch (err) {
    console.warn("Audio playback failed:", err);
  }

  // Confetti
  const duration = 2500;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 25, spread: 360, ticks: 90, zIndex: 9999 };

  const randomInRange = (min, max) => Math.random() * (max - min) + min;
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    const particleCount = 10 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ["#F59E0B", "#F97316", "#22C55E", "#3B82F6", "#E11D48"],
    });
  }, 180);

  // 🏅 SweetAlert2 popup
  const popupHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="font-size:34px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;margin-bottom:18px;text-shadow:0 2px 6px rgba(0,0,0,0.08);">
        🎉 Congratulations!
      </div>
      <div style="font-size:88px;margin:8px 0 20px 0;animation:bounceIn 0.7s ease-out;filter:drop-shadow(0 5px 12px rgba(249,115,22,0.35));">
        ${badge.icon || "🏅"}
      </div>
      <div style="font-size:26px;font-weight:700;background:linear-gradient(90deg,#f59e0b,#f97316,#dc2626);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px;">
        ${badge.name}
      </div>
      <p style="font-size:16px;color:#475569;margin:0;max-width:380px;line-height:1.6;">
        ${badge.description || "You’ve earned a new volunteering badge!"}
      </p>
    </div>

    <style>
      @keyframes bounceIn {
        0% { opacity: 0; transform: scale(0.3) translateY(-20px); }
        50% { opacity: 1; transform: scale(1.1); }
        70% { transform: scale(0.9); }
        100% { transform: scale(1); }
      }
      .swal2-popup {
        border-radius: 24px !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
      }
      .swal2-confirm {
        background: #86efac !important;
        color: #065f46 !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 12px 32px !important;
        font-weight: 700 !important;
        font-size: 15px !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
        transition: all 0.25s ease !important;
      }
      .swal2-confirm:hover {
        background: #4ade80 !important;
        transform: scale(1.03);
      }
    </style>
  `;

  Swal.fire({
    html: popupHTML,
    confirmButtonText: "Awesome! 🌈",
    background: "#ffffff",
    backdrop: "rgba(0, 0, 0, 0.55)",
    width: "480px",
    padding: "36px 32px 30px 32px",
    allowOutsideClick: true,
    allowEscapeKey: true,
    focusConfirm: true,
    timer: 0, // ⛔ no auto-close this time, manual only
    returnFocus: false,

    // ✅ preConfirm ensures the modal closes on confirm click
    preConfirm: () => {
      Swal.close();
    },
  }).then((result) => {
    if (Swal.isVisible()) Swal.close(); // safety fallback
  });
};
