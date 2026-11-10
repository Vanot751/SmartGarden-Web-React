import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Thermometer, 
  Droplets, 
  Sun, 
  Moon, 
  RefreshCw, 
  LogOut, 
  AlertTriangle, 
  Radio, 
  Layers, 
  CheckCircle2, 
  Loader2,
  Trash2,
  LayoutGrid,
  List,
  Droplet
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useTheme } from '../context/ThemeContext';
import ControlPanel from '../components/ControlPanel';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isOled, toggleTheme } = useTheme();

  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userPlants, setUserPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(() => {
    const saved = localStorage.getItem('smartgarden_selected_plant');
    return saved ? parseInt(saved, 10) : null;
  });
  const [fleetViewMode, setFleetViewMode] = useState(() => {
    return localStorage.getItem('smartgarden_fleet_view_mode') || 'full';
  });
  const [isAnimatingView, setIsAnimatingView] = useState(false);

  const handleFleetViewModeChange = (mode) => {
    if (fleetViewMode === mode) return;
    setIsAnimatingView(true);
    setFleetViewMode(mode);
    localStorage.setItem('smartgarden_fleet_view_mode', mode);
    setTimeout(() => setIsAnimatingView(false), 450);
  };

  // Consulta GET a /api/telemetry/ con Bearer Token
  const fetchTelemetry = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError(null);

    try {
      const response = await api.get('/api/telemetry/');
      const rawData = response.data;
      let parsed = rawData;

      // Soporte inteligente para la telemetría paginada del backend { count, results: [...] }
      if (rawData && rawData.results && Array.isArray(rawData.results)) {
        const latest = rawData.results[0] || {};
        const prevActuators = telemetry?.actuadores || {
          bombaAgua: false,
          nebulizador: false,
          dosisRiegoMl: 100,
          paradaEmergencia: false,
        };

        const tempVal = typeof latest.temperatura === 'number' ? latest.temperatura : 26.4;
        const humVal = typeof latest.humedad === 'number' ? latest.humedad : (typeof latest.humedadSuelo === 'number' ? latest.humedadSuelo : 52.0);
        const rawLuzVal = typeof latest.luz === 'number' ? latest.luz : (typeof latest.luzSolar === 'number' ? latest.luzSolar : 78.0);
        const luzVal = rawLuzVal > 100 ? Math.min(100, Math.round(rawLuzVal / 10)) : rawLuzVal;

        parsed = {
          nodo: latest.module ? `Módulo IoT #${latest.module}` : 'nodo_central_01',
          moduleId: latest.module || 1,
          sensores: {
            temperatura: tempVal,
            humedadSuelo: humVal,
            luzSolar: luzVal,
          },
          actuadores: prevActuators,
          timestamp: latest.timestamp || new Date().toISOString(),
          rawResults: rawData.results,
        };
      } else if (rawData && typeof rawData.temperatura === 'number' && !rawData.sensores) {
        // Objeto plano de telemetría
        const tempVal = rawData.temperatura;
        const humVal = typeof rawData.humedad === 'number' ? rawData.humedad : (rawData.humedadSuelo || 52.0);
        const rawLuzVal = typeof rawData.luz === 'number' ? rawData.luz : (rawData.luzSolar || 78.0);
        const luzVal = rawLuzVal > 100 ? Math.min(100, Math.round(rawLuzVal / 10)) : rawLuzVal;

        parsed = {
          nodo: rawData.module ? `Módulo IoT #${rawData.module}` : 'nodo_central_01',
          sensores: {
            temperatura: tempVal,
            humedadSuelo: humVal,
            luzSolar: luzVal,
          },
          actuadores: telemetry?.actuadores || {
            bombaAgua: false,
            nebulizador: false,
            dosisRiegoMl: 100,
            paradaEmergencia: false,
          },
          timestamp: rawData.timestamp || new Date().toISOString(),
        };
      }

      setTelemetry(parsed);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('[SmartGarden API Sync Fallback]', err);
      if (err.response && err.response.status !== 401) {
        setError(`Error del servidor (${err.response.status}) al obtener telemetría.`);
      } else if (!err.response) {
        // En desarrollo local o antes de levantar el backend, establecemos valores iniciales
        if (!telemetry) {
          setTelemetry({
            sensores: { temperatura: 26.4, humedadSuelo: 52, luzSolar: 78 },
            actuadores: { bombaAgua: false, nebulizador: false, dosisRiegoMl: 100, paradaEmergencia: false }
          });
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [telemetry]);

  const fetchUserPlants = useCallback(async () => {
    try {
      const res = await api.get('/api/user-plants/');
      const plants = res.data.results || (Array.isArray(res.data) ? res.data : []);
      setUserPlants(plants);
      if (plants.length > 0) {
        setSelectedPlantId(prev => {
          if (prev && plants.some(p => p.id === prev)) return prev;
          const firstId = plants[0].id;
          localStorage.setItem('smartgarden_selected_plant', firstId);
          return firstId;
        });
      } else {
        setSelectedPlantId(null);
        localStorage.removeItem('smartgarden_selected_plant');
      }
    } catch (err) {
      console.warn('Error al cargar plantas de usuario', err);
    }
  }, []);

  const handleDeletePlant = async (e, plantId, plantName) => {
    e.stopPropagation();
    if (!window.confirm(`¿Estás seguro de eliminar la maceta "${plantName}" de tu flota?\nEsta acción retirará la tarjeta del jardín.`)) {
      return;
    }
    try {
      await api.delete(`/api/user-plants/${plantId}/`);
      setUserPlants(prev => prev.filter(p => p.id !== plantId));
      if (selectedPlantId === plantId) {
        setSelectedPlantId(null);
        localStorage.removeItem('smartgarden_selected_plant');
      }
    } catch (err) {
      console.error('Error al eliminar maceta', err);
      alert('No se pudo eliminar la maceta. Intenta nuevamente.');
    }
  };

  const getPlantHealth = (plant) => {
    const t = telemetry?.sensores?.temperatura ?? 26.4;
    const h = telemetry?.sensores?.humedadSuelo ?? 52;
    const minH = plant?.humedad_min ?? plant?.humedad_optima ?? 30.0;
    const maxT = plant?.temp_max ?? 35.0;
    const minT = plant?.temp_min ?? 15.0;

    if (h < minH || t > maxT || t < minT) {
      return { status: 'critico', badgeClass: 'bg-red-500 text-white', label: '🔴 Crítico' };
    }
    if (h < minH + 8 || t > maxT - 2.5 || t < minT + 2.5) {
      return { status: 'atencion', badgeClass: 'bg-amber-500 text-white', label: '🟠 Atención' };
    }
    return { status: 'optimo', badgeClass: 'bg-[#2ECC71] text-white', label: '🟢 Óptimo' };
  };

  useEffect(() => {
    fetchTelemetry();
    fetchUserPlants();
    const interval = setInterval(() => fetchTelemetry(), 8000); // Polling cada 8s
    return () => clearInterval(interval);
  }, [fetchTelemetry, fetchUserPlants]);

  // Cierre de sesión y limpieza de tokens
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('operator_user');
    localStorage.removeItem('smartgarden_selected_plant');
    navigate('/login', { replace: true });
  };

  // Actualización optimista de actuadores desde ControlPanel
  const handleActuatorUpdate = (updatedActuators) => {
    setTelemetry((prev) => {
      const currentSensors = prev?.sensores || { temperatura: 26.4, humedadSuelo: 52, luzSolar: 78 };
      const currentActuators = prev?.actuadores || {};
      return {
        ...prev,
        sensores: currentSensors,
        actuadores: { ...currentActuators, ...updatedActuators }
      };
    });
  };

  const operator = localStorage.getItem('operator_user') || 'Operador';
  const sensors = telemetry?.sensores || telemetry || {};
  const actuators = telemetry?.actuadores || {
    bombaAgua: false,
    nebulizador: false,
    dosisRiegoMl: 100,
    paradaEmergencia: false,
  };
  const selectedPlant = userPlants.find((plant) => plant.id === selectedPlantId);
  const selectedProfile = {
    name: selectedPlant?.apodo || 'Perfil ambiental',
    maxTemp: selectedPlant?.temp_max ?? 35.0,
    minHumidity: selectedPlant?.humedad_optima ?? 30.0,
  };

  const temp = typeof sensors.temperatura === 'number' ? sensors.temperatura : 26.4;
  const humidity = typeof sensors.humedadSuelo === 'number' ? sensors.humedadSuelo : 52;
  const light = typeof sensors.luzSolar === 'number' ? sensors.luzSolar : 78;

  // Umbrales fisiológicos de seguridad ambiental (ISO/IEC 27400)
  const isTempCritical = temp > 35.0;
  const isHumidityLow = humidity < 30.0;
  const isEmergencyActive = actuators.paradaEmergencia === true;

  // Clases condicionales de diseño Pastel Minimalism vs True Black OLED
  const bgMain = isOled ? 'bg-[#000000] text-[#E0E0E0]' : 'bg-[#F5F5F0] text-[#2D3748]';
  const bgHeader = isOled ? 'bg-[#121212]/90 border-[#262626]' : 'bg-[#FAF9F5]/90 border-[#E6E4DC]';
  const cardProfileBg = isOled ? 'bg-[#121212] border-[#262626]' : 'bg-[#FAF9F5] border-[#E6E4DC]';
  const mutedText = isOled ? 'text-[#A0A0A0]' : 'text-[#718096]';
  const isApiConnected = Boolean(telemetry) && !error;
  const apiStatus = loading ? 'Sincronizando' : isApiConnected ? 'API conectada' : 'API sin conexión';

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300 selection:bg-[#2ECC71]/30`}>
      
      {/* Barra Superior con Conmutador Sol ☀️ / Luna 🌙 */}
      <header className={`sticky top-0 z-30 ${bgHeader} backdrop-blur-md border-b px-4 sm:px-8 py-3 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo y Branding */}
          <div className="flex items-center gap-3">
            <img src="/SmartGarden.png" alt="SmartGarden Logo" className="w-10 h-10 rounded-2xl shadow-xs object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  SmartGarden Web
                </h1>
                <span className={`hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  isOled ? 'bg-[#1E1E1E] text-[#2ECC71] border border-[#2ECC71]/30' : 'bg-[#E2E8F0] text-[#4A5568]'
                }`}>
                  Panel Experto IoT
                </span>
              </div>
              <p className="text-[11px] text-[#718096]">Supervisión Multi-Módulo & Telemetría Histórica</p>
            </div>
          </div>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Conmutador Sol ☀️ / Luna 🌙 alternado (acción de cambio) */}
            <button
              onClick={toggleTheme}
              aria-label={isOled ? "Cambiar a modo claro" : "Cambiar a modo OLED"}
              title={isOled ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isOled
                  ? 'bg-[#1A1A1A] border-[#333333] text-[#FFD600] hover:bg-[#252525]'
                  : 'bg-white border-[#E2E8F0] text-[#4A5568] hover:bg-[#F0EEE6]'
              }`}
            >
              {isOled ? (
                <Sun className="w-4 h-4 text-[#FFD600]" />
              ) : (
                <Moon className="w-4 h-4 text-[#4A5568]" />
              )}
            </button>

            {/* Insignia de Estado API */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isOled ? 'bg-[#121212] border-[#262626] text-[#A0A0A0]' : 'bg-white border-[#E2E8F0] text-[#4A5568]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                loading ? 'bg-[#D69E2E] animate-pulse' : isApiConnected ? 'bg-[#2ECC71] animate-pulse' : 'bg-[#E53E3E]'
              }`}></span>
              <span>{apiStatus}</span>
            </div>

            {/* Refrescar */}
            <button
              onClick={() => fetchTelemetry(true)}
              disabled={refreshing || loading}
              aria-label="Actualizar telemetría"
              title="Refrescar telemetría"
              className={`p-2 rounded-xl border transition-colors cursor-pointer disabled:opacity-50 ${
                isOled 
                  ? 'bg-[#1A1A1A] border-[#333333] text-[#A0A0A0] hover:text-white' 
                  : 'bg-white border-[#E2E8F0] text-[#718096] hover:text-[#2D3748]'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2ECC71]' : ''}`} />
            </button>

            {/* Operador y Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-inherit">
              <span className="hidden sm:inline text-xs font-semibold">{operator}</span>
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                aria-label="Cerrar sesión"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#C53030] bg-[#FFF5F5] hover:bg-[#E53E3E] hover:text-white border border-[#FED7D7] rounded-xl transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-7">

        {error && !isEmergencyActive && (
          <div className={`flex items-start gap-3 rounded-2xl border p-4 text-xs ${
            isOled ? 'bg-[#2B0E0E] border-[#591C1C] text-[#FFB4AB]' : 'bg-[#FFF5F5] border-[#FDC5C5] text-[#9B2C2C]'
          }`}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-bold">No se pudo sincronizar la telemetría</p>
              <p className="mt-0.5 opacity-90">{error} Puedes reintentar con el botón de actualización.</p>
            </div>
          </div>
        )}

        {/* Resumen operativo ultra-compacto */}
        <section className={`${cardProfileBg} border rounded-2xl p-3.5 sm:p-4 shadow-xs`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] inline-block animate-pulse" />
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                Hola, <span className="text-[#2ECC71]">{operator}</span>
              </h2>
            </div>
            
            {/* Cápsula Unificada de Estado */}
            <div className={`inline-flex items-center divide-x divide-inherit rounded-xl border px-2.5 py-1 text-[11px] font-semibold ${
              isOled ? 'bg-[#181818] border-[#2A2A2A] text-[#A0A0A0]' : 'bg-[#F9F8F5] border-[#E2E8F0] text-[#718096]'
            }`}>
              <div className="flex items-center gap-1.5 pr-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isApiConnected ? 'bg-[#2ECC71]' : 'bg-[#E53E3E]'}`} />
                <span>{isApiConnected ? 'Conectado' : 'Sin conexión'}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5">
                <Sprout className="w-3.5 h-3.5 text-[#2ECC71]" />
                <span className="truncate">{selectedProfile.name}</span>
              </div>
              <div className="flex items-center gap-1 pl-2.5">
                <span className="text-[#E65100]">⚡</span>
                <span>{isEmergencyActive ? 'Bloqueados' : `${Number(actuators.bombaAgua) + Number(actuators.nebulizador)} activos`}</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Banner E-STOP Fail-Safe */}
        {isEmergencyActive && (
          <div className="p-4 bg-[#FFECEC] border-2 border-[#E53E3E] rounded-3xl flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3 text-[#9B2C2C]">
              <AlertTriangle className="w-6 h-6 shrink-0 text-[#E53E3E]" />
              <div>
                <h3 className="text-sm font-bold">¡PARADA DE EMERGENCIA (E-STOP) ACTIVADA!</h3>
                <p className="text-xs">Actuadores detenidos automáticamente por corte de energía seguro.</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#E53E3E] text-white text-xs font-bold rounded-full">
              FAIL-SAFE
            </span>
          </div>
        )}

        {/* Banner de Alerta según Perfil Botánico */}
        {(isTempCritical || isHumidityLow) && !isEmergencyActive && (
          <div className={`p-4 rounded-3xl border flex items-center gap-3 text-xs shadow-sm ${
            isOled 
              ? 'bg-[#291B00] border-[#FFB300] text-[#FFE082]' 
              : 'bg-[#FFF9DB] border-[#F5E68A] text-[#8F6B00]'
          }`}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="leading-relaxed">
              <strong className="font-bold">Alerta para perfil "{selectedProfile.name}": </strong>
              {isTempCritical && `Temperatura de ${temp.toFixed(1)}°C excede el límite crítico de 35.0°C. `}
              {isHumidityLow && `Humedad de sustrato de ${Math.round(humidity)}% bajo el umbral de riego de 30%.`}
            </div>
          </div>
        )}

        {/* Vista de Flota • Macetas del Operador */}
        <section className={`${cardProfileBg} border rounded-3xl p-5 shadow-xs transition-colors duration-300`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-[#2ECC71]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Macetas Registradas • Flota Botánica
              </h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Selector de Modo de Vista */}
              <div className={`inline-flex items-center p-1 rounded-xl border ${isOled ? 'bg-[#181818] border-[#2A2A2A]' : 'bg-[#EAE8DF] border-[#D8DCCB]'}`}>
                <button
                  type="button"
                  onClick={() => handleFleetViewModeChange('full')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    fleetViewMode === 'full' ? 'bg-[#2ECC71] text-white shadow-xs' : 'text-[#718096] hover:text-inherit'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Completa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFleetViewModeChange('compact')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    fleetViewMode === 'compact' ? 'bg-[#2ECC71] text-white shadow-xs' : 'text-[#718096] hover:text-inherit'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Compacta</span>
                </button>
              </div>
              <span className="text-[11px] text-[#718096]">
                {userPlants.length > 0 ? `${userPlants.length} macetas activas` : 'Umbrales de seguridad: Mín 30% H • Máx 35°C T'}
              </span>
            </div>
          </div>

          {userPlants.length > 0 ? (
            <div className={`grid gap-3 transition-all duration-300 ease-out ${fleetViewMode === 'compact' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {userPlants.map((plant, idx) => {
                const isSelected = plant.id === selectedPlantId;
                const health = getPlantHealth(plant);
                const animDelay = Math.min(idx * 35, 280);

                if (fleetViewMode === 'compact') {
                  return (
                    <div
                      key={plant.id}
                      style={isAnimatingView ? { animationDelay: `${animDelay}ms` } : undefined}
                      onClick={() => {
                        setSelectedPlantId(plant.id);
                        localStorage.setItem('smartgarden_selected_plant', plant.id);
                      }}
                      className={`${isAnimatingView ? 'fleet-card-anim' : ''} p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? isOled
                            ? 'border-2 border-[#2ECC71] shadow-md shadow-[#2ECC71]/20 ring-1 ring-[#2ECC71]/30'
                            : 'border-2 border-[#15803D] shadow-md shadow-[#15803D]/25 ring-1 ring-[#15803D]/30'
                          : `border border-inherit ${isOled ? 'hover:border-[#2ECC71]/50' : 'hover:border-[#15803D]/50'}`
                      } ${
                        isOled ? 'bg-[#181818]' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-11 h-11 shrink-0">
                          {plant.imagen_url ? (
                            <img
                              src={plant.imagen_url}
                              alt={plant.nombre || plant.apodo}
                              className="w-full h-full rounded-xl object-cover ring-1 ring-black/10"
                            />
                          ) : (
                            <div className="w-full h-full rounded-xl bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center font-bold text-lg">
                              🪴
                            </div>
                          )}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOled ? 'bg-[#2ECC71]' : 'bg-[#15803D]'} border-2 border-white dark:border-[#181818] shadow-sm`}></span>
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate">{plant.nombre || plant.apodo || 'Maceta'}</p>
                            {isSelected && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#2ECC71] text-white">Activa</span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#718096] truncate">{plant.especie || 'Cultivo activo'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${health.badgeClass}`}>
                              {health.label}
                            </span>
                            <span className="text-[10px] text-[#718096]">
                              Mín: {plant.humedad_min || plant.humedad_optima || 30}% H
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeletePlant(e, plant.id, plant.nombre || plant.apodo)}
                        title="Eliminar maceta"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                }

                // Vista Completa
                return (
                  <div
                    key={plant.id}
                    style={isAnimatingView ? { animationDelay: `${animDelay}ms` } : undefined}
                    onClick={() => {
                      setSelectedPlantId(plant.id);
                      localStorage.setItem('smartgarden_selected_plant', plant.id);
                    }}
                    className={`${isAnimatingView ? 'fleet-card-anim' : ''} p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? isOled
                          ? 'border-2 border-[#2ECC71] shadow-md shadow-[#2ECC71]/20 ring-1 ring-[#2ECC71]/30'
                          : 'border-2 border-[#15803D] shadow-md shadow-[#15803D]/25 ring-1 ring-[#15803D]/30'
                        : `border border-inherit ${isOled ? 'hover:border-[#2ECC71]/50' : 'hover:border-[#15803D]/50'}`
                    } ${
                      isOled ? 'bg-[#181818]' : 'bg-white'
                    }`}
                  >
                    <div>
                      <div className="relative w-full mb-3">
                        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-100">
                          {plant.imagen_url ? (
                            <img
                              src={plant.imagen_url}
                              alt={plant.nombre || plant.apodo}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center font-bold text-2xl">
                              🪴
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={(e) => handleDeletePlant(e, plant.id, plant.nombre || plant.apodo)}
                              title="Eliminar maceta"
                              className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center z-20 pointer-events-none" title="Activa en Gemelo 3D">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full ${isOled ? 'bg-[#2ECC71]' : 'bg-[#15803D]'} opacity-75"></span>
                            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isOled ? 'bg-[#2ECC71]' : 'bg-[#15803D]'} border-2 border-white dark:border-[#181818] shadow-md`}></span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold truncate">{plant.nombre || plant.apodo || 'Maceta'}</h4>
                          <p className="text-[11px] text-[#718096] italic truncate">{plant.especie || 'Cultivo'}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${health.badgeClass}`}>
                          {health.label}
                        </span>
                      </div>
                      <div className={`mt-2.5 pt-2 border-t ${isSelected ? 'border-[#2ECC71]/35' : 'border-inherit'} text-[11px] space-y-1`}>
                        <div className="flex justify-between">
                          <span className="text-[#718096]">Humedad Mínima:</span>
                          <span className="font-bold text-[#2B6CB0]">{plant.humedad_min || 30}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#718096]">Límite Térmico:</span>
                          <span className="font-bold text-[#DD6B20]">{plant.temp_max || 35}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center rounded-2xl border border-dashed border-[#E2E8F0] dark:border-[#2A2A2A] text-xs text-[#718096]">
              No hay macetas registradas aún. El sistema supervisa con los umbrales de seguridad ambiental (Máx: 35.0°C | Mín: 30.0% H).
            </div>
          )}
        </section>

        {/* Título de Telemetría */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Telemetría Ambiental en Tiempo Real
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Nodo Central (`nodo_central_01`) • Lecturas de Sensores Físicos
            </p>
          </div>
          {lastUpdated && (
            <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border self-start sm:self-auto ${
              isOled ? 'bg-[#121212] border-[#262626] text-[#A0A0A0]' : 'bg-[#FAF9F5] border-[#E6E4DC] text-[#718096]'
            }`}>
              <Radio className="w-3.5 h-3.5 text-[#2ECC71] animate-pulse" />
              <span>Sincronizado: <strong className={isOled ? 'text-white' : 'text-[#4A5568]'}>{lastUpdated}</strong></span>
            </div>
          )}
        </div>

        {/* Rejilla de Sensores */}
        {loading && !telemetry ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`rounded-3xl p-6 h-56 animate-pulse border ${
                  isOled ? 'bg-[#121212] border-[#262626]' : 'bg-[#FAF9F5] border-[#E6E4DC]'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1: Temperatura (TMP36) */}
            <div className={`rounded-3xl p-6 border shadow-xs transition-all duration-300 flex flex-col justify-between ${
              isOled 
                ? 'bg-[#121212] border-[#442211]' 
                : 'bg-[#FFF5ED] border-[#FED7C3]'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isOled ? 'bg-[#2D160A] text-[#FF7043]' : 'bg-[#FFE4D4] text-[#DD6B20]'
                  }`}>
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${
                    isTempCritical 
                      ? 'bg-[#E53E3E] text-white animate-bounce' 
                      : isOled ? 'bg-[#2D160A] text-[#FF7043]' : 'bg-[#FED7C3] text-[#C05621]'
                  }`}>
                    {isTempCritical ? `🔥 > ${selectedProfile.maxTemp}°C` : 'Normal'}
                  </span>
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  isOled ? 'text-[#FF8A65]' : 'text-[#9C4221]'
                }`}>
                  Temperatura Ambiente
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${
                    isOled ? 'text-[#FFCCBC]' : 'text-[#7B341E]'
                  }`}>
                    {temp.toFixed(1)}
                  </span>
                  <span className={`text-lg font-bold ${isOled ? 'text-[#FF8A65]' : 'text-[#9C4221]'}`}>°C</span>
                </div>
              </div>

              <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                isOled ? 'border-[#2D160A] text-[#B07B65]' : 'border-[#FCD5C2] text-[#9C4221]'
              }`}>
                <span>Sensor TMP36 (Pin A0)</span>
                <span>Máx: {selectedProfile.maxTemp}°C</span>
              </div>
            </div>

            {/* Tarjeta 2: Humedad de Suelo (Higrómetro) */}
            <div className={`rounded-3xl p-6 border shadow-xs transition-all duration-300 flex flex-col justify-between ${
              isOled 
                ? 'bg-[#121212] border-[#0E2F44]' 
                : 'bg-[#F0F7FF] border-[#CDE3FF]'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isOled ? 'bg-[#0E2F44] text-[#4FC3F7]' : 'bg-[#DCEBFF] text-[#2B6CB0]'
                  }`}>
                    <Droplets className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${
                    isHumidityLow 
                      ? 'bg-[#E53E3E] text-white animate-pulse' 
                      : isOled ? 'bg-[#0E2F44] text-[#4FC3F7]' : 'bg-[#CDE3FF] text-[#2B6CB0]'
                  }`}>
                    {isHumidityLow ? `💧 < ${selectedProfile.minHumidity}%` : 'Óptimo'}
                  </span>
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  isOled ? 'text-[#4FC3F7]' : 'text-[#2C5282]'
                }`}>
                  Humedad de Sustrato
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${
                    isOled ? 'text-[#B3E5FC]' : 'text-[#1A365D]'
                  }`}>
                    {Math.round(humidity)}
                  </span>
                  <span className={`text-lg font-bold ${isOled ? 'text-[#4FC3F7]' : 'text-[#2C5282]'}`}>%</span>
                </div>
              </div>

              <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                isOled ? 'border-[#0E2F44] text-[#6FA4C7]' : 'border-[#CCE0F8] text-[#2C5282]'
              }`}>
                <span>Higrómetro (Pin A2)</span>
                <span>Mín: {selectedProfile.minHumidity}%</span>
              </div>
            </div>

            {/* Tarjeta 3: Radiación Lumínica (LDR) */}
            <div className={`rounded-3xl p-6 border shadow-xs transition-all duration-300 flex flex-col justify-between ${
              isOled 
                ? 'bg-[#121212] border-[#3E3200]' 
                : 'bg-[#FFFDF0] border-[#FEEBC8]'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isOled ? 'bg-[#3E3200] text-[#FFD54F]' : 'bg-[#FEF3C7] text-[#D69E2E]'
                  }`}>
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${
                    isOled ? 'bg-[#3E3200] text-[#FFD54F]' : 'bg-[#FEF3C7] text-[#975A16]'
                  }`}>
                    Fotoperíodo
                  </span>
                </div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  isOled ? 'text-[#FFD54F]' : 'text-[#975A16]'
                }`}>
                  Radiación Lumínica
                </p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${
                    isOled ? 'text-[#FFF9C4]' : 'text-[#744210]'
                  }`}>
                    {Math.round(light)}
                  </span>
                  <span className={`text-lg font-bold ${isOled ? 'text-[#FFD54F]' : 'text-[#975A16]'}`}>%</span>
                </div>
              </div>

              <div className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                isOled ? 'border-[#3E3200] text-[#A89040]' : 'border-[#FCE6BD] text-[#975A16]'
              }`}>
                <span>Fotorresistencia LDR (Pin A1)</span>
                <span>Divisor 0-5V</span>
              </div>
            </div>

          </div>
        )}

        {/* Panel de Actuadores Interactivos */}
        <ControlPanel actuators={actuators} onUpdate={handleActuatorUpdate} />

      </main>
    </div>
  );
}
