import React from 'react';
import { Info, Radio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ControlPanel() {
  const { isOled } = useTheme();
  const cardBg = isOled ? 'bg-[#121212] border-[#262626]' : 'bg-[#FAF9F5] border-[#E6E4DC]';
  const titleColor = isOled ? 'text-[#F5F5F5]' : 'text-[#2D3748]';
  const subtitleColor = isOled ? 'text-[#9E9E9E]' : 'text-[#718096]';

  return (
    <section
      aria-labelledby="control-panel-title"
      className={`${cardBg} border rounded-3xl p-6 sm:p-8 transition-colors duration-300 shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#2ECC71]/15 text-[#2ECC71] flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <h3 id="control-panel-title" className={`text-lg font-bold tracking-tight ${titleColor}`}>
            Panel de Actuación y Dosificación IoT
          </h3>
          <p className={`text-xs mt-1 ${subtitleColor}`}>
            La telemetría se consulta desde API-Django.
          </p>
        </div>
      </div>
      <div className={`mt-5 rounded-2xl border p-4 flex items-start gap-3 ${
        isOled
          ? 'bg-[#1A1A1A] border-[#333333] text-[#A0A0A0]'
          : 'bg-white border-[#E2E8F0] text-[#718096]'
      }`}>
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#2ECC71]" />
        <p className="text-xs leading-relaxed">
          El backend actual expone módulos, plantas y telemetría. No se muestran
          controles simulados para evitar enviar comandos a endpoints que API-Django
          no implementa.
        </p>
      </div>
    </section>
  );
}
