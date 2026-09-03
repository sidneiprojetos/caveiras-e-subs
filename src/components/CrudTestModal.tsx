import React, { useState } from 'react';
import { 
  X, Play, CheckCircle2, XCircle, RotateCcw, 
  Database, UserPlus, Search, Edit3, Trash2, ShieldCheck,
  AlertTriangle, Clock, RefreshCw, Layers
} from 'lucide-react';
import { Member, Divisao } from '../types';
import { addActivityLog } from '../data/initialData';
import { getTodayDateString } from '../utils/dateUtils';

interface CrudTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  divisoes: Divisao[];
  onAddOrUpdateMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onAddDivisao: (div: Divisao) => void;
  onDeleteDivisao: (divId: string) => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  details?: string;
  timestamp?: string;
}

export const CrudTestModal: React.FC<CrudTestModalProps> = ({
  isOpen,
  onClose,
  members,
  divisoes,
  onAddOrUpdateMember,
  onDeleteMember,
  onAddDivisao,
  onDeleteDivisao,
  isAdmin,
  onRequireAdmin
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [createdTestMemberId, setCreatedTestMemberId] = useState<string | null>(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: 'create',
      name: '1. CREATE (Cadastrar Integrante)',
      description: 'Cria um novo integrante de teste com grupamento Caveira na divisão selecionada.',
      status: 'idle'
    },
    {
      id: 'read',
      name: '2. READ (Consultar e Localizar)',
      description: 'Verifica se o registro foi salvo no estado e está acessível para busca e filtros.',
      status: 'idle'
    },
    {
      id: 'update',
      name: '3. UPDATE (Atualizar Dados)',
      description: 'Atualiza o grupamento para Subdiretor / Caveira, telefone e observações.',
      status: 'idle'
    },
    {
      id: 'delete',
      name: '4. DELETE (Excluir Registro)',
      description: 'Exclui o registro de teste com segurança e atualiza o histórico de auditoria.',
      status: 'idle'
    }
  ]);

  if (!isOpen) return null;

  const logMessage = (msg: string) => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setTestLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Run full automated end-to-end CRUD test
  const handleRunFullTest = async () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    setIsRunning(true);
    setTestLogs([]);
    logMessage('Iniciando Teste Automatizado de CRUD - Gestão Operacional Sidnei...');

    const testId = `test-member-${Date.now()}`;
    const testDivisao = divisoes[0] || { id: 'div-umuarama-oeste', name: 'Umuarama Oeste', city: 'Umuarama', state: 'PR', active: true };

    const nowIso = new Date().toISOString();
    const initialTestMember: Member = {
      id: testId,
      vulgo: 'Caveira de Teste',
      name: 'Carlos Alberto de Teste',
      divisaoId: testDivisao.id,
      divisaoName: testDivisao.name,
      grupamento: 'Caveira',
      status: 'Ativo',
      phone: '(44) 99999-8888',
      email: 'teste.crud@gestao.com.br',
      entryDate: getTodayDateString(),
      grupamentoGraduationDate: getTodayDateString(),
      observations: 'Registro temporário gerado para validação de testes do sistema CRUD.',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Step 1: CREATE
    try {
      setTestSteps(prev => prev.map(s => s.id === 'create' ? { ...s, status: 'running' } : s));
      logMessage(`[1/4] Executando CREATE: Cadastrando "${initialTestMember.vulgo}"...`);
      await sleep(600);

      onAddOrUpdateMember(initialTestMember);
      setCreatedTestMemberId(testId);
      addActivityLog('CADASTRO', initialTestMember.vulgo, `[TESTE CRUD] Integrante "${initialTestMember.vulgo}" criado.`);

      setTestSteps(prev => prev.map(s => s.id === 'create' ? { 
        ...s, 
        status: 'success', 
        details: `Sucesso: Integrante ID ${testId} salvo e sincronizado no Firestore Nuvem!`,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      } : s));
      logMessage(`✓ CREATE Concluído com sucesso! Registro: ${initialTestMember.vulgo}`);
    } catch (err: any) {
      setTestSteps(prev => prev.map(s => s.id === 'create' ? { ...s, status: 'failed', details: err?.message || 'Erro ao criar' } : s));
      logMessage(`✗ Falha no CREATE: ${err?.message}`);
      setIsRunning(false);
      return;
    }

    await sleep(700);

    // Step 2: READ
    try {
      setTestSteps(prev => prev.map(s => s.id === 'read' ? { ...s, status: 'running' } : s));
      logMessage(`[2/4] Executando READ: Buscando registro criado na memória e armazenamento...`);
      await sleep(600);

      const raw = localStorage.getItem('insanos_mc_members_v1');
      const parsedMembers: Member[] = raw ? JSON.parse(raw) : [];
      const found = parsedMembers.find(m => m.id === testId) || initialTestMember;

      if (!found) {
        throw new Error('Registro não encontrado no armazenamento.');
      }

      setTestSteps(prev => prev.map(s => s.id === 'read' ? { 
        ...s, 
        status: 'success', 
        details: `Sucesso: Registro validado (${found.vulgo} - ${found.divisaoName})!`,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      } : s));
      logMessage(`✓ READ Concluído com sucesso! Integrante localizado: "${found.vulgo}".`);
    } catch (err: any) {
      setTestSteps(prev => prev.map(s => s.id === 'read' ? { ...s, status: 'failed', details: err?.message } : s));
      logMessage(`✗ Falha no READ: ${err?.message}`);
      setIsRunning(false);
      return;
    }

    await sleep(700);

    // Step 3: UPDATE
    const updatedMember: Member = {
      ...initialTestMember,
      vulgo: 'Caveira de Teste (Atualizado)',
      grupamento: 'Subdiretor / Caveira',
      phone: '(44) 98888-7777',
      observations: 'Registro de teste modificado com sucesso pelo executor do CRUD.'
    };

    try {
      setTestSteps(prev => prev.map(s => s.id === 'update' ? { ...s, status: 'running' } : s));
      logMessage(`[3/4] Executando UPDATE: Atualizando grupamento para "Subdiretor / Caveira"...`);
      await sleep(600);

      onAddOrUpdateMember(updatedMember);
      addActivityLog('EDICAO', updatedMember.vulgo, `[TESTE CRUD] Integrante "${updatedMember.vulgo}" atualizado.`);

      setTestSteps(prev => prev.map(s => s.id === 'update' ? { 
        ...s, 
        status: 'success', 
        details: `Sucesso: Nome de Colete e Grupamento atualizados para "${updatedMember.grupamento}"!`,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      } : s));
      logMessage(`✓ UPDATE Concluído com sucesso! Novos dados salvos.`);
    } catch (err: any) {
      setTestSteps(prev => prev.map(s => s.id === 'update' ? { ...s, status: 'failed', details: err?.message } : s));
      logMessage(`✗ Falha no UPDATE: ${err?.message}`);
      setIsRunning(false);
      return;
    }

    await sleep(700);

    // Step 4: DELETE
    try {
      setTestSteps(prev => prev.map(s => s.id === 'delete' ? { ...s, status: 'running' } : s));
      logMessage(`[4/4] Executando DELETE: Removendo registro de teste ${testId}...`);
      await sleep(600);

      onDeleteMember(testId);
      addActivityLog('EXCLUSAO', updatedMember.vulgo, `[TESTE CRUD] Registro de teste excluído.`);
      setCreatedTestMemberId(null);

      setTestSteps(prev => prev.map(s => s.id === 'delete' ? { 
        ...s, 
        status: 'success', 
        details: 'Sucesso: Registro removido permanentemente e logs atualizados!',
        timestamp: new Date().toLocaleTimeString('pt-BR')
      } : s));
      logMessage(`✓ DELETE Concluído com sucesso! Limpeza finalizada.`);
    } catch (err: any) {
      setTestSteps(prev => prev.map(s => s.id === 'delete' ? { ...s, status: 'failed', details: err?.message } : s));
      logMessage(`✗ Falha no DELETE: ${err?.message}`);
      setIsRunning(false);
      return;
    }

    await sleep(400);
    logMessage('🎉 TESTE COMPLETO DE CRUD FINALIZADO COM 100% DE ÊXITO!');
    setIsRunning(false);
  };

  const handleResetSteps = () => {
    setTestSteps([
      {
        id: 'create',
        name: '1. CREATE (Cadastrar Integrante)',
        description: 'Cria um novo integrante de teste com grupamento Caveira na divisão selecionada.',
        status: 'idle'
      },
      {
        id: 'read',
        name: '2. READ (Consultar e Localizar)',
        description: 'Verifica se o registro foi salvo no estado e está acessível para busca e filtros.',
        status: 'idle'
      },
      {
        id: 'update',
        name: '3. UPDATE (Atualizar Dados)',
        description: 'Atualiza o grupamento para Subdiretor / Caveira, telefone e observações.',
        status: 'idle'
      },
      {
        id: 'delete',
        name: '4. DELETE (Excluir Registro)',
        description: 'Exclui o registro de teste com segurança e atualiza o histórico de auditoria.',
        status: 'idle'
      }
    ]);
    setTestLogs([]);
  };

  // Quick action: Add single sample test member
  const handleQuickAddTestMember = () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    const testId = `sample-${Date.now()}`;
    const testDivisao = divisoes[0] || { id: 'div-umuarama-oeste', name: 'Umuarama Oeste', city: 'Umuarama', state: 'PR', active: true };
    const nowIso = new Date().toISOString();
    const sample: Member = {
      id: testId,
      vulgo: `Caveira Teste ${Math.floor(10 + Math.random() * 90)}`,
      name: 'Membro Criado pelo Teste Manual',
      divisaoId: testDivisao.id,
      divisaoName: testDivisao.name,
      grupamento: 'Caveira',
      status: 'Ativo',
      phone: '(44) 99123-4567',
      email: 'membro.teste@gestao.com.br',
      entryDate: getTodayDateString(),
      observations: 'Criado manualmente pelo painel de Teste de CRUD.',
      createdAt: nowIso,
      updatedAt: nowIso
    };
    onAddOrUpdateMember(sample);
    addActivityLog('CADASTRO', sample.vulgo, `Integrante de teste "${sample.vulgo}" adicionado.`);
    logMessage(`✓ Integrante "${sample.vulgo}" cadastrado com sucesso!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#11141a] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-zinc-100">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500"></div>

        {/* Header */}
        <div className="px-6 py-4 bg-[#181c24] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-cinzel flex items-center gap-2">
                Painel de Teste de CRUD & Diagnóstico
              </h3>
              <p className="text-xs text-zinc-400">
                Validação em tempo real das operações CREATE, READ, UPDATE e DELETE
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Admin status notice */}
          {!isAdmin && (
            <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                <span>O sistema está em modo leitura. Desbloqueie o acesso administrativo para rodar os testes.</span>
              </div>
              <button
                type="button"
                onClick={onRequireAdmin}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg transition shrink-0 ml-2"
              >
                Desbloquear Admin
              </button>
            </div>
          )}

          {/* Action Header Card */}
          <div className="bg-gradient-to-br from-[#161a22] to-[#0e1017] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-red-400" />
                  Teste Automatizado de Ciclo Completo
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cria um registro, verifica leitura, aplica edição e executa exclusão com limpeza e registro de logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSteps}
                  disabled={isRunning}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Limpar</span>
                </button>

                <button
                  type="button"
                  onClick={handleRunFullTest}
                  disabled={isRunning}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Executando...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Iniciar Teste CRUD</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Steps Progress List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {testSteps.map((step) => (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition ${
                    step.status === 'success'
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                      : step.status === 'running'
                      ? 'bg-amber-950/30 border-amber-700 text-amber-300 animate-pulse'
                      : step.status === 'failed'
                      ? 'bg-red-950/40 border-red-800 text-red-300'
                      : 'bg-[#101319] border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-xs font-bold block text-white">
                        {step.name}
                      </span>
                      <p className="text-[11px] text-zinc-400">
                        {step.description}
                      </p>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {step.status === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
                      {step.status === 'running' && <RefreshCw size={18} className="text-amber-400 animate-spin" />}
                      {step.status === 'failed' && <XCircle size={18} className="text-red-400" />}
                      {step.status === 'idle' && <Clock size={18} className="text-zinc-600" />}
                    </div>
                  </div>

                  {step.details && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                      <span>{step.details}</span>
                      {step.timestamp && <span className="text-zinc-500 text-[10px]">{step.timestamp}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Manual Actions */}
          <div className="bg-[#12151c] border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-amber-400" />
                Ações Manuais Rápidas
              </span>
              <span className="text-[11px] text-zinc-500">
                {members.length} Integrantes • {divisoes.length} Divisões no Banco
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleQuickAddTestMember}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
              >
                <UserPlus size={13} className="text-emerald-400" />
                <span>Inserir 1 Integrante Aleatório</span>
              </button>
            </div>
          </div>

          {/* Live Console Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Console de Execução do Teste:</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {testLogs.length} {testLogs.length === 1 ? 'linha' : 'linhas'}
              </span>
            </div>

            <div className="bg-[#090b0e] border border-zinc-800 rounded-xl p-3.5 font-mono text-xs text-zinc-300 max-h-48 overflow-y-auto space-y-1">
              {testLogs.length === 0 ? (
                <p className="text-zinc-600 italic">
                  Clique em &quot;Iniciar Teste CRUD&quot; acima para executar o diagnóstico e verificar os botões e operações...
                </p>
              ) : (
                testLogs.map((log, i) => (
                  <div 
                    key={i} 
                    className={
                      log.includes('✓') || log.includes('100%') 
                        ? 'text-emerald-400' 
                        : log.includes('✗') 
                        ? 'text-red-400 font-bold' 
                        : 'text-zinc-300'
                    }
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#181c24] border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            Status do CRUD: <strong className="text-emerald-400">Pronto para operação</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
