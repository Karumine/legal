import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock, PartyPopper, Gift, Sparkles, X } from 'lucide-react';

// Target: April 30, 2026 at 17:30 Bangkok time (UTC+7)
const TARGET_DATE = new Date('2026-04-30T17:30:00+07:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const total = Math.max(0, TARGET_DATE.getTime() - now.getTime());
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

// ── Confetti Particle ──
function ConfettiCanvas() {
  useEffect(() => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const particles: { x: number; y: number; r: number; color: string; vx: number; vy: number; gravity: number; rotation: number; rotSpeed: number; shape: number }[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        gravity: 0.05 + Math.random() * 0.05,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        shape: Math.floor(Math.random() * 3),
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;

        if (p.shape === 0) {
          // Rectangle
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else if (p.shape === 1) {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -p.r);
          ctx.lineTo(p.r, p.r);
          ctx.lineTo(-p.r, p.r);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;

        // Reset if off screen
        if (p.y > canvas.height + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
          p.vy = Math.random() * 3 + 2;
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

// ── Surprise Modal ──
function SurpriseModal({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <ConfettiCanvas />
      <div
        className={`fixed inset-0 z-[9998] flex items-center justify-center transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={handleClose}
      >
        <div
          className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transition-all duration-500 ${show ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'}`}
          onClick={e => e.stopPropagation()}
          style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #ede9fe 30%, #dbeafe 60%, #ecfdf5 100%)' }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/60 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>

          {/* Content */}
          <div className="text-center space-y-4">
            {/* Icon row */}
            <div className="flex justify-center items-center gap-3">
              <PartyPopper size={36} className="text-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <Gift size={40} className="text-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <PartyPopper size={36} className="text-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Sparkle divider */}
            <div className="flex items-center justify-center gap-2 text-amber-400">
              <Sparkles size={16} />
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              <Sparkles size={16} />
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              <Sparkles size={16} />
            </div>

            <h2
              className="text-3xl font-black bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)' }}
            >
              👋 ลาก่อนนะ!
            </h2>

            <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-white/50 shadow-sm text-left space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">
                ถึงน้องมายด์ 🙏
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                ถ้าเห็นข้อความนี้ แสดงว่า<span className="font-bold text-slate-800">พี่กาย</span>ออกจากงานไปแล้วนะ
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                เว็บ Control Panel ตัวนี้ พี่กายทำไว้ให้ หวังว่าจะช่วยให้ทำงานได้สะดวกขึ้น ใช้ได้เลยไม่ต้องเกรงใจ 😊
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                ขอบคุณที่ได้ทำงานร่วมกัน ขอให้โชคดีนะ
              </p>
              <p className="text-right text-xs text-slate-400 italic mt-2">
                — พี่กาย
              </p>
            </div>

            <button
              onClick={handleClose}
              className="mt-2 px-8 py-2.5 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              ขอบคุณพี่กาย 🙏
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Countdown Component ──
export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [showSurprise, setShowSurprise] = useState(false);
  const [hasFired, setHasFired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = getTimeLeft();
      setTimeLeft(tl);

      // Auto-trigger surprise when time is up
      if (tl.total <= 0 && !hasFired) {
        setHasFired(true);
        setShowSurprise(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hasFired]);

  const handleOpenPopup = useCallback(() => {
    setShowSurprise(true);
  }, []);

  const isExpired = timeLeft.total <= 0;

  // Format with leading zeros
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <>
      <div className="flex items-center gap-2">
        {isExpired ? (
          /* After expiry: permanent credit badge that can reopen the popup */
          <button
            onClick={handleOpenPopup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-slate-600 border border-blue-200/60 hover:border-purple-300 hover:from-blue-100 hover:to-purple-100 transition-all cursor-pointer"
            title="สร้างโดย พี่กาย — คลิกเพื่อดูข้อความ"
          >
            <span>สร้างโดย พี่กาย</span>
          </button>
        ) : (
          <>
            {/* Countdown display */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200">
              <Clock size={13} className="text-slate-400" />
              <span className="tabular-nums tracking-tight">
                {timeLeft.days > 0 && <span className="font-bold">{timeLeft.days}<span className="text-slate-400 text-[10px] mr-0.5">d</span></span>}
                {pad(timeLeft.hours)}<span className="text-slate-400">:</span>
                {pad(timeLeft.minutes)}<span className="text-slate-400">:</span>
                {pad(timeLeft.seconds)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Surprise Modal — rendered via portal to escape panel stacking context */}
      {showSurprise && createPortal(
        <SurpriseModal onClose={() => setShowSurprise(false)} />,
        document.body
      )}
    </>
  );
}
