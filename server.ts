import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
