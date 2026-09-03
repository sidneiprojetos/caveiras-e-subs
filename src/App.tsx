import React, { useState, useEffect } from 'react';
import { 
  getStoredMembers, saveStoredMembers, 
  getStoredDivisoes, saveStoredDivisoes, 
  getStoredLogs, addActivityLog,
  getStoredStatuses, saveStoredStatuses
} from './data/initialData';
import { 
  subscribeToMembers, 
  subscribeToDivisoes, 
  subscribeToLogs, 
  saveMemberToFirestore, 
  deleteMemberFromFirestore, 
  saveDivisaoToFirestore, 
  deleteDivisaoFromFirestore, 
  addLogToFirestore, 
  importAllToFirestore,
  initSuperAdminInFirestore,
  subscribeToAdmins,
  subscribeToStatuses,
  saveStatusToFirestore,
  deleteStatusFromFirestore,
  SUPER_ADMIN_EMAIL
} from './lib/firebase';
import { Member, Divisao, ActivityLog, AdminUser, MemberStatusConfig, DEFAULT_MEMBER_STATUSES } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { MemberList } from './components/MemberList';
import { DivisionManager } from './components/DivisionManager';
import { ReportsView } from './components/ReportsView';
import { DigitalIdCardView } from './components/DigitalIdCardView';
import { AuditLogsView } from './components/AuditLogsView';
import { MemberModal } from './components/MemberModal';
import { MemberDetailModal } from './components/MemberDetailModal';
import { StatusManagerModal } from './components/StatusManagerModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { CrudTestModal } from './components/CrudTestModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { GeminiIntelligenceView } from './components/GeminiIntelligenceView';
import { printGeminiDocument } from './utils/printService';
import { CheckCircle, AlertTriangle, ShieldCheck, Skull, Cloud } from 'lucide-react';

export default function App() {
  // Main Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [divisoes, setDivisoes] = useState<Divisao[]>([]);
  const [statuses, setStatuses] = useState<MemberStatusConfig[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('integrantes');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');

  // Admin Access Control - Full Administrator (imc.sidnei@gmail.com)
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>(SUPER_ADMIN_EMAIL);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isCrudTestModalOpen, setIsCrudTestModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);

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

  // Initial Load & Firestore Real-time Subscriptions
  useEffect(() => {
    // Initial local cache load for instant render
    const loadedDivisoes = getStoredDivisoes();
    const loadedMembers = getStoredMembers();
    const loadedLogs = getStoredLogs();

    setDivisoes(loadedDivisoes);
    setMembers(loadedMembers);
    setLogs(loadedLogs);
    setStatuses(getStoredStatuses());

    // Subscribe to Firestore in Real Time
    const unsubMembers = subscribeToMembers(
      (cloudMembers) => {
        setMembers(cloudMembers);
        setIsFirestoreConnected(true);
      },
      (err) => {
        console.warn('Firestore members sync warning:', err);
      }
    );

    const unsubDivisoes = subscribeToDivisoes(
      (cloudDivisoes) => {
        setDivisoes(cloudDivisoes);
      },
      (err) => {
        console.warn('Firestore divisoes sync warning:', err);
      }
    );

    const unsubStatuses = subscribeToStatuses(
      (cloudStatuses) => {
        if (cloudStatuses && cloudStatuses.length > 0) {
          setStatuses(cloudStatuses);
          saveStoredStatuses(cloudStatuses);
        }
      },
      (err) => {
        console.warn('Firestore statuses sync warning:', err);
      }
    );

    const unsubLogs = subscribeToLogs(
      (cloudLogs) => {
        setLogs(cloudLogs);
      },
      (err) => {
        console.warn('Firestore logs sync warning:', err);
      }
    );

    // Provision & verify Super Admin in Firestore
    initSuperAdminInFirestore().catch((err) => console.error('Super Admin init error:', err));

    const unsubAdmins = subscribeToAdmins((admins) => {
      const superAdmin = admins.find((a) => a.email === SUPER_ADMIN_EMAIL);
      if (superAdmin) {
        setAdminEmail(superAdmin.email);
      }
    });

    return () => {
      unsubMembers();
      unsubDivisoes();
      unsubStatuses();
      unsubLogs();
      unsubAdmins();
    };
  }, []);

  // Save changes locally as cache
  const handleSaveMembers = (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    saveStoredMembers(updatedMembers);
  };

  const handleSaveDivisoes = (updatedDivisoes: Divisao[]) => {
    setDivisoes(updatedDivisoes);
    saveStoredDivisoes(updatedDivisoes);
  };

  // Status Management Handlers
  const handleSaveStatus = async (statusConfig: MemberStatusConfig) => {
    const existingIndex = statuses.findIndex(s => s.id === statusConfig.id || s.name.toLowerCase() === statusConfig.name.toLowerCase());
    let updatedList: MemberStatusConfig[];
    if (existingIndex >= 0) {
      updatedList = [...statuses];
      updatedList[existingIndex] = statusConfig;
    } else {
      updatedList = [...statuses, statusConfig];
    }
    setStatuses(updatedList);
    saveStoredStatuses(updatedList);

    try {
      await saveStatusToFirestore(statusConfig);
      showToast(`Status "${statusConfig.name}" configurado com sucesso!`);
    } catch (e: any) {
      console.warn('Firestore save status error, kept in local storage:', e);
      showToast(`Status salvo localmente!`);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    const statusToDelete = statuses.find(s => s.id === statusId);
    const updatedList = statuses.filter(s => s.id !== statusId);
    setStatuses(updatedList);
    saveStoredStatuses(updatedList);

    try {
      await deleteStatusFromFirestore(statusId);
      showToast(`Status "${statusToDelete?.name || ''}" removido.`);
    } catch (e: any) {
      console.warn('Firestore delete status error, removed from local storage:', e);
      showToast(`Status removido localmente.`);
    }
  };

  // Member CRUD Actions (Synced to Firestore Cloud)
  const handleAddOrUpdateMember = async (member: Member) => {
    const isEditing = members.some(m => m.id === member.id);
    let updatedList: Member[];

    if (isEditing) {
      updatedList = members.map(m => m.id === member.id ? member : m);
      showToast(`Integrante ${member.vulgo} atualizado com sucesso!`);
    } else {
      updatedList = [member, ...members];
      showToast(`Integrante ${member.vulgo} cadastrado na Op. Sid!`);
    }

    // Optimistic local update
    handleSaveMembers(updatedList);

    // Cloud Firestore persistence
    try {
      await saveMemberToFirestore(member);
      await addLogToFirestore(
        isEditing ? 'EDICAO' : 'CADASTRO',
        member.vulgo,
        isEditing 
          ? `Atualização do cadastro e grupamento (${member.grupamento}) de ${member.vulgo}.`
          : `Novo integrante cadastrado: ${member.vulgo} (${member.grupamento}) na Divisão ${member.divisaoName}.`,
        adminEmail
      );
    } catch (err) {
      console.error('Error saving member to Firestore:', err);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const memberToDelete = members.find(m => m.id === memberId);
    const updatedList = members.filter(m => m.id !== memberId);
    handleSaveMembers(updatedList);

    if (selectedMemberDetail?.id === memberId) {
      setSelectedMemberDetail(null);
    }

    if (memberToDelete) {
      showToast(`Integrante ${memberToDelete.vulgo} removido.`);
      try {
        await deleteMemberFromFirestore(memberId);
        await addLogToFirestore('EXCLUSAO', memberToDelete.vulgo, `Exclusão do cadastro de ${memberToDelete.vulgo} do sistema.`, adminEmail);
      } catch (err) {
        console.error('Error deleting member from Firestore:', err);
      }
    }
  };

  // Division CRUD Actions (Synced to Firestore Cloud)
  const handleAddDivisao = async (newDiv: Divisao) => {
    const updated = [...divisoes, newDiv];
    handleSaveDivisoes(updated);
    showToast(`Divisão ${newDiv.name} cadastrada com sucesso!`);

    try {
      await saveDivisaoToFirestore(newDiv);
      await addLogToFirestore('DIVISAO', newDiv.name, `Nova divisão ${newDiv.name} criada.`, adminEmail);
    } catch (err) {
      console.error('Error adding division to Firestore:', err);
    }
  };

  const handleUpdateDivisao = async (updatedDiv: Divisao) => {
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
    showToast(`Divisão ${updatedDiv.name} atualizada!`);

    try {
      await saveDivisaoToFirestore(updatedDiv);
      await addLogToFirestore('DIVISAO', updatedDiv.name, `Divisão ${updatedDiv.name} atualizada.`, adminEmail);
    } catch (err) {
      console.error('Error updating division in Firestore:', err);
    }
  };

  const handleDeleteDivisao = async (divisaoId: string) => {
    const div = divisoes.find(d => d.id === divisaoId);
    if (!div) return;

    // Check if any member is assigned to this division
    const memberCount = members.filter(m => m.divisaoId === divisaoId).length;
    if (memberCount > 0) {
      showToast(`Não é possível excluir: existem ${memberCount} integrante(s) vinculados a esta divisão. Transfira-os antes de excluir.`, 'error');
      return;
    }

    const updated = divisoes.filter(d => d.id !== divisaoId);
    handleSaveDivisoes(updated);
    showToast(`Divisão ${div.name} removida.`);

    try {
      await deleteDivisaoFromFirestore(divisaoId);
      await addLogToFirestore('EXCLUSAO', div.name, `Divisão "${div.name}" removida do sistema.`, adminEmail);
    } catch (err) {
      console.error('Error deleting division from Firestore:', err);
    }
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('insanos_mc_is_admin', 'true');
    addLogToFirestore('ACESSO', 'Painel Admin', `Sessão Full Administrator (${adminEmail}) ativada no Firebase.`, adminEmail);
    showToast(`Administrador Full Ativado (${adminEmail})!`, 'success');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.setItem('insanos_mc_is_admin', 'false');
    addLogToFirestore('ACESSO', 'Painel Admin', `Sessão de Administrador (${adminEmail}) pausada.`, adminEmail);
    showToast('Modo Administrador pausado.', 'info');
  };

  // Division Filter Navigation from Division Card
  const handleSelectDivisionFilter = (divId: string) => {
    setDivisionFilter(divId);
    setActiveTab('integrantes');
  };

  // Backup restore (Synced to Firestore)
  const handleImportBackup = async (importedMembers: Member[], importedDivisoes: Divisao[]) => {
    handleSaveMembers(importedMembers);
    handleSaveDivisoes(importedDivisoes);
    showToast('Backup importado! Sincronizando com Firestore...');

    try {
      await importAllToFirestore(importedMembers, importedDivisoes);
      await addLogToFirestore('ACESSO', 'Backup Restauração', `Banco restaurado com ${importedMembers.length} integrantes e ${importedDivisoes.length} divisões.`);
      showToast('Sincronização com Firebase Firestore concluída!');
    } catch (err) {
      console.error('Error syncing imported backup to Firestore:', err);
    }
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
        adminEmail={adminEmail}
        onOpenAdminAuth={() => setIsAdminModalOpen(true)}
        membersCount={members.length}
        divisoesCount={divisoes.length}
        caveirasCount={caveirasCount}
        isFirestoreConnected={isFirestoreConnected}
        onOpenAddMember={() => {
          setMemberToEdit(null);
          setIsMemberModalOpen(true);
        }}
        onOpenCrudTest={() => setIsCrudTestModalOpen(true)}
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
            statuses={statuses}
            onOpenStatusManager={() => setIsStatusModalOpen(true)}
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
            statuses={statuses}
          />
        )}

        {activeTab === 'carteirinhas' && (
          <DigitalIdCardView
            members={members}
            divisoes={divisoes}
            statuses={statuses}
          />
        )}

        {activeTab === 'gemini_ia' && (
          <GeminiIntelligenceView
            members={members}
            divisoes={divisoes}
            adminEmail={adminEmail}
            onOpenPrintPreview={(title, content) => {
              printGeminiDocument(title, content);
            }}
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
        statuses={statuses}
        onOpenStatusManager={() => setIsStatusModalOpen(true)}
        onSaveStatus={handleSaveStatus}
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
        onRequireAdmin={() => setIsAdminModalOpen(true)}
        statuses={statuses}
      />

      <StatusManagerModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        statuses={statuses}
        onSaveStatus={handleSaveStatus}
        onDeleteStatus={handleDeleteStatus}
        members={members}
        isAdmin={isAdmin}
        onRequireAdmin={() => setIsAdminModalOpen(true)}
      />

      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
      />

      <CrudTestModal
        isOpen={isCrudTestModalOpen}
        onClose={() => setIsCrudTestModalOpen(false)}
        members={members}
        divisoes={divisoes}
        onAddOrUpdateMember={handleAddOrUpdateMember}
        onDeleteMember={handleDeleteMember}
        onAddDivisao={handleAddDivisao}
        onDeleteDivisao={handleDeleteDivisao}
        isAdmin={isAdmin}
        onRequireAdmin={() => setIsAdminModalOpen(true)}
      />

      <PrintPreviewModal />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#08090d] py-6 text-xs text-zinc-500 text-center no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skull size={16} className="text-red-600" />
            <span className="font-cinzel font-bold text-zinc-400">Op. Sid</span>
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
