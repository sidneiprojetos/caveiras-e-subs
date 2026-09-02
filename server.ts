import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization of the Gemini SDK client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Config details for the Default Gemini Project for Gestão Sidnei
const DEFAULT_GEMINI_PROJECT = {
  name: "Default Gemini Project para Gestão Sidnei",
  projectId: "gen-lang-client-0085694200",
  firestoreDb: "ai-studio-insanosmcgestode-e9224cc3-a92e-4dd8-bd9f-8d447cf10730",
  adminUser: "imc.sidnei@gmail.com",
  preferredModel: "gemini-3.8-flash",
  environment: process.env.NODE_ENV || "development",
};

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health & Gemini Project Config Status
app.get("/api/gemini/config", (req, res) => {
  const isKeyAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0);
  res.json({
    ...DEFAULT_GEMINI_PROJECT,
    status: isKeyAvailable ? "online" : "ready",
    hasApiKey: isKeyAvailable,
    timestamp: new Date().toISOString(),
  });
});

// Operational Intelligence & Member Roster Analysis
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { members, divisoes, focusArea } = req.body;
    const ai = getGeminiClient();

    const prompt = `
Você é o Assistente Estratégico e Oficial de Inteligência da "Gestão Operacional Sidnei" (Insanos MC).
O Administrador Geral e Super Admin é Sidnei (imc.sidnei@gmail.com).

Dados do Sistema:
- Total de Integrantes: ${Array.isArray(members) ? members.length : 0}
- Total de Divisões: ${Array.isArray(divisoes) ? divisoes.length : 0}
- Área de Foco Solicitada: ${focusArea || "Geral (Auditoria de Efetivo, Segurança e Regularidade)"}

Amostra / Resumo dos Integrantes:
${JSON.stringify((members || []).slice(0, 30).map((m: any) => ({
  vulgo: m.vulgo,
  name: m.name,
  grupamento: m.grupamento,
  divisao: m.divisaoName,
  tipoSanguineo: m.tipoSanguineo,
  contatoEmergencia: m.contatoEmergencia ? "Cadastrado" : "PENDENTE",
  moto: `${m.motoModelo || ''} (${m.motoPlaca || 'SEM PLACA'})`,
  dataEntrada: m.entryDate
})), null, 2)}

Divisões Ativas:
${JSON.stringify((divisoes || []).map((d: any) => ({
  nome: d.name,
  cidade: d.cidade,
  estado: d.estado,
  diretor: d.diretor
})), null, 2)}

Por favor, elabore um Relatório Executivo de Inteligência Operacional contendo:
1. **DIAGNÓSTICO DO EFETIVO**: Avaliação de consistência, distribuição de coletes (Caveiras, Meio-Escudo, Prosper, etc.) e cobertura das divisões.
2. **ALERTAS CRÍTICOS DE SEGURANÇA NA ESTRADA**: Identificação de integrantes sem tipo sanguíneo informado, sem contato de emergência ou pendências de vistoria em motos/placas.
3. **DIRETRIZES DE COMANDO PARA A GESTÃO SIDNEI**: 3 a 5 recomendações práticas para a diretoria executar nesta semana (ex: cobrança de fichas, vistorias técnicas, alinhamento de comboio).

Adote um tom sóbrio, firme, disciplinado e fraternal característico do motociclismo estradeiro.
Formate a resposta em Markdown claro e direto.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      analysis: response.text,
      modelUsed: "gemini-3.8-flash",
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini analyze error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Falha ao processar análise operacional com Gemini.",
    });
  }
});

// Official Bulletin / Comunicado Generator
app.post("/api/gemini/comunicado", async (req, res) => {
  try {
    const { tipo, titulo, pauta, divisaoAlvo, dataEvento, observacoes } = req.body;
    const ai = getGeminiClient();

    const prompt = `
Você é o redator oficial de ordens e comunicados da "Gestão Operacional Sidnei".
Assinatura Oficial:
"Sidnei - Administrador Geral & Gestão Operacional"
E-mail Institucional: imc.sidnei@gmail.com

Crie um documento oficial e formatado com rigor de conduta, respeito e hierarquia:
- Tipo de Documento: ${tipo || "Comunicado Oficial"}
- Assunto / Título: ${titulo || "Ordem de Serviço Operacional"}
- Pauta / Objetivo: ${pauta || "Alinhamento de conduta, presença obrigatória e vistoria de coletes e motos"}
- Divisão ou Grupamento Alvo: ${divisaoAlvo || "Todas as Divisões e Efetivo Geral"}
- Data / Prazo / Evento: ${dataEvento || "Imediato"}
- Observações Especiais: ${observacoes || "Cumprimento obrigatório dos regulamentos e fraternidade"}

Estrutura desejada:
1. Cabeçalho Oficial (GESTÃO OPERACIONAL SIDNEI - COMUNICADO OFICIAL Nº ${Math.floor(100 + Math.random() * 900)}/2026)
2. Destinatários e Referência
3. Texto da Ordem / Diretriz (parágrafos claros, objetivos e de alta autoridade)
4. Recomendações de Segurança & Fraternidade
5. Fechamento formal e Assinatura institucional de Sidnei

Formate em Markdown pronto para impressão ou compartilhamento oficial.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      comunicado: response.text,
      modelUsed: "gemini-3.8-flash",
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Gemini comunicado error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Falha ao gerar comunicado com Gemini.",
    });
  }
});

// Strategic Chat Assistant for Gestão Sidnei
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const ai = getGeminiClient();

    const systemContext = `
Você é o Assistente Virtual de Inteligência da Gestão Operacional Sidnei, operando através do Default Gemini Project (gen-lang-client-0085694200) com o modelo gemini-3.8-flash.
O usuário administrador é Sidnei (imc.sidnei@gmail.com).

Você possui conhecimento operacional sobre:
- Efetivo do motoclube (Membros, Caveiras, Meio-Escudos, Prósperos, etc.).
- Organização em Divisões regionais e liderança de diretores.
- Segurança na estrada, regras de comboio, fichas de emergência (sangue, telefone, moto).
- Fichas cadastrais, carteirinhas e controle de acesso.

Resumo dos dados atuais do sistema:
- Total de membros: ${context?.membersCount || 0}
- Total de divisões: ${context?.divisoesCount || 0}
- Total de Caveiras: ${context?.caveirasCount || 0}

Seja objetivo, prestativo, profissional e com linguagem respeitosa própria do universo motociclista e de gestão de segurança.
`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `${systemContext}\n\nPergunta do Administrador Sidnei: ${message}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `${systemContext}\n\nPergunta do Administrador: ${message}`,
    });

    res.json({
      success: true,
      reply: response.text,
      modelUsed: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Gemini chat error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Erro na consulta com a IA Gemini.",
    });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC ASSETS
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Gestão Sidnei] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Gemini Project] Default Project: gen-lang-client-0085694200`);
    console.log(`[Super Admin] imc.sidnei@gmail.com`);
  });
}

// Only launch standalone HTTP server if not running in a serverless environment (e.g. Vercel)
if (process.env.VERCEL !== "1" && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export default app;
