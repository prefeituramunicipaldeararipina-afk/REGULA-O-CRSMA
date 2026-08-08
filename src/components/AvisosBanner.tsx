import React, { useState } from 'react';
import { AlertCircle, Search, FileText, CreditCard, Activity, Phone, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { REGRAS_CRSMA } from '../data/constants';

export const AvisosBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Search':
        return <Search className="w-4 h-4 text-amber-600" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-purple-600" />;
      case 'Phone':
        return <Phone className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-slate-800 transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Diretrizes de Regulação &bull; CRSMA Araripina
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              A eSF de origem deve realizar a <strong>busca ativa pelo ACS</strong> e comunicar confirmação no sistema. Levar obrigatoriamente <strong>CPF, Cartão SUS e Encaminhamento</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shrink-0"
        >
          <span>{isExpanded ? 'Ocultar Regras' : 'Ver Regras'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REGRAS_CRSMA.map((regra) => (
            <div
              key={regra.id}
              className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(regra.iconeName)}
                  <h4 className="text-xs font-bold text-slate-900">{regra.titulo}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{regra.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
