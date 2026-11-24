import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Bot,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Download,
  Leaf,
  Moon,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  ThermometerSun,
  Wifi,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const features = [
  {
    icon: ChartNoAxesCombined,
    title: 'Telemetría en tiempo real',
    text: 'Consulta humedad, temperatura y radiación desde una vista clara y siempre actualizada.',
  },
  {
    icon: Droplets,
    title: 'Riego con control',
    text: 'Activa bomba y nebulización, configura dosis y conserva el control de cada maceta.',
  },
  {
    icon: Bot,
    title: 'FloraBot inteligente',
    text: 'Recibe respuestas agronómicas basadas en las condiciones reales de tus cultivos.',
  },
];

// Colores orgánicos para las hojas botánicas
const LEAF_COLORS = [
  '#2ECC71',
  '#27AE60',
  '#58D68D',
  '#1ABC9C',
  '#52BE80',
  '#82E0AA',
];

// Diapositivas para el carrusel interno con métricas sincronizadas por vista
const POT_SLIDES = [
  {
    id: 'tomatera',
    title: 'Tomatera',
    category: 'Maceta activa',
    badge: 'EN VIVO',
    image: '/plants/albahaca.jpg',
    tagLeft: 'Óptimo',
    tagRight: 'Bomba lista',
    isHeroPlant: true,
    metrics: [
      { icon: Droplets, label: 'Humedad suelo', value: '68%', status: 'Óptimo', tone: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/15' },
      { icon: ThermometerSun, label: 'Temperatura', value: '24°C', status: 'Ideal', tone: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/15' },
      { icon: Sun, label: 'Radiación', value: '742 lx', status: 'Normal', tone: 'text-[#EAB308]', bg: 'bg-[#EAB308]/15' },
    ],
    footerMetrics: [
      { label: 'Humedad suelo', value: '68%', tone: 'text-[#3B82F6]' },
      { label: 'Luminosidad', value: '742 lx', tone: 'text-[#EAB308]' },
      { label: 'Estado', value: 'Óptimo', isStatus: true },
    ],
  },
  {
    id: 'gemelo-3d',
    title: 'Kumquat en 3D',
    category: 'Gemelo Digital 3D',
    badge: '3D INTERACTIVO',
    video: '/showcase/crop-gemelo3d.mp4',
    image: '/showcase/crop-gemelo3d.png',
    tagLeft: '98% Salud',
    tagRight: 'Modelo 3D',
    isHeroPlant: false,
    metrics: [
      { icon: Sprout, label: 'Salud 3D', value: '98%', status: 'Excelente', tone: 'text-[#2ECC71]', bg: 'bg-[#2ECC71]/15' },
      { icon: Sun, label: 'Iluminación', value: '360°', status: 'Reactiva', tone: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/15' },
      { icon: Droplets, label: 'Riego programado', value: '100 ml', status: 'Programado', tone: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/15' },
    ],
    footerMetrics: [
      { label: 'Especie', value: 'Kumquat', tone: 'text-[#2ECC71]' },
      { label: 'Entorno 3D', value: 'Reactivo', tone: 'text-[#F59E0B]' },
      { label: 'Modelo', value: 'En vivo', isStatus: true },
    ],
  },
  {
    id: 'telemetria',
    title: 'Telemetría en Vivo',
    category: 'Superposición multi-sensor',
    badge: 'HISTORIAL 24H',
    image: '/showcase/crop-telemetry.png',
    tagLeft: 'En tiempo real',
    tagRight: 'Umbrales',
    isHeroPlant: false,
    metrics: [
      { icon: ThermometerSun, label: 'Límite térmico', value: '35.0°C', status: 'Umbral', tone: 'text-[#EF4444]', bg: 'bg-[#EF4444]/15' },
      { icon: Droplets, label: 'Límite hídrico', value: '30.0%', status: 'Umbral', tone: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/15' },
      { icon: ChartNoAxesCombined, label: 'Ventana', value: '24h / 7d', status: 'Persistencia', tone: 'text-[#2ECC71]', bg: 'bg-[#2ECC71]/15' },
    ],
    footerMetrics: [
      { label: 'Historial', value: '24 Horas', tone: 'text-[#2ECC71]' },
      { label: 'Variables', value: '3 Sensores', tone: 'text-[#F59E0B]' },
      { label: 'Alertas', value: 'Activas', isStatus: true },
    ],
  },
  {
    id: 'florabot',
    title: 'FloraBot IA',
    category: 'Consultor Botánico',
    badge: 'IA BOTÁNICA',
    image: '/showcase/crop-florabot.png',
    tagLeft: 'Asesor botánico',
    tagRight: 'En línea',
    isHeroPlant: false,
    metrics: [
      { icon: Bot, label: 'Asesor agronómico', value: 'Activo', status: 'En línea', tone: 'text-[#2ECC71]', bg: 'bg-[#2ECC71]/15' },
      { icon: Sparkles, label: 'Flora chilena', value: 'Nativa', status: 'Científica', tone: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/15' },
      { icon: ShieldCheck, label: 'Diagnóstico', value: '24/7', status: 'Instantáneo', tone: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/15' },
    ],
    footerMetrics: [
      { label: 'Especialidad', value: 'Plagas & Riego', tone: 'text-[#2ECC71]' },
      { label: 'Cobertura', value: 'Nativa', tone: 'text-[#8B5CF6]' },
      { label: 'FloraBot', value: 'En línea', isStatus: true },
    ],
  },
  {
    id: 'catalogo',
    title: 'Limonero en Maceta',
    category: 'Catálogo Botánico',
    badge: 'CALIBRADO',
    image: '/showcase/crop-catalogo.png',
    tagLeft: 'Ficha botánica',
    tagRight: 'Calibrado',
    isHeroPlant: false,
    metrics: [
      { icon: Droplets, label: 'Rango humedad', value: '50 - 70%', status: 'Calibrado', tone: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/15' },
      { icon: ThermometerSun, label: 'Rango térmico', value: '15 - 28°C', status: 'Ideal', tone: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/15' },
      { icon: Sprout, label: 'Tipo de especie', value: 'Cítrico', status: 'Exterior', tone: 'text-[#2ECC71]', bg: 'bg-[#2ECC71]/15' },
    ],
    footerMetrics: [
      { label: 'Taxonomía', value: 'Citrus limon', tone: 'text-[#EAB308]' },
      { label: 'Riego', value: 'Cada 3 días', tone: 'text-[#3B82F6]' },
      { label: 'Parámetros', value: 'Listos', isStatus: true },
    ],
  },
];

export default function Landing() {
  const { isOled, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0, time: 0 });
  const touchStartXRef = useRef(0);
  const [isBursting, setIsBursting] = useState(false);
  const [potIndex, setPotIndex] = useState(0);
  const [isSquareHovered, setIsSquareHovered] = useState(false);

  const currentPot = POT_SLIDES[potIndex];

  // Auto-rotación del recuadro cada 5 segundos (pausa en hover)
  useEffect(() => {
    if (isSquareHovered) return;
    const timer = setInterval(() => {
      setPotIndex((prev) => (prev + 1) % POT_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isSquareHovered]);

  const nextPotSlide = (e) => {
    if (e) e.stopPropagation();
    setPotIndex((prev) => (prev + 1) % POT_SLIDES.length);
  };

  const prevPotSlide = (e) => {
    if (e) e.stopPropagation();
    setPotIndex((prev) => (prev - 1 + POT_SLIDES.length) % POT_SLIDES.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartXRef.current) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextPotSlide();
    } else if (diff < -45) {
      prevPotSlide();
    }
    touchStartXRef.current = 0;
  };

  const page = isOled ? 'bg-[#000000] text-[#E8ECEA]' : 'bg-[#F5F5F0] text-[#2D3748]';
  const header = isOled ? 'border-[#252525] bg-[#0A0A0A]/90' : 'border-[#E6E4DC] bg-[#F5F5F0]/90';
  const card = isOled ? 'border-[#262626] bg-[#121212]' : 'border-[#E6E4DC] bg-[#FAF9F5]';
  const muted = isOled ? 'text-[#A0A0A0]' : 'text-[#718096]';

  // Función para crear una partícula de hoja
  const createLeafParticle = (x, y, isBurst = false, burstAngle = 0, burstSpeed = 0) => {
    const size = isBurst ? 10 + Math.random() * 14 : 7 + Math.random() * 11;
    const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const angularSpeed = (Math.random() - 0.5) * (isBurst ? 0.22 : 0.08);

    let vx = (Math.random() - 0.5) * 1.6;
    let vy = 0.6 + Math.random() * 1.2;

    if (isBurst) {
      vx = Math.cos(burstAngle) * burstSpeed;
      vy = Math.sin(burstAngle) * burstSpeed;
    }

    return {
      x,
      y,
      vx,
      vy,
      size,
      angle,
      angularSpeed,
      color,
      opacity: 1,
      decay: isBurst ? 0.011 + Math.random() * 0.01 : 0.016 + Math.random() * 0.014,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.04 + Math.random() * 0.05,
      isBurst,
    };
  };

  // Disparar ráfaga de hojas al hacer click en "Explorar SmartGarden"
  const triggerLeafBurst = useCallback((originX, originY) => {
    setIsBursting(true);
    const burstCount = 48;

    for (let i = 0; i < burstCount; i++) {
      const burstAngle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const burstSpeed = 3.5 + Math.random() * 7.5;
      particlesRef.current.push(createLeafParticle(originX, originY, true, burstAngle, burstSpeed));
    }
  }, []);

  const handleExplore = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    triggerLeafBurst(originX, originY);

    setTimeout(() => {
      navigate('/dashboard');
    }, 420);
  };

  // Rastro continuo de hojas con el cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const now = performance.now();
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 16 || now - lastPosRef.current.time > 60) {
        if (particlesRef.current.length < 140) {
          particlesRef.current.push(createLeafParticle(e.clientX, e.clientY));
        }
        lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        if (particlesRef.current.length < 90) {
          particlesRef.current.push(createLeafParticle(t.clientX, t.clientY));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.swayPhase += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayPhase) * (p.isBurst ? 0.9 : 1.2);
        p.y += p.vy;
        p.angle += p.angularSpeed;
        p.opacity -= p.decay;

        if (p.isBurst) {
          p.vx *= 0.94;
          p.vy = p.vy * 0.94 + 0.35;
        } else {
          p.vx *= 0.98;
          p.vy = Math.min(p.vy + 0.02, 2.4);
        }

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.bezierCurveTo(p.size * 0.68, -p.size * 0.3, p.size * 0.68, p.size * 0.62, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.68, p.size * 0.62, -p.size * 0.68, -p.size * 0.3, 0, -p.size);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = Math.max(0.7, p.size * 0.08);
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.75);
        ctx.lineTo(0, p.size * 0.75);
        ctx.stroke();

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${page} transition-colors duration-300 selection:bg-[#2ECC71]/30`}>
      {/* Canvas interactivo de rastro y ráfaga de hojas botánicas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        style={{ willChange: 'transform' }}
      />

      {/* Luces y resplandor ambiental de fondo */}
      <div className={`pointer-events-none absolute left-[-10rem] top-24 h-96 w-96 rounded-full blur-[100px] ${isOled ? 'bg-[#123D25]/20' : 'bg-[#CDEFD7]/70'}`} />
      <div className={`pointer-events-none absolute right-[-12rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full blur-[130px] ${isOled ? 'bg-[#102B3D]/20' : 'bg-[#DCEBFF]/60'}`} />

      {/* Contenedor principal con escala del 15% en escritorio y 100% natural en móviles */}
      <div className="landing-desktop-zoom">
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${header}`}>
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Navegación principal">
          <Link to="/" className="flex items-center gap-3" aria-label="Ir al inicio">
            <img src="/SmartGarden.png" alt="" className="h-10 w-10 rounded-2xl object-contain shadow-sm" />
            <div>
              <p className="text-[15px] font-bold leading-tight tracking-tight">SmartGarden</p>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Cultivo inteligente</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isOled ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all ${
                isOled ? 'border-[#333333] bg-[#181818] text-[#FFD600] hover:bg-[#252525]' : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:bg-[#F0EEE6]'
              }`}
            >
              {isOled ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className={`flex h-9 sm:h-10 items-center rounded-xl border px-3 sm:px-4 text-xs sm:text-sm font-bold transition-all ${
                isOled 
                  ? 'border-[#2ECC71]/35 bg-[#2ECC71]/10 text-[#2ECC71] hover:border-[#2ECC71] hover:bg-[#2ECC71] hover:text-white' 
                  : 'border-[#2ECC71]/40 bg-[#EAF7EE] text-[#15803D] hover:border-[#2ECC71] hover:bg-[#2ECC71] hover:text-white'
              }`}
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
          <div className="relative z-10 max-w-xl">
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${isOled ? 'border-[#2ECC71]/25 bg-[#102018] text-[#78DFA3]' : 'border-[#B8DFC5] bg-[#EAF7EE] text-[#237A43]'}`}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2ECC71] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2ECC71]" />
              </span>
              Sistema IoT conectado
            </div>

            <h1 className="text-[clamp(3rem,8vw,5.7rem)] font-black leading-[0.93] tracking-[-0.055em]">
              Tus plantas,
              <span className="block text-[#2ECC71]">más inteligentes.</span>
            </h1>
            <p className={`mt-7 max-w-lg text-base leading-7 sm:text-lg ${muted}`}>
              Supervisa, automatiza y comprende cada cultivo desde un solo panel. Tu jardín conectado, disponible en todo momento.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <button
                type="button"
                onClick={handleExplore}
                className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#2ECC71] px-6 text-sm font-bold text-white whitespace-nowrap transition-all duration-300 hover:bg-[#27AE60] active:scale-95 cursor-pointer border-2 border-[#EF4444] animate-heartbeat ${
                  isBursting ? 'ring-4 ring-[#EF4444]/60' : ''
                }`}
              >
                <span>Explorar SmartGarden</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <Link
                to="/login?mode=register"
                className={`inline-flex h-12 items-center justify-center rounded-2xl border px-6 text-sm font-bold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 ${
                  isOled ? 'border-[#333333] bg-[#171717] hover:border-[#2ECC71]/60' : 'border-[#D9E1D8] bg-white hover:border-[#2ECC71]'
                }`}
              >
                Registrarse
              </Link>
              <a
                href="/SmarGardenApp.apk"
                download="SmartGarden.apk"
                className={`group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 ${
                  isOled ? 'border-[#2ECC71]/30 bg-[#102018] text-[#78DFA3] hover:border-[#2ECC71] hover:bg-[#15321F]' : 'border-[#B8DFC5] bg-[#EAF7EE] text-[#237A43] hover:border-[#2ECC71] hover:bg-[#DDF2E5]'
                }`}
                aria-label="Descargar la aplicación Android SmartGarden"
              >
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                <span>Descargar APK</span>
              </a>
            </div>

            <div className={`mt-8 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-semibold ${muted}`}>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#2ECC71]" />Acceso seguro</span>
              <span className="inline-flex items-center gap-2"><Wifi className="h-4 w-4 text-[#2ECC71]" />Datos en tiempo real</span>
              <span className="inline-flex items-center gap-2"><Sprout className="h-4 w-4 text-[#2ECC71]" />Multi planta</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[650px] lg:max-w-none">
            <div className={`absolute inset-10 rounded-full blur-3xl ${isOled ? 'bg-[#2ECC71]/10' : 'bg-[#2ECC71]/15'}`} />
            <div className={`relative overflow-hidden rounded-[32px] border p-3 shadow-[0_30px_80px_rgba(45,55,72,0.12)] ${card}`}>
              <div className={`flex items-center justify-between border-b px-4 py-3 ${isOled ? 'border-[#262626]' : 'border-[#E6E4DC]'}`}>
                <div className="flex items-center gap-2.5">
                  <img src="/SmartGarden.png" alt="" className="h-8 w-8 rounded-xl object-contain" />
                  <div>
                    <p className="text-xs font-bold">Mi invernadero</p>
                    <p className={`text-[10px] ${muted}`}>3 módulos activos</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-[#2ECC71]/10 px-2.5 py-1 text-[10px] font-bold text-[#15803D]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2ECC71]" />
                  {currentPot.badge || 'EN VIVO'}
                </div>
              </div>

              <div className="grid gap-3 p-2 sm:grid-cols-[1.15fr_0.85fr]">
                <div 
                  className={`relative min-h-[360px] overflow-hidden rounded-[24px] group select-none ${isOled ? 'bg-[#0B170F]' : 'bg-[#EAF4EA]'}`}
                  onMouseEnter={() => setIsSquareHovered(true)}
                  onMouseLeave={() => setIsSquareHovered(false)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Encabezado del slide activo con animación al cambiar */}
                  <div key={`header-${currentPot.id}`} className="pot-text-anim absolute left-5 top-5 z-20 pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2ECC71] drop-shadow-sm">
                      {currentPot.category}
                    </p>
                    <p className="mt-0.5 text-base sm:text-lg font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      {currentPot.title}
                    </p>
                  </div>

                  {/* Flechas de navegación sutiles en la esquina superior derecha con feedback táctil */}
                  <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={prevPotSlide}
                      title="Anterior"
                      aria-label="Función anterior"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 active:scale-90 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextPotSlide}
                      title="Siguiente"
                      aria-label="Siguiente función"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/90 active:scale-90 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Pista del carrusel con deslizamiento horizontal suave y efecto de escala/profundidad */}
                  <div 
                    className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `translateX(-${potIndex * 100}%)` }}
                  >
                    {POT_SLIDES.map((slide, idx) => (
                      <div key={slide.id} className="relative h-full w-full flex-shrink-0 overflow-hidden">
                        {slide.video ? (
                          <video
                            src={slide.video}
                            poster={slide.image}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className={`h-full w-full object-cover transition-all duration-700 ease-out ${
                              idx === potIndex ? 'scale-100 opacity-100 brightness-100' : 'scale-105 opacity-40 brightness-75'
                            }`}
                          />
                        ) : (
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className={`h-full w-full object-cover transition-all duration-700 ease-out ${
                              idx === potIndex ? 'scale-100 opacity-100 brightness-100' : 'scale-105 opacity-40 brightness-75'
                            }`}
                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Degradados de contraste superior e inferior */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-[5] pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-[5] pointer-events-none" />

                  {/* Etiquetas de pie del recuadro con animación de entrada */}
                  <div key={`tags-${currentPot.id}`} className="pot-text-anim absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                    <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                      {currentPot.tagLeft}
                    </span>
                    <span className="rounded-full bg-[#2ECC71] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm">
                      {currentPot.tagRight}
                    </span>
                  </div>

                  {/* Indicadores de puntos interactivos en la base del recuadro */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-auto">
                    {POT_SLIDES.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPotIndex(idx); }}
                        aria-label={`Ver función ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === potIndex ? 'w-5 bg-[#2ECC71] shadow-[0_0_8px_rgba(46,204,113,0.8)]' : 'w-1.5 bg-white/40 hover:bg-white/80 hover:w-2.5'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Hoja de neón para la planta activa con transición suave de visibilidad */}
                  <Leaf 
                    className={`absolute bottom-20 left-1/2 h-28 w-28 -translate-x-1/2 text-[#2ECC71]/90 z-10 pointer-events-none transition-all duration-500 ${
                      currentPot.isHeroPlant ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    } ${isOled ? '' : 'drop-shadow-[0_12px_18px_rgba(46,204,113,0.18)]'}`} 
                    strokeWidth={1.1} 
                  />
                </div>

                <div className="flex flex-col justify-between gap-3 h-full">
                  {currentPot.metrics.map((metric, mIdx) => (
                    <div 
                      key={`metric-${currentPot.id}-${mIdx}`} 
                      className={`pot-text-anim group relative flex flex-1 items-center justify-between rounded-[22px] border px-4 py-3 sm:px-5 sm:py-3.5 transition-all duration-300 hover:scale-[1.01] ${
                        isOled ? 'border-[#262626] bg-[#161616] hover:border-[#2ECC71]/40' : 'border-[#E6E4DC] bg-white hover:border-[#2ECC71]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 pr-2">
                        <div className={`flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl ${metric.bg} shadow-inner transition-transform group-hover:scale-105`}>
                          <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.tone}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider truncate ${muted}`}>{metric.label}</p>
                          <p className="mt-0.5 text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">{metric.value}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2ECC71]/15 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-[#2ECC71] whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                          {metric.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barra inferior de estado del invernadero sincronizada con el slide */}
              <div className={`mt-2.5 grid grid-cols-3 divide-x rounded-[22px] border py-2.5 px-1 sm:py-3.5 sm:px-4 ${
                isOled ? 'border-[#262626] bg-[#161616] divide-[#262626]' : 'border-[#E6E4DC] bg-white divide-[#E6E4DC]'
              }`}>
                {currentPot.footerMetrics.map((fm, fmIdx) => (
                  <div key={`foot-${currentPot.id}-${fmIdx}`} className="pot-text-anim px-1 sm:px-3 text-center flex flex-col items-center justify-center min-w-0 overflow-hidden">
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate w-full ${muted}`}>
                      {fm.label}
                    </p>
                    {fm.isStatus ? (
                      <p className="mt-0.5 inline-flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-base font-black tracking-tight text-[#2ECC71] whitespace-nowrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2ECC71] animate-pulse flex-shrink-0" />
                        {fm.value}
                      </p>
                    ) : (
                      <p className={`mt-0.5 text-xs sm:text-base font-black tracking-tight truncate w-full ${fm.tone || 'text-white'}`}>
                        {fm.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sección unificada: Características del cultivo y Llamado a la acción */}
        <section className={`border-t ${isOled ? 'border-[#262626] bg-[#080808]' : 'border-[#E6E4DC] bg-[#FAF9F5]'}`}>
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="mb-12 mx-auto max-w-2xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2ECC71]">Todo bajo control</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Una vista completa de tu cultivo.</h2>
              <p className={`mt-3 text-sm sm:text-base ${muted}`}>
                Supervisa, automatiza y optimiza cada aspecto botánico desde una plataforma unificada.
              </p>
            </div>

            {/* 3 Tarjetas informativas con animación fluida al pasar el cursor */}
            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-[26px] border p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(46,204,113,0.14)] cursor-pointer ${card} ${
                    isOled ? 'hover:border-[#2ECC71]/70' : 'hover:border-[#2ECC71]'
                  }`}
                >
                  {/* Resplandor ambiental que emerge suavemente en hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2ECC71]/10 via-[#2ECC71]/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

                  {/* Micro-flecha de acción que desliza en la esquina superior */}
                  <div className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#2ECC71]/10 text-[#2ECC71] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4" />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2ECC71]/10 text-[#2ECC71] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#2ECC71] group-hover:text-white shadow-sm">
                      <feature.icon className="h-6 w-6 transition-transform duration-300" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-[#2ECC71]">
                      {feature.title}
                    </h3>
                    <p className={`mt-2.5 text-sm leading-6 transition-colors duration-300 ${muted}`}>
                      {feature.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Bloque integrado de llamado a la acción */}
            <div className={`relative mt-12 overflow-hidden rounded-[32px] border p-8 sm:p-12 transition-all duration-300 ${
              isOled ? 'border-[#2ECC71]/25 bg-[#0D1A12] shadow-[0_20px_50px_rgba(0,0,0,0.4)]' : 'border-[#B9DFC5] bg-[#EAF7EE] shadow-[0_20px_50px_rgba(46,204,113,0.08)]'
            }`}>
              <div className="relative z-10 mx-auto max-w-2xl text-center flex flex-col items-center">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2ECC71]/15 text-[#2ECC71]">
                  <BellRing className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Cuida tus plantas antes de que lo necesiten.</h2>
                <p className={`mt-4 max-w-xl text-sm leading-6 sm:text-base ${muted}`}>
                  SmartGarden reúne sensores, controladores e inteligencia botánica en una experiencia simple.
                </p>
              </div>
              <Leaf className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 text-[#2ECC71]/10" strokeWidth={0.7} />
            </div>
          </div>
        </section>
      </main>

        <footer className={`border-t ${isOled ? 'border-[#262626]' : 'border-[#E6E4DC]'}`}>
          <div className={`mx-auto flex max-w-7xl flex-col items-center justify-center gap-1.5 px-5 py-8 text-center text-xs sm:px-8 ${muted}`}>
            <p>© 2026 SmartGarden • Desarrolladores: Alexander Cortés - Angelo Zamora</p>
            <p>Sistema IoT Autónomo • INACAP 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
