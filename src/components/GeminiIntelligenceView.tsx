import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Cpu, AlertTriangle, FileText, Send, 
  Copy, Check, RefreshCw, Printer, Compass, Layers, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Member, Divisao } from '../types';

interface GeminiIntelligenceViewProps {
  members: Member[];
  divisoes: Divisao[];
  adminEmail: string;
  onOpenPrintPreview?: (title: string, content: string) => void;
}

interface GeminiConfig {
  name: string;
  projectId: string;
  firestoreDb: string;
  adminUser: string;
  preferredModel: string;
  status: string;
  hasApiKey: boolean;
}

export const GeminiIntelligenceView: React.FC<GeminiIntelligenceViewProps> = ({
  members,
  divisoes,
  adminEmail,
  onOpenPrintPreview
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'auditoria' | 'comunicados' | 'chat'>('auditoria');
  
  // Gemini Server Config State
  const [config, setConfig] = useState<GeminiConfig | null>({
    name: "Default Gemini Project para Gestão Sidnei",
    projectId: "gen-lang-client-0085694200",
    firestoreDb: "ai-studio-insanosmcgestode-e9224cc3-a92e-4dd8-bd9f-8d447cf10730",
    adminUser: adminEmail || "imc.sidnei@gmail.com",
    preferredModel: "gemini-3.8-flash",
    status: "online",
    hasApiKey: true
  });

  // Feature 1: Operational Audit State
  const [auditFocus, setAuditFocus] = useState<string>('Geral (Auditoria de Efetivo, Segurança e Regularidade)');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  // Feature 2: Official Bulletin Generator
  const [docTipo, setDocTipo] = useState<string>('Comunicado Oficial de Alinhamento');
  const [docTitulo, setDocTitulo] = useState<string>('Convocação Geral para Alinhamento Operacional');
  const [docPauta, setDocPauta] = useState<string>('Presença obrigatória de todos os coletes, verificação de documentação e checklist de segurança para o próximo comboio regional.');
  const [docDivisao, setDocDivisao] = useState<string>('Todas as Divisões Regionais');
  const [docPrazo, setDocPrazo] = useState<string>('Próximo Sábado às 09h00');
  const [comunicadoLoading, setComunicadoLoading] = useState<boolean>(false);
  const [comunicadoResult, setComunicadoResult] = useState<string | null>(null);
  const [copiedComunicado, setCopiedComunicado] = useState<boolean>(false);

  // Feature 3: Strategic Chat Assistant
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Olá, Administrador Sidnei! Sou o assistente de inteligência estratégica do **Default Gemini Project para Gestão Sidnei** (modelo *gemini-3.8-flash*).\n\nEstou com o banco de dados de **${members.length} integrantes** e **${divisoes.length} divisões** sincronizado. Como posso apoiar o comando operacional hoje?`
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Fetch Gemini configuration on mount
  useEffect(() => {
    fetch('/api/gemini/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.projectId) {
          setConfig(data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch /api/gemini/config, using default configuration:', err);
      });
  }, []);

  // Quick statistics
  const semSangue = members.filter(m => !m.tipoSanguineo || m.tipoSanguineo === 'Não informado').length;
  const semEmergencia = members.filter(m => !m.contatoEmergencia || m.contatoEmergencia.trim() === '').length;
  const caveirasTotal = members.filter(m => m.grupamento.includes('Caveira')).length;

  // Handler: Run Operational Audit
  const handleRunAudit = async () => {
    setAuditLoading(true);
    setAuditResult(null);
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          members,
          divisoes,
          focusArea: auditFocus
        })
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        setAuditResult(data.analysis);
      } else {
        setAuditResult(`Aviso: ${data.error || 'Não foi possível concluir a análise.'}`);
      }
    } catch (err: any) {
      setAuditResult(`Erro ao conectar com o serviço Gemini: ${err?.message || 'Falha de comunicação'}`);
    } finally {
      setAuditLoading(false);
    }
  };

  // Handler: Generate Official Bulletin
  const handleGenerateComunicado = async () => {
    setComunicadoLoading(true);
    setComunicadoResult(null);
    try {
      const response = await fetch('/api/gemini/comunicado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: docTipo,
          titulo: docTitulo,
          pauta: docPauta,
          divisaoAlvo: docDivisao,
          dataEvento: docPrazo,
          observacoes: 'Cumprimento estrito dos regulamentos e diretrizes da Gestão Sidnei'
        })
      });
      const data = await response.json();
      if (data.success && data.comunicado) {
        setComunicadoResult(data.comunicado);
      } else {
        setComunicadoResult(`Aviso: ${data.error || 'Não foi possível redigir o documento.'}`);
      }
    } catch (err: any) {
      setComunicadoResult(`Erro ao conectar com o serviço Gemini: ${err?.message || 'Falha de comunicação'}`);
    } finally {
      setComunicadoLoading(false);
    }
  };

  // Handler: Chat with Gemini
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            membersCount: members.length,
            divisoesCount: divisoes.length,
            caveirasCount: caveirasTotal,
            admin: adminEmail
          }
        })
      });
      const data = await response.json();
      if (data.success && data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          text: `Não consegui obter resposta do modelo: ${data.error || 'Erro desconhecido'}.` 
        }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Erro ao comunicar com o servidor da IA: ${err?.message || 'Verifique a conexão'}.` 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Default Gemini Project Credentials & Status */}
      <div className="bg-gradient-to-r from-[#141824] via-[#10131c] to-[#141824] border border-red-900/60 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shadow-red-950">
                <Sparkles size={18} />
              </div>
              <h2 className="text-xl font-black text-white font-cinzel tracking-wide">
                Default Gemini Project
              </h2>
              <span className="bg-red-950/80 text-red-300 border border-red-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Gestão Sidnei
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Camada de Inteligência Operacional conectada ao modelo <span className="text-amber-400 font-mono font-semibold">gemini-3.8-flash</span> para auditoria, comunicados e apoio tático.
            </p>
          </div>

          {/* Cloud Project Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-black/50 border border-zinc-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">GCP Project</span>
              <span className="font-mono text-zinc-200 font-bold tracking-tight block truncate max-w-[150px]">
                {config?.projectId || 'gen-lang-client-0085694200'}
              </span>
            </div>

            <div className="bg-black/50 border border-zinc-800/80 rounded-xl p-2.5">
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">Administrador</span>
              <span className="font-mono text-amber-300 font-bold block truncate max-w-[150px]">
                {adminEmail}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-black/50 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between sm:block">
              <span className="text-[10px] text-zinc-500 uppercase block font-mono">Status IA</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ativo / 3.8 Flash
              </span>
            </div>
          </div>
        </div>

        {/* Quick Audit Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-zinc-400">Efetivo Analisado:</span>
            <span className="text-white font-bold">{members.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-zinc-400">Caveiras:</span>
            <span className="text-amber-400 font-bold">{caveirasTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${semSangue > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-zinc-400">Sem Tipo Sangue:</span>
            <span className={semSangue > 0 ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
              {semSangue}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${semEmergencia > 0 ? 'bg-red-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-zinc-400">Sem Emergência:</span>
            <span className={semEmergencia > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
              {semEmergencia}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('auditoria')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'auditoria'
              ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
              : 'bg-[#141720] text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Cpu size={15} />
          Diagnóstico de Efetivo & Segurança
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('comunicados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'comunicados'
              ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
              : 'bg-[#141720] text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <FileText size={15} />
          Redator de Comunicados Oficiais
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'chat'
              ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
              : 'bg-[#141720] text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Sparkles size={15} />
          Assistente Tático Sidnei
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: AUDITORIA OPERACIONAL COM GEMINI */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'auditoria' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <div className="bg-[#12151d] border border-zinc-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white font-cinzel flex items-center gap-2">
              <Compass size={16} className="text-red-500" />
              Parâmetros de Auditoria
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              O modelo processará o rol atual de {members.length} integrantes e {divisoes.length} divisões, cruzando dados de grupamento, tipo sanguíneo, motos e diretoria.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Foco Principal do Relatório:
              </label>
              <select
                value={auditFocus}
                onChange={(e) => setAuditFocus(e.target.value)}
                className="w-full bg-[#0c0e12] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="Geral (Auditoria de Efetivo, Segurança e Regularidade)">Geral (Efetivo, Segurança e Regularidade)</option>
                <option value="Segurança na Estrada & Emergências Médicas">Segurança na Estrada & Emergências Médicas</option>
                <option value="Distribuição de Coletes & Formação de Lideranças">Distribuição de Coletes & Formação de Lideranças</option>
                <option value="Vistoria Técnica de Motocicletas e Placas">Vistoria Técnica de Motocicletas e Placas</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRunAudit}
              disabled={auditLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/60 disabled:opacity-50"
            >
              {auditLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Processando com Gemini 3.8 Flash...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Executar Diagnóstico Operacional
                </>
              )}
            </button>

            <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl space-y-1.5 text-[11px] text-zinc-400">
              <span className="text-zinc-300 font-semibold block">Critérios Avaliados:</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={12} /> Compatibilidade de tipo sanguíneo
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={12} /> Contatos de emergência e telefonia
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={12} /> Proporção Caveiras / Grupamentos
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={12} /> Liderança regional nas divisões
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 bg-[#12151d] border border-zinc-800/90 rounded-2xl p-6 shadow-xl flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white font-cinzel">
                  Relatório Executivo de Inteligência
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Gerado pelo Default Gemini Project sob comando de Sidnei
                </span>
              </div>

              {auditResult && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(auditResult);
                      setCopiedAudit(true);
                      setTimeout(() => setCopiedAudit(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
                  >
                    {copiedAudit ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedAudit ? 'Copiado' : 'Copiar'}
                  </button>
                  {onOpenPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onOpenPrintPreview('Diagnóstico Operacional Gemini', auditResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
                    >
                      <Printer size={14} />
                      Imprimir
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {auditLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                  <p className="text-sm font-semibold text-white">Analisando registros do efetivo no Google Cloud...</p>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    Avaliando consistência cadastral, contatos e diretrizes operacionais através do modelo Gemini 3.8 Flash.
                  </p>
                </div>
              ) : auditResult ? (
                <div className="prose prose-invert max-w-none text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-black/30 p-5 rounded-xl border border-zinc-800/80">
                  {auditResult}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-500 space-y-3">
                  <Cpu size={40} className="text-zinc-600 stroke-1" />
                  <p className="text-sm font-medium text-zinc-400">Nenhum diagnóstico gerado ainda nesta sessão.</p>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Clique no botão à esquerda para disparar a análise automatizada com IA sobre os integrantes e divisões.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: REDATOR DE COMUNICADOS OFICIAIS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'comunicados' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Panel */}
          <div className="bg-[#12151d] border border-zinc-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white font-cinzel flex items-center gap-2">
              <FileText size={16} className="text-red-500" />
              Parâmetros da Ordem / Comunicado
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tipo de Documento:</label>
              <select
                value={docTipo}
                onChange={(e) => setDocTipo(e.target.value)}
                className="w-full bg-[#0c0e12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              >
                <option value="Comunicado Oficial de Alinhamento">Comunicado Oficial de Alinhamento</option>
                <option value="Ordem de Serviço de Comboio & Segurança">Ordem de Serviço de Comboio & Segurança</option>
                <option value="Convocação de Reunião de Diretoria">Convocação de Reunião de Diretoria</option>
                <option value="Aviso de Vistoria de Coletes e Motocicletas">Aviso de Vistoria de Coletes e Motocicletas</option>
                <option value="Mensagem de Fraternidade e Disciplina">Mensagem de Fraternidade e Disciplina</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Título / Assunto:</label>
              <input
                type="text"
                value={docTitulo}
                onChange={(e) => setDocTitulo(e.target.value)}
                className="w-full bg-[#0c0e12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Pauta Principal:</label>
              <textarea
                rows={3}
                value={docPauta}
                onChange={(e) => setDocPauta(e.target.value)}
                className="w-full bg-[#0c0e12] border border-zinc-700 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Divisão Alvo:</label>
                <input
                  type="text"
                  value={docDivisao}
                  onChange={(e) => setDocDivisao(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Data / Prazo:</label>
                <input
                  type="text"
                  value={docPrazo}
                  onChange={(e) => setDocPrazo(e.target.value)}
                  className="w-full bg-[#0c0e12] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateComunicado}
              disabled={comunicadoLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-950/60 disabled:opacity-50"
            >
              {comunicadoLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Redigindo com Gemini...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Gerar Comunicado Oficial
                </>
              )}
            </button>
          </div>

          {/* Result Preview */}
          <div className="lg:col-span-2 bg-[#12151d] border border-zinc-800/90 rounded-2xl p-6 shadow-xl flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-white font-cinzel">Documento Formatado</h3>
                <span className="text-[11px] text-zinc-400">Assinado eletronicamente por Sidnei (Administrador Geral)</span>
              </div>

              {comunicadoResult && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(comunicadoResult);
                      setCopiedComunicado(true);
                      setTimeout(() => setCopiedComunicado(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
                  >
                    {copiedComunicado ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedComunicado ? 'Copiado' : 'Copiar'}
                  </button>
                  {onOpenPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onOpenPrintPreview(docTitulo, comunicadoResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
                    >
                      <Printer size={14} />
                      Imprimir
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {comunicadoLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                  <p className="text-sm font-semibold text-white">Redigindo comunicado nos padrões oficiais...</p>
                </div>
              ) : comunicadoResult ? (
                <div className="prose prose-invert max-w-none text-zinc-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-black/40 p-5 rounded-xl border border-zinc-800/80">
                  {comunicadoResult}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 text-center text-zinc-500 space-y-3">
                  <FileText size={40} className="text-zinc-600 stroke-1" />
                  <p className="text-sm font-medium text-zinc-400">Nenhum comunicado redigido ainda.</p>
                  <p className="text-xs text-zinc-500 max-w-sm">
                    Preencha o formulário à esquerda e clique em &ldquo;Gerar Comunicado Oficial&rdquo;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: CHAT ESTRATÉGICO COM GEMINI */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'chat' && (
        <div className="bg-[#12151d] border border-zinc-800/90 rounded-2xl p-6 shadow-xl flex flex-col h-[580px]">
          
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white font-cinzel flex items-center gap-2">
                <Sparkles size={18} className="text-red-500" />
                Consulta Operacional Estratégica
              </h3>
              <p className="text-xs text-zinc-400">
                Tire dúvidas sobre regulamentos, diretrizes de comboio, fichas cadastrais e estratégias de liderança.
              </p>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
              gemini-3.8-flash
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white rounded-br-none shadow-md shadow-red-950/50'
                      : 'bg-[#181c26] text-zinc-200 border border-zinc-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#181c26] border border-zinc-800 rounded-2xl rounded-bl-none p-4 text-xs text-zinc-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span>Gemini formulando resposta estratégica...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="pt-3 pb-2 flex items-center gap-2 overflow-x-auto text-[11px] text-zinc-400 border-t border-zinc-800/80">
            <span className="shrink-0 text-zinc-500 font-semibold">Sugestões:</span>
            <button
              type="button"
              onClick={() => {
                setChatInput("Como organizar o checklist de segurança do próximo comboio regional?");
              }}
              className="shrink-0 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 px-2.5 py-1 rounded-lg transition"
            >
              Checklist de Comboio
            </button>
            <button
              type="button"
              onClick={() => {
                setChatInput("Quais são os passos recomendados para graduação de um integrante de Meio-Escudo para Caveira?");
              }}
              className="shrink-0 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 px-2.5 py-1 rounded-lg transition"
            >
              Critérios para Caveira
            </button>
            <button
              type="button"
              onClick={() => {
                setChatInput("Dicas para manter o controle rigoroso de fichas cadastrais e contato de emergência.");
              }}
              className="shrink-0 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 px-2.5 py-1 rounded-lg transition"
            >
              Gestão de Emergências
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Digite uma pergunta ou instrução operacional para o Gemini..."
              className="flex-1 bg-[#0c0e12] border border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase transition flex items-center gap-1.5 shadow-md shadow-red-950"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
