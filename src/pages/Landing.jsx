import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  Bot,
  ChartNoAxesCombined,
  Droplets,
  Download,
  Leaf,
  Moon,
  ShieldCheck,
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

export default function Landing() {
  const { isOled, toggleTheme } = useTheme();

  const page = isOled ? 'bg-[#000000] text-[#E8ECEA]' : 'bg-[#F5F5F0] text-[#2D3748]';
  const header = isOled ? 'border-[#252525] bg-[#0A0A0A]/90' : 'border-[#E6E4DC] bg-[#F5F5F0]/90';
  const card = isOled ? 'border-[#262626] bg-[#121212]' : 'border-[#E6E4DC] bg-[#FAF9F5]';
  const muted = isOled ? 'text-[#A0A0A0]' : 'text-[#718096]';

  return (
    <div className={`relative min-h-screen overflow-hidden ${page} transition-colors duration-300 selection:bg-[#2ECC71]/30`}>
      <div className={`pointer-events-none absolute left-[-10rem] top-24 h-96 w-96 rounded-full blur-[100px] ${isOled ? 'bg-[#123D25]/20' : 'bg-[#CDEFD7]/70'}`} />
      <div className={`pointer-events-none absolute right-[-12rem] top-[-8rem] h-[34rem] w-[34rem] rounded-full blur-[130px] ${isOled ? 'bg-[#102B3D]/20' : 'bg-[#DCEBFF]/60'}`} />

      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${header}`}>
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Navegación principal">
          <Link to="/" className="flex items-center gap-3" aria-label="Ir al inicio">
            <img src="/SmartGarden.png" alt="" className="h-10 w-10 rounded-2xl object-contain shadow-sm" />
            <div>
              <p className="text-[15px] font-bold leading-tight tracking-tight">SmartGarden</p>
              <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${muted}`}>Cultivo inteligente</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isOled ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                isOled ? 'border-[#333333] bg-[#181818] text-[#FFD600] hover:bg-[#252525]' : 'border-[#E2E8F0] bg-white text-[#4A5568] hover:bg-[#F0EEE6]'
              }`}
            >
              {isOled ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className="hidden h-10 items-center rounded-xl border border-[#2ECC71]/30 bg-[#2ECC71]/10 px-4 text-sm font-bold text-[#15803D] transition-all hover:border-[#2ECC71] hover:bg-[#2ECC71] hover:text-white sm:flex"
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

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2ECC71] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(46,204,113,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#27AE60]"
              >
                Abrir SmartGarden
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login?mode=register"
                className={`inline-flex h-12 items-center justify-center rounded-2xl border px-6 text-sm font-bold transition-all ${
                  isOled ? 'border-[#333333] bg-[#171717] hover:border-[#2ECC71]/60' : 'border-[#D9E1D8] bg-white hover:border-[#2ECC71]'
                }`}
              >
                Crear cuenta
              </Link>
              <a
                href="/SmarGardenApp.apk"
                download="SmartGarden.apk"
                className={`group inline-flex h-12 items-center justify-center gap-2 rounded-2xl border px-5 text-sm font-bold transition-all ${
                  isOled ? 'border-[#2ECC71]/30 bg-[#102018] text-[#78DFA3] hover:border-[#2ECC71] hover:bg-[#15321F]' : 'border-[#B8DFC5] bg-[#EAF7EE] text-[#237A43] hover:border-[#2ECC71] hover:bg-[#DDF2E5]'
                }`}
                aria-label="Descargar la aplicación Android SmartGarden"
              >
                <Download className="h-4 w-4" />
                Descargar APK
              </a>
            </div>

            <div className={`mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold ${muted}`}>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#2ECC71]" />Acceso seguro</span>
              <span className="inline-flex items-center gap-1.5"><Wifi className="h-4 w-4 text-[#2ECC71]" />Datos en tiempo real</span>
              <span className="inline-flex items-center gap-1.5"><Sprout className="h-4 w-4 text-[#2ECC71]" />Multi planta</span>
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
                  EN VIVO
                </div>
              </div>

              <div className="grid gap-3 p-2 sm:grid-cols-[1.25fr_0.75fr]">
                <div className={`relative min-h-[360px] overflow-hidden rounded-[24px] ${isOled ? 'bg-[#0B170F]' : 'bg-[#EAF4EA]'}`}>
                  <div className="absolute left-5 top-5 z-10">
                    <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${muted}`}>Maceta activa</p>
                    <p className="mt-1 text-lg font-bold">Tomatera</p>
                  </div>
                  <img
                    src="/plants/albahaca.jpg"
                    alt="Planta de cultivo inteligente"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0B170F]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-md">Óptimo</span>
                    <span className="rounded-full bg-[#2ECC71] px-3 py-1.5 text-[10px] font-bold text-white">Bomba lista</span>
                  </div>
                  <Leaf className={`absolute bottom-20 left-1/2 h-28 w-28 -translate-x-1/2 text-[#2ECC71]/90 ${isOled ? '' : 'drop-shadow-[0_12px_18px_rgba(46,204,113,0.18)]'}`} strokeWidth={1.1} />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                  {[
                    { icon: Droplets, label: 'Humedad', value: '68%', tone: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
                    { icon: ThermometerSun, label: 'Temperatura', value: '24°', tone: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
                    { icon: Sun, label: 'Radiación', value: '742', tone: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10' },
                  ].map((metric) => (
                    <div key={metric.label} className={`rounded-[20px] border p-3.5 ${isOled ? 'border-[#262626] bg-[#171717]' : 'border-[#E6E4DC] bg-white'}`}>
                      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${metric.bg}`}>
                        <metric.icon className={`h-4 w-4 ${metric.tone}`} />
                      </div>
                      <p className={`text-[10px] ${muted}`}>{metric.label}</p>
                      <p className="mt-1 text-xl font-black tracking-tight">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-1 grid grid-cols-3 gap-2 rounded-2xl p-2 ${isOled ? 'bg-[#0A0A0A]' : 'bg-[#F0EEE6]'}`}>
                {[
                  ['Humedad suelo', '68%'],
                  ['Luminosidad', '742 lx'],
                  ['Estado', 'Óptimo'],
                ].map(([label, value]) => (
                  <div key={label} className="px-2 py-1.5 text-center">
                    <p className={`text-[9px] ${muted}`}>{label}</p>
                    <p className="mt-1 text-xs font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`border-y ${isOled ? 'border-[#262626] bg-[#080808]' : 'border-[#E6E4DC] bg-[#FAF9F5]'}`}>
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
            <div className="mb-10 max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2ECC71]">Todo bajo control</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Una vista completa de tu cultivo.</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className={`rounded-[24px] border p-6 transition-all duration-300 hover:-translate-y-1 ${card}`}>
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2ECC71]/10 text-[#2ECC71]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${muted}`}>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className={`relative overflow-hidden rounded-[32px] border p-8 sm:p-12 ${isOled ? 'border-[#2ECC71]/20 bg-[#0D1A12]' : 'border-[#B9DFC5] bg-[#EAF7EE]'}`}>
            <div className="relative z-10 max-w-2xl">
              <BellRing className="mb-5 h-7 w-7 text-[#2ECC71]" />
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Cuida tus plantas antes de que lo necesiten.</h2>
              <p className={`mt-4 max-w-xl text-sm leading-6 sm:text-base ${muted}`}>
                SmartGarden reúne sensores, controladores e inteligencia botánica en una experiencia simple.
              </p>
              <Link
                to="/dashboard"
                className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#2ECC71] px-6 text-sm font-bold text-white transition-all hover:bg-[#27AE60]"
              >
                Entrar al panel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Leaf className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 text-[#2ECC71]/10" strokeWidth={0.7} />
          </div>
        </section>
      </main>

      <footer className={`border-t ${isOled ? 'border-[#262626]' : 'border-[#E6E4DC]'}`}>
        <div className={`mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs sm:px-8 sm:flex-row sm:items-center sm:justify-between ${muted}`}>
          <p>© 2026 SmartGarden • Alexander Cortés y Angelo Zamora</p>
          <p>Sistema IoT Autónomo • INACAP 2026</p>
        </div>
      </footer>
    </div>
  );
}
