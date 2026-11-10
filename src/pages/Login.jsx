import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sprout, Lock, User, AlertCircle, Loader2, ShieldCheck, Sun, Moon, Eye, EyeOff, Mail, CheckCircle2, UserPlus } from 'lucide-react';
import api from '../api/axiosConfig';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOled, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);
  const [activationNotice, setActivationNotice] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    // Si ya existe token activo, redirigir al Dashboard
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }

    const params = new URLSearchParams(location.search);
    if (params.get('session_expired')) {
      setSessionExpiredNotice(true);
    }

    if (params.get('activated') === 'true') {
      const actUser = params.get('user') || '';
      setActivationNotice({ type: 'success', user: actUser });
      setIsRegister(false);
    } else if (params.get('activation_error')) {
      setActivationNotice({ type: 'error' });
      setIsRegister(false);
    }

    let lastUser = localStorage.getItem('smartgarden_last_user') || localStorage.getItem('remembered_operator') || localStorage.getItem('operator_user') || '';
    if (lastUser.toLowerCase() === 'operador') {
      lastUser = '';
    }
    if (lastUser) {
      setUsername(lastUser);
      setRememberMe(true);
    }
    // La contraseña siempre se solicita (nunca se auto-completa)
    setPassword('');
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSessionExpiredNotice(false);

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    if (isRegister) {
      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico.');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Las contraseñas no coinciden. Verifica la confirmación.');
        return;
      }
    }

    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await api.post('/api/auth/register/', {
          username: username.trim(),
          email: email.trim(),
          password,
          password_confirm: passwordConfirm,
        });

        if (response.data?.requires_activation) {
          setActivationNotice({ type: 'pending', email: email.trim() });
          setIsRegister(false);
          setPassword('');
          setPasswordConfirm('');
          return;
        }
      } else {
        response = await api.post('/api/token/', {
          username: username.trim(),
          password,
        });
      }

      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('operator_user', username.trim());
      if (rememberMe) {
        localStorage.setItem('smartgarden_last_user', username.trim());
        localStorage.setItem('remembered_operator', username.trim());
      } else {
        localStorage.removeItem('smartgarden_last_user');
        localStorage.removeItem('remembered_operator');
      }
      localStorage.removeItem('remembered_password');

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[SmartGarden Auth Error]', err);
      if (err.response) {
        const errorData = err.response.data;
        const msg = typeof errorData === 'string' ? errorData : errorData?.detail || errorData?.error || '';
        if (msg.toLowerCase().includes('activada') || msg.toLowerCase().includes('activo') || msg.toLowerCase().includes('active')) {
          setError('Tu cuenta aún no ha sido activada. Por favor revisa tu correo electrónico para confirmar tu cuenta antes de ingresar.');
        } else if (errorData && errorData.error) {
          setError(errorData.error);
        } else if (err.response.status === 401) {
          setError('Credenciales incorrectas. Verifica usuario y contraseña.');
        } else if (err.response.status === 400) {
          setError(errorData?.detail || 'Datos de registro inválidos. Verifica los campos.');
        } else {
          setError(`Error del servidor (${err.response.status}). Intenta nuevamente.`);
        }
      } else if (err.request) {
        setError('No fue posible conectar con el backend Django REST. Verifica que esté activo.');
      } else {
        setError('Ocurrió un error inesperado al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bgContainer = isOled ? 'bg-[#000000] text-white' : 'bg-[#F5F5F0] text-[#2D3748]';
  const cardBg = isOled ? 'bg-[#121212] border-[#262626]' : 'bg-[#FAF9F5] border-[#E6E4DC]';
  const inputBg = isOled ? 'bg-[#1C1C1C] border-[#333333] text-white' : 'bg-white border-[#E2E8F0] text-[#2D3748]';

  return (
    <div className={`min-h-screen ${bgContainer} flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden selection:bg-[#2ECC71]/30`}>
      <div className={`pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl ${
        isOled ? 'bg-[#123D25]/30' : 'bg-[#CDEFD7]/60'
      }`} />
      <div className={`pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full blur-3xl ${
        isOled ? 'bg-[#102B3D]/30' : 'bg-[#DCEBFF]/60'
      }`} />
      
      {/* Botón Flotante Conmutador Sol ☀️ / Luna 🌙 alternado (acción de cambio) */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          title={isOled ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-center shadow-xs ${
            isOled 
              ? 'bg-[#1A1A1A] border-[#333333] text-[#FFD600] hover:bg-[#252525]' 
              : 'bg-white border-[#E2E8F0] text-[#4A5568] hover:bg-[#F0EEE6]'
          }`}
        >
          {isOled ? <Sun className="w-5 h-5 text-[#FFD600]" /> : <Moon className="w-5 h-5 text-[#4A5568]" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className={`${cardBg} border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300`}>
          
          {/* Identidad Botánica con Logo Oficial de la App Móvil */}
          <div className="flex flex-col items-center text-center mb-8">
            <img src="/SmartGarden.png" alt="SmartGarden Logo" className="w-20 h-20 rounded-3xl shadow-md mb-3 object-contain" />
            <h1 className="text-2xl font-extrabold tracking-tight">
              SmartGarden
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#718096] mt-1 font-semibold">
              {isRegister ? 'Registro de Nuevo Operador Botánico' : 'Pasarela de Supervisión Botánica'}
            </p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full text-[11px] font-medium border ${
              isOled ? 'bg-[#122233] border-[#1C3A5A] text-[#60A5FA]' : 'bg-[#EBF4FF] border-[#D1E3FF] text-[#2B6CB0]'
            }`}>
              {isRegister ? <UserPlus className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isRegister ? 'Creación de Perfil Aislado' : 'Acceso Seguro ISO/IEC 27400'}</span>
            </div>
          </div>

          {activationNotice && (
            <div className={`mb-5 p-4 rounded-2xl flex items-start gap-3 text-xs border ${
              activationNotice.type === 'success'
                ? (isOled ? 'bg-[#0E2E1B] border-[#2ECC71] text-[#2ECC71]' : 'bg-[#EAFBF0] border-[#2ECC71] text-[#1E7E34]')
                : activationNotice.type === 'pending'
                ? (isOled ? 'bg-[#102538] border-[#3B82F6] text-[#60A5FA]' : 'bg-[#EFF6FF] border-[#60A5FA] text-[#1D4ED8]')
                : (isOled ? 'bg-[#2E1810] border-[#E67E22] text-[#F39C12]' : 'bg-[#FFF8E6] border-[#F39C12] text-[#B7791F]')
            }`}>
              {activationNotice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#2ECC71]" />
              ) : activationNotice.type === 'pending' ? (
                <Mail className="w-5 h-5 shrink-0 mt-0.5 text-[#3B82F6]" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#F39C12]" />
              )}
              <div className="leading-relaxed">
                {activationNotice.type === 'success' ? (
                  <>
                    <div className="font-bold text-sm mb-0.5">¡Cuenta de operador activada!</div>
                    <span>Ya puedes iniciar sesión con tu usuario <strong>{activationNotice.user}</strong> y tu contraseña.</span>
                  </>
                ) : activationNotice.type === 'pending' ? (
                  <>
                    <div className="font-bold text-sm mb-0.5">Verificación de Correo Enviada</div>
                    <span>Hemos enviado un enlace de confirmación a <strong>{activationNotice.email}</strong>. Por favor haz clic en el enlace para activar tu cuenta antes de ingresar.</span>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-sm mb-0.5">Enlace no válido o expirado</div>
                    <span>El enlace de activación no es válido o ya fue utilizado. Si tu cuenta aún no está activa, intenta registrarte nuevamente.</span>
                  </>
                )}
              </div>
            </div>
          )}

          {sessionExpiredNotice && !isRegister && (
            <div className={`mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs border ${
              isOled ? 'bg-[#2E2000] border-[#593E00] text-[#FFD54F]' : 'bg-[#FFF9DB] border-[#F5E68A] text-[#8F6B00]'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Tu sesión ha expirado. Ingresa tus credenciales nuevamente.</span>
            </div>
          )}

          {error && (
            <div className={`mb-5 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs border ${
              isOled ? 'bg-[#2B0E0E] border-[#591C1C] text-[#FF8A80]' : 'bg-[#FFECEC] border-[#FDC5C5] text-[#C53030]'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5 ml-1">
                Operador / Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0AEC0]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. operador_botanico"
                  required
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/40 border transition-all disabled:opacity-50 ${inputBg}`}
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0AEC0]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. operador@inacap.cl"
                    required={isRegister}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-sm placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/40 border transition-all disabled:opacity-50 ${inputBg}`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0AEC0]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? "Mínimo 6 caracteres" : "Contraseña"}
                  required
                  disabled={loading}
                  className={`w-full pl-10 pr-11 py-3 rounded-2xl text-sm placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/40 border transition-all disabled:opacity-50 ${inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#A0AEC0] transition-colors hover:text-[#2ECC71] disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5 ml-1">
                  Confirmar Contraseña (Doble Confirmación)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0AEC0]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repite tu contraseña exactamente"
                    required={isRegister}
                    disabled={loading}
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl text-sm placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#2ECC71]/40 border transition-all disabled:opacity-50 ${inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((visible) => !visible)}
                    disabled={loading}
                    aria-label={showPasswordConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#A0AEC0] transition-colors hover:text-[#2ECC71] disabled:opacity-50"
                  >
                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#718096] hover:text-[#2ECC71] transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E0] text-[#2ECC71] focus:ring-[#2ECC71] cursor-pointer accent-[#2ECC71]"
                  />
                  <span>Recordar usuario</span>
                </label>
                <span className="text-[11px] text-[#A0AEC0]">Auth SimpleJWT</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium text-sm rounded-2xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isRegister ? 'Creando cuenta de operador...' : 'Autenticando contra API...'}</span>
                </>
              ) : (
                <span>{isRegister ? 'Registrar Cuenta e Iniciar' : 'Iniciar Sesión en SmartGarden'}</span>
              )}
            </button>

            <div className="pt-3 text-center">
              {isRegister ? (
                <p className="text-xs text-[#718096]">
                  ¿Ya tienes una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setError(null); }}
                    className="text-[#2ECC71] hover:underline font-bold cursor-pointer inline-flex items-center"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              ) : (
                <p className="text-xs text-[#718096]">
                  ¿Aún no tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(true); setError(null); }}
                    className="text-[#2ECC71] hover:underline font-bold cursor-pointer inline-flex items-center"
                  >
                    Regístrate aquí
                  </button>
                </p>
              )}
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-inherit text-center">
            <p className="text-[11px] text-[#718096]">
              Sistema IoT Autónomo • Telemetría UART / RTDB • INACAP 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
