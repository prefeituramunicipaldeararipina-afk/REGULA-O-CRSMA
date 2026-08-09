import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper for persistent JSON file storage
const DATA_DIR = path.join(process.cwd(), 'data_store');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const AGENDAMENTOS_FILE = path.join(DATA_DIR, 'agendamentos.json');
const USUARIOS_FILE = path.join(DATA_DIR, 'usuarios.json');

const readJsonFile = (filePath: string, fallback: any = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
};

const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

import { 
  getAgendamentosFromSupabase, 
  saveAgendamentosToSupabase, 
  getUsuariosFromSupabase, 
  saveUsuariosToSupabase,
  supabase 
} from "./db.js";

// API Routes for Central Data Synchronization (Supabase + Local Fallback)
app.get("/api/agendamentos", async (req, res) => {
  if (supabase) {
    const supabaseData = await getAgendamentosFromSupabase();
    if (supabaseData !== null) {
      return res.json({ success: true, agendamentos: supabaseData, source: 'supabase' });
    }
  }
  const agendamentos = readJsonFile(AGENDAMENTOS_FILE, null);
  res.json({ success: true, agendamentos, source: 'local' });
});

app.post("/api/agendamentos", async (req, res) => {
  const { agendamentos } = req.body;
  if (Array.isArray(agendamentos)) {
    writeJsonFile(AGENDAMENTOS_FILE, agendamentos);
    if (supabase) {
      await saveAgendamentosToSupabase(agendamentos);
    }
    return res.json({ success: true, count: agendamentos.length });
  }
  res.status(400).json({ success: false, error: 'Formato inválido para agendamentos' });
});

app.get("/api/usuarios", async (req, res) => {
  if (supabase) {
    const supabaseData = await getUsuariosFromSupabase();
    if (supabaseData !== null) {
      return res.json({ success: true, usuarios: supabaseData, source: 'supabase' });
    }
  }
  const usuarios = readJsonFile(USUARIOS_FILE, null);
  res.json({ success: true, usuarios, source: 'local' });
});

app.post("/api/usuarios", async (req, res) => {
  const { usuarios } = req.body;
  if (Array.isArray(usuarios)) {
    writeJsonFile(USUARIOS_FILE, usuarios);
    if (supabase) {
      await saveUsuariosToSupabase(usuarios);
    }
    return res.json({ success: true, count: usuarios.length });
  }
  res.status(400).json({ success: false, error: 'Formato inválido para usuários' });
});


// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/audit-analyze", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      selectedSpecialty,
      selectedEsf,
      servicosAvaliados,
      totalSolicitacoes,
      primeirasConsultas,
      retornos,
      pendentes,
      agendados,
      realizados,
      canceladosOuFaltas,
      riscoVermelho,
      riscoAmarelo,
      riscoVerde,
      riscoAzul,
      averageWaitDays,
      maxWaitDays,
      topWaitingSample
    } = req.body;

    const prompt = `
Você é um auditor médico especialista em regulação do SUS (Sistema Único de Saúde) e analista do Controle Interno e DenaSUS.
Sua tarefa é analisar os dados reais e filtros da Central de Regulação da Saúde da Mulher de Araripina (CRSMA) e gerar pareceres, análises e conclusões técnicas para o Relatório Oficial de Auditoria do SUS.

DADOS E FILTROS SELECIONADOS NO PAINEL:
- Período Auditado: De ${startDate} À ${endDate}
- Especialidade / Ficha Filtrada: ${selectedSpecialty || 'Todas as Especialidades'}
- Unidade de Saúde (eSF) Filtrada: ${selectedEsf || 'Todas as Unidades + Secretaria Municipal de Saúde'}
- Serviços do Objeto da Auditoria: ${servicosAvaliados?.length > 0 ? servicosAvaliados.join(', ') : 'Todos os serviços do CRSMA'}
- Total de Solicitações Lidas no Filtro: ${totalSolicitacoes} (1ª Consulta: ${primeirasConsultas || 0} | Retornos: ${retornos || 0})
- Pendentes na Fila: ${pendentes}
- Agendados / Confirmados: ${agendados}
- Atendimentos Realizados: ${realizados}
- Cancelados / Faltas / Absenteísmo: ${canceladosOuFaltas}
- Classificação de Risco Vermelho (Urgente): ${riscoVermelho}
- Classificação de Risco Amarelo (Prioritário): ${riscoAmarelo}
- Classificação de Risco Verde (Eletivo): ${riscoVerde}
- Classificação de Risco Azul (Habitual/Sem Risco): ${riscoAzul}
- Tempo Médio de Espera na Fila: ${averageWaitDays} dias
- Tempo Máximo de Fila Identificado: ${maxWaitDays} dias
- Amostra de Casos com Maior Tempo de Fila: ${JSON.stringify(topWaitingSample || [])}

INSTRUÇÕES DE RESPOSTA:
Analise rigorosamente estes dados específicos do filtro e responda com novo entendimento personalizado em formato JSON com as seguintes propriedades:

1. "ordemCronologica": Texto detalhando a análise do cumprimento da ordem cronológica no período de ${startDate} a ${endDate} para o filtro "${selectedSpecialty || 'Geral'}".
2. "achados": Array de 2 ou 3 objetos { "titulo": string, "severidade": "Conforme" | "Inconformidade Leve" | "Inconformidade Moderada", "descricao": string } refletindo diretamente os indicadores do filtro.
3. "causaRaiz": Análise de causa raiz justificando os gargalos ou eficiências observadas nos números atuais (${pendentes} pendentes, tempo médio de ${averageWaitDays} dias).
4. "consequenciaRisco": Avaliação técnica dos riscos assistenciais decorrentes dos prazos e volumes do filtro atual.
5. "recomendacoes": Array com 3 recomendações normativas e operacionais para a Secretaria de Saúde e CRSMA.
6. "manifestacao": Justificativa técnica formal a ser apresentada pela coordenação do CRSMA ao órgão auditor.
7. "analiseManifestacao": Análise do auditor sobre a justificativa da coordenação.
8. "conclusaoGeral": Síntese do parecer de auditoria do período com veredicto fundamentado.
9. "parecerStatus": Título do parecer (ex: "CONFORME COM RESSALVAS", "CONFORME", "NECESSITA DE ADEQUAÇÕES").
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ordemCronologica: { type: Type.STRING },
            achados: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  severidade: { type: Type.STRING },
                  descricao: { type: Type.STRING }
                },
                required: ["titulo", "severidade", "descricao"]
              }
            },
            causaRaiz: { type: Type.STRING },
            consequenciaRisco: { type: Type.STRING },
            recomendacoes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            manifestacao: { type: Type.STRING },
            analiseManifestacao: { type: Type.STRING },
            conclusaoGeral: { type: Type.STRING },
            parecerStatus: { type: Type.STRING }
          },
          required: [
            "ordemCronologica",
            "achados",
            "causaRaiz",
            "consequenciaRisco",
            "recomendacoes",
            "manifestacao",
            "analiseManifestacao",
            "conclusaoGeral",
            "parecerStatus"
          ]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error("Erro na análise de auditoria Gemini:", error);
    return res.status(500).json({ success: false, error: error?.message || 'Erro ao processar análise da IA' });
  }
});

// Vite Middleware & Production Serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
