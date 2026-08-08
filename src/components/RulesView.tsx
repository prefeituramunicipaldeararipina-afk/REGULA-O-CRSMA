import React from 'react';
import { REGRAS_CRSMA, ESPECIALIDADES_DESCRICAO } from '../data/constants';
import { ShieldAlert, Search, FileText, CreditCard, Activity, Phone, AlertCircle } from 'lucide-react';

export const RulesView: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Search':
        return <Search className="w-5 h-5 text-amber-600" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-rose-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-purple-600" />;
      case 'Phone':
        return <Phone className="w-5 h-5 text-emerald-600" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Header Card */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm border border-slate-800 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
          Secretaria Municipal de Saúde &bull; Prefeitura de Araripina
        </span>
        <h2 className="text-lg font-bold text-white">
          Diretrizes & Avisos Oficiais do Centro de Referência em Saúde da Mulher (CRSMA)
        </h2>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Para garantir a eficiência da regulação das 32 eSFs de Araripina, a coordenação estabeleceu regras essenciais que devem ser rigorosamente seguidas por médicos, enfermeiros, recepcionistas e Agentes Comunitários de Saúde (ACS).
        </p>
      </div>

      {/* Grid of Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGRAS_CRSMA.map((regra) => (
          <div
            key={regra.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  {getIcon(regra.iconeName)}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{regra.titulo}</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{regra.descricao}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Norma Oficial
              </span>
              <span className="text-slate-400 font-medium">Aplicável a todas as 32 eSFs</span>
            </div>
          </div>
        ))}
      </div>


      {/* Specialty Descriptions Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
          Rol de Especialidades Reguladas & Requisitos Clínicos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(ESPECIALIDADES_DESCRICAO).map(([nome, meta]) => (
            <div key={nome} className={`${meta.cor} p-4 rounded-xl border ${meta.bordaCor} space-y-2`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${meta.textoCor}`}>{nome}</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{meta.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
