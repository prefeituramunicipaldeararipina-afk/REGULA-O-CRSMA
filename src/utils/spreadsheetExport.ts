import { Agendamento } from '../types';
import { ESPECIALIDADES, REGRAS_CRSMA } from '../data/constants';

/**
 * Generates a structured CSV matching the official Agenda Ampliada template layout of CRSMA Araripina
 */
export function generateCRSMACSV(agendamentos: Agendamento[]): string {
  const rows: string[][] = [];

  // Header 1: Main Title
  rows.push(['AGENDA AMPLIADA DO CENTRO DE REFERÊNCIA EM SAÚDE DA MULHER DE ARARIPINA']);
  rows.push([]);

  // Section per specialty
  for (const esp of ESPECIALIDADES) {
    rows.push([`>>> ESPECIALIDADE / SERVIÇO: ${esp}`]);

    // Sub-header for eSF units
    const esfHeader = ['ID Agendamento', 'Paciente', 'CPF', 'Cartão SUS', 'eSF Origem', 'ACS', 'Data Agendada', 'Status', 'Comunicado eSF'];
    rows.push(esfHeader);

    const espAgendamentos = agendamentos.filter((a) => a.especialidade === esp);
    if (espAgendamentos.length === 0) {
      rows.push(['Sem agendamentos registrados para esta especialidade.']);
    } else {
      espAgendamentos.forEach((a) => {
        rows.push([
          a.id,
          a.pacienteNome,
          a.cpf,
          a.cartaoSus,
          a.esfOrigem,
          a.acsResponsavel || '-',
          a.dataAgendada ? new Date(a.dataAgendada).toLocaleString('pt-BR') : 'Aguardando',
          a.status,
          a.comunicadoUnidade || '-',
        ]);
      });
    }

    rows.push([]);
  }

  // Section: Rules and Directives
  rows.push(['>>> REGRAS E COMUNICADOS OFICIAIS DO CRSMA']);
  REGRAS_CRSMA.forEach((r) => {
    rows.push([r.titulo, r.descricao]);
  });

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Download CSV file directly in browser
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

