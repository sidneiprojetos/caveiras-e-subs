import React, { useState, useEffect } from 'react';
import { 
  getStoredMembers, saveStoredMembers, 
  getStoredDivisoes, saveStoredDivisoes, 
  getStoredLogs, addActivityLog 
} from './data/initialData';
import { Member, Divisao, ActivityLog } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { MemberList } from './components/MemberList';
import { DivisionManager } from './components/DivisionManager';
import { ReportsView } from './components/ReportsView';
import { DigitalIdCardView } from './components/DigitalIdCardView';
import { AuditLogsView } from './components/AuditLogsView';
import { MemberModal } from './components/MemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { CheckCircle, AlertTriangle, ShieldCheck, Skull } from 'lucide-react';

export default function App() {
  // Main Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [divisoes, setDivisoes] = useState<Divisao[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('integrantes');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');

  // Admin Access Control
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('insanos_mc_is_admin') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Member Modals
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<Member | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial Load
  useEffect(() => {
    const loadedDivisoes = getStoredDivisoes();
    const loadedMembers = getStoredMembers();
    const loadedLogs = getStoredLogs();

    setDivisoes(loadedDivisoes);
    setMembers(loadedMembers);
    setLogs(loadedLogs);
  }, []);

  // Save changes
  const handleSaveMembers = (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    saveStoredMembers(updatedMembers);
  };

  const handleSaveDivisoes = (updatedDivisoes: Divisao[]) => {
    setDivisoes(updatedDivisoes);
    saveStoredDivisoes(updatedDivisoes);
  };

  // Member CRUD Actions
  const handleAddOrUpdateMember = (member: Member) => {
    const isEditing = members.some(m => m.id === member.id);
    let updatedList: Member[];

    if (isEditing) {
      updatedList = members.map(m => m.id === member.id ? member : m);
      const newLogs = addActivityLog('EDICAO', member.vulgo, `Atualização do cadastro e grupamento (${member.grupamento}) de ${member.vulgo}.`);
      setLogs(newLogs);
      showToast(`Integrante ${member.vulgo} atualizado com sucesso!`);
    } else {
      updatedList = [member, ...members];
      const newLogs = addActivityLog('CADASTRO', member.vulgo, `Novo integrante cadastrado: ${member.vulgo} (${member.grupamento}) na Divisão ${member.divisaoName}.`);
      setLogs(newLogs);
      showToast(`Integrante ${member.vulgo} cadastrado no Insanos M.C.!`);
    }

    handleSaveMembers(updatedList);
  };

  const handleDeleteMember = (memberId: string) => {
    const memberToDelete = members.find(m => m.id === memberId);
    const updatedList = members.filter(m => m.id !== memberId);
    handleSaveMembers(updatedList);

    if (memberToDelete) {
      const newLogs = addActivityLog('EXCLUSAO', memberToDelete.vulgo, `Exclusão do cadastro de ${memberToDelete.vulgo} do sistema.`);
      setLogs(newLogs);
      showToast(`Integrante ${memberToDelete.vulgo} removido.`);
    }

    if (selectedMemberDetail?.id === memberId) {
      setSelectedMemberDetail(null);
    }
  };

  // Division CRUD Actions
  const handleAddDivisao = (newDiv: Divisao) => {
    const updated = [...divisoes, newDiv];
    handleSaveDivisoes(updated);
    const newLogs = addActivityLog('DIVISAO', newDiv.name, `Nova divisão ${newDiv.name} criada.`);
    setLogs(newLogs);
    showToast(`Divisão ${newDiv.name} cadastrada com sucesso!`);
  };

  const handleUpdateDivisao = (updatedDiv: Divisao) => {
    const updated = divisoes.map(d => d.id === updatedDiv.id ? updatedDiv : d);
    handleSaveDivisoes(updated);
    
    // Also update division name in members if name changed
    const updatedMembers = members.map(m => {
      if (m.divisaoId === updatedDiv.id) {
        return { ...m, divisaoName: updatedDiv.name };
      }
      return m;
    });
    handleSaveMembers(updatedMembers);

    const newLogs = addActivityLog('DIVISAO', updatedDiv.name, `Divisão ${updatedDiv.name} atualizada.`);
    setLogs(newLogs);
    showToast(`Divisão ${updatedDiv.name} atualizada!`);
  };

  const handleDeleteDivisao = (divisaoId: string) => {
    const div = divisoes.find(d => d.id === divisaoId);
    const updated = divisoes.filter(d => d.id !== divisaoId);
    handleSaveDivisoes(updated);
    showToast(`Divisão ${div?.name || ''} removida.`);
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('insanos_mc_is_admin', 'true');
    const newLogs = addActivityLog('ACESSO', 'Painel Admin', 'Sessão de Administrador iniciada com sucesso.');
    setLogs(newLogs);
    showToast('Acesso de Administrador Ativado!', 'success');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.setItem('insanos_mc_is_admin', 'false');
    const newLogs = addActivityLog('ACESSO', 'Painel Admin', 'Sessão de Administrador encerrada.');
    setLogs(newLogs);
    showToast('Modo Administrador bloqueado.', 'info');
  };

  // Division Filter Navigation from Division Card
  const handleSelectDivisionFilter = (divId: string) => {
    setDivisionFilter(divId);
    setActiveTab('integrantes');
  };

  // Backup restore
  const handleImportBackup = (importedMembers: Member[], importedDivisoes: Divisao[]) => {
    handleSaveMembers(importedMembers);
    handleSaveDivisoes(importedDivisoes);
    const newLogs = addActivityLog('ACESSO', 'Backup Restauração', `Banco restaurado com ${importedMembers.length} integrantes e ${importedDivisoes.length} divisões.`);
    setLogs(newLogs);
    showToast('Backup e estrutura importados com sucesso!');
  };

  const caveirasCount = members.filter(m => m.grupamento.includes('Caveira')).length;

  return (
    <div className="min-h-screen bg-[#0b0d12] text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border ${
            toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700' :
            toast.type === 'error' ? 'bg-red-950/90 text-red-300 border-red-700' :
            'bg-zinc-900/90 text-zinc-200 border-zinc-700'
          }`}>
            <CheckCircle size={16} className="text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdminAuth={() => setIsAdminModalOpen(true)}
        membersCount={members.length}
        divisoesCount={divisoes.length}
        caveirasCount={caveirasCount}
        onOpenAddMember={() => {
          setMemberToEdit(null);
          setIsMemberModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'integrantes' && (
          <MemberList
            members={members}
            divisoes={divisoes}
            onOpenAddMember={() => {
              setMemberToEdit(null);
              setIsMemberModalOpen(true);
            }}
            onSelectMember={(m) => setSelectedMemberDetail(m)}
            onEditMember={(m) => {
              setMemberToEdit(m);
              setIsMemberModalOpen(true);
            }}
            onDeleteMember={handleDeleteMember}
            isAdmin={isAdmin}
            onRequireAdmin={() => setIsAdminModalOpen(true)}
            currentDivisionFilter={divisionFilter}
            onDivisionFilterChange={setDivisionFilter}
          />
        )}

        {activeTab === 'divisoes' && (
          <DivisionManager
            divisoes={divisoes}
            members={members}
            onAddDivisao={handleAddDivisao}
            onUpdateDivisao={handleUpdateDivisao}
            onDeleteDivisao={handleDeleteDivisao}
            onSelectDivisionFilter={handleSelectDivisionFilter}
            isAdmin={isAdmin}
            onRequireAdmin={() => setIsAdminModalOpen(true)}
          />
        )}

        {activeTab === 'relatorios' && (
          <ReportsView
            members={members}
            divisoes={divisoes}
            onImportBackup={handleImportBackup}
          />
        )}

        {activeTab === 'carteirinhas' && (
          <DigitalIdCardView
            members={members}
            divisoes={divisoes}
          />
        )}

        {activeTab === 'auditoria' && (
          <AuditLogsView
            logs={logs}
          />
        )}
      </main>

      {/* Modals */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setMemberToEdit(null);
        }}
        onSave={handleAddOrUpdateMember}
        memberToEdit={memberToEdit}
        divisoes={divisoes}
      />

      <MemberDetailModal
        isOpen={!!selectedMemberDetail}
        onClose={() => setSelectedMemberDetail(null)}
        member={selectedMemberDetail}
        onEdit={(m) => {
          setSelectedMemberDetail(null);
          setMemberToEdit(m);
          setIsMemberModalOpen(true);
        }}
        onDelete={(id) => {
          handleDeleteMember(id);
          setSelectedMemberDetail(null);
        }}
        isAdmin={isAdmin}
      />

      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#08090d] py-6 text-xs text-zinc-500 text-center no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skull size={16} className="text-red-600" />
            <span className="font-cinzel font-bold text-zinc-400">INSANOS M.C.</span>
            <span>• Regional Noroeste Paranaense</span>
          </div>
          <p className="text-[11px]">
            Divisões: Umuarama Oeste, Umuarama Leste, Cianorte, Cidade Gaúcha, Campo Mourão e Goioerê
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-zinc-400">Sistema Operacional Ativo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
