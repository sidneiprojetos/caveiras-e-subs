import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Member, Divisao, ActivityLog, AdminUser, MemberStatusConfig, DEFAULT_MEMBER_STATUSES, GrupamentoConfig, DEFAULT_GRUPAMENTOS } from '../types';
import { INITIAL_MEMBERS, INITIAL_DIVISOES, INITIAL_LOGS, getStoredStatuses, getStoredGrupamentos } from '../data/initialData';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Connect to the Firestore database
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Super Admin definition
export const SUPER_ADMIN_EMAIL = 'imc.sidnei@gmail.com';

export const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'admin-super-sidnei',
  email: 'imc.sidnei@gmail.com',
  name: 'Caveira Sidnei (Administrador Geral)',
  role: 'SUPER_ADMIN',
  status: 'active',
  permissions: [
    'ALL_PERMISSIONS',
    'MEMBERS_CREATE',
    'MEMBERS_READ',
    'MEMBERS_UPDATE',
    'MEMBERS_DELETE',
    'DIVISOES_MANAGE',
    'LOGS_VIEW',
    'BACKUP_RESTORE',
    'FIREBASE_FULL_CONTROL'
  ],
  grantedAt: new Date().toISOString()
};

// Firestore collection names
const COLLECTIONS = {
  MEMBERS: 'members',
  DIVISOES: 'divisoes',
  LOGS: 'logs',
  SETTINGS: 'settings',
  ADMINS: 'admins',
  STATUSES: 'statuses',
  GRUPAMENTOS: 'grupamentos'
};

/**
 * Real-time subscription to Members with auto-seed if cloud collection is empty
 */
export const subscribeToMembers = (
  callback: (members: Member[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.MEMBERS);
  
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // If Firestore is empty, check localStorage first or use INITIAL_MEMBERS
      let initialData = INITIAL_MEMBERS;
      try {
        const rawLocal = localStorage.getItem('insanos_mc_members_v1');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialData = parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read localStorage for initial seed', e);
      }

      // Seed Firestore with initial data
      try {
        const batch = writeBatch(db);
        initialData.forEach((member) => {
          const docRef = doc(db, COLLECTIONS.MEMBERS, member.id);
          batch.set(docRef, member);
        });
        await batch.commit();
      } catch (seedErr) {
        console.error('Error seeding initial members to Firestore:', seedErr);
      }
      callback(initialData);
    } else {
      const items: Member[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Member);
      });
      // Sort members with sensible default
      items.sort((a, b) => a.vulgo.localeCompare(b.vulgo));
      callback(items);
      // Keep local storage as backup cache
      try {
        localStorage.setItem('insanos_mc_members_v1', JSON.stringify(items));
      } catch (e) {}
    }
  }, (err) => {
    console.error('Firestore members subscription error:', err);
    if (onError) onError(err);
  });
};

/**
 * Real-time subscription to Divisions with auto-seed
 */
export const subscribeToDivisoes = (
  callback: (divisoes: Divisao[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.DIVISOES);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      let initialData = INITIAL_DIVISOES;
      try {
        const rawLocal = localStorage.getItem('insanos_mc_divisoes_v1');
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialData = parsed;
          }
        }
      } catch (e) {
        console.warn('Could not read localStorage for initial divisoes seed', e);
      }

      try {
        const batch = writeBatch(db);
        initialData.forEach((div) => {
          const docRef = doc(db, COLLECTIONS.DIVISOES, div.id);
          batch.set(docRef, div);
        });
        await batch.commit();
      } catch (seedErr) {
        console.error('Error seeding initial divisoes to Firestore:', seedErr);
      }
      callback(initialData);
    } else {
      const items: Divisao[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Divisao);
      });
      items.sort((a, b) => a.name.localeCompare(b.name));
      callback(items);
      try {
        localStorage.setItem('insanos_mc_divisoes_v1', JSON.stringify(items));
      } catch (e) {}
    }
  }, (err) => {
    console.error('Firestore divisoes subscription error:', err);
    if (onError) onError(err);
  });
};

/**
 * Real-time subscription to Activity Logs
 */
export const subscribeToLogs = (
  callback: (logs: ActivityLog[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.LOGS);
  
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      const initialLogs = INITIAL_LOGS;
      try {
        const batch = writeBatch(db);
        initialLogs.forEach((log) => {
          const docRef = doc(db, COLLECTIONS.LOGS, log.id);
          batch.set(docRef, log);
        });
        await batch.commit();
      } catch (e) {
        console.error('Error seeding initial logs to Firestore', e);
      }
      callback(initialLogs);
    } else {
      const items: ActivityLog[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as ActivityLog);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(items.slice(0, 150));
      try {
        localStorage.setItem('insanos_mc_logs_v1', JSON.stringify(items));
      } catch (e) {}
    }
  }, (err) => {
    console.error('Firestore logs subscription error:', err);
    if (onError) onError(err);
  });
};

/**
 * Save or update Member in Firestore
 */
export const saveMemberToFirestore = async (member: Member): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MEMBERS, member.id);
  await setDoc(docRef, {
    ...member,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

/**
 * Delete Member from Firestore
 */
export const deleteMemberFromFirestore = async (memberId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.MEMBERS, memberId);
  await deleteDoc(docRef);
};

/**
 * Save or update Divisao in Firestore
 */
export const saveDivisaoToFirestore = async (divisao: Divisao): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.DIVISOES, divisao.id);
  await setDoc(docRef, divisao, { merge: true });
};

/**
 * Delete Divisao from Firestore
 */
export const deleteDivisaoFromFirestore = async (divisaoId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.DIVISOES, divisaoId);
  await deleteDoc(docRef);
};

/**
 * Add Activity Log to Firestore
 */
export const addLogToFirestore = async (
  action: ActivityLog['action'],
  target: string,
  details: string,
  adminName: string = 'Administrador'
): Promise<ActivityLog> => {
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    adminName,
    action,
    target,
    details
  };

  try {
    const docRef = doc(db, COLLECTIONS.LOGS, newLog.id);
    await setDoc(docRef, newLog);
  } catch (err) {
    console.error('Error recording log to Firestore:', err);
  }

  return newLog;
};

/**
 * Batch import / restore data into Firestore
 */
export const importAllToFirestore = async (
  members: Member[],
  divisoes: Divisao[],
  logs?: ActivityLog[]
): Promise<void> => {
  // Batch write members
  const memberBatch = writeBatch(db);
  members.forEach((m) => {
    const docRef = doc(db, COLLECTIONS.MEMBERS, m.id);
    memberBatch.set(docRef, m);
  });
  await memberBatch.commit();

  // Batch write divisoes
  const divBatch = writeBatch(db);
  divisoes.forEach((d) => {
    const docRef = doc(db, COLLECTIONS.DIVISOES, d.id);
    divBatch.set(docRef, d);
  });
  await divBatch.commit();

  if (logs && logs.length > 0) {
    const logBatch = writeBatch(db);
    logs.slice(0, 100).forEach((l) => {
      const docRef = doc(db, COLLECTIONS.LOGS, l.id);
      logBatch.set(docRef, l);
    });
    await logBatch.commit();
  }
};

/**
 * Ensures the super admin account is provisioned in Firestore
 */
export const initSuperAdminInFirestore = async (): Promise<AdminUser> => {
  const adminDocRef = doc(db, COLLECTIONS.ADMINS, 'super_admin_sidnei');
  try {
    const snap = await getDoc(adminDocRef);
    if (!snap.exists()) {
      await setDoc(adminDocRef, DEFAULT_SUPER_ADMIN);
      console.log('Super Admin provisioned in Firestore:', DEFAULT_SUPER_ADMIN.email);
    } else {
      const current = snap.data() as AdminUser;
      if (current.role !== 'SUPER_ADMIN' || current.email !== SUPER_ADMIN_EMAIL) {
        await setDoc(adminDocRef, DEFAULT_SUPER_ADMIN, { merge: true });
      }
    }
  } catch (err) {
    console.error('Error verifying super admin in Firestore:', err);
  }
  return DEFAULT_SUPER_ADMIN;
};

/**
 * Subscribe to admins list from Firestore
 */
export const subscribeToAdmins = (
  callback: (admins: AdminUser[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.ADMINS);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      await initSuperAdminInFirestore();
      callback([DEFAULT_SUPER_ADMIN]);
    } else {
      const items: AdminUser[] = [];
      snapshot.forEach(d => items.push(d.data() as AdminUser));
      callback(items);
    }
  }, (err) => {
    console.error('Error subscribing to admins:', err);
    if (onError) onError(err);
  });
};

/**
 * Real-time subscription to Member Statuses with auto-seed if cloud collection is empty
 */
export const subscribeToStatuses = (
  callback: (statuses: MemberStatusConfig[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.STATUSES);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      let initialData = getStoredStatuses();
      try {
        const batch = writeBatch(db);
        initialData.forEach((st) => {
          const docRef = doc(db, COLLECTIONS.STATUSES, st.id);
          batch.set(docRef, st);
        });
        await batch.commit();
      } catch (seedErr) {
        console.error('Error seeding initial statuses to Firestore:', seedErr);
      }
      callback(initialData);
    } else {
      const items: MemberStatusConfig[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as MemberStatusConfig);
      });
      // Sort: defaults first, then custom alphabetically
      items.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
      callback(items);
      try {
        localStorage.setItem('insanos_mc_statuses_v1', JSON.stringify(items));
      } catch (e) {}
    }
  }, (err) => {
    console.error('Firestore statuses subscription error:', err);
    if (onError) onError(err);
  });
};

/**
 * Save or update MemberStatus in Firestore
 */
export const saveStatusToFirestore = async (status: MemberStatusConfig): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.STATUSES, status.id);
  await setDoc(docRef, status, { merge: true });
};

/**
 * Delete MemberStatus from Firestore
 */
export const deleteStatusFromFirestore = async (statusId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.STATUSES, statusId);
  await deleteDoc(docRef);
};

/**
 * Real-time subscription to Grupamentos with auto-seed if cloud collection is empty
 */
export const subscribeToGrupamentos = (
  callback: (grupamentos: GrupamentoConfig[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, COLLECTIONS.GRUPAMENTOS);

  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      let initialData = getStoredGrupamentos();
      try {
        const batch = writeBatch(db);
        initialData.forEach((gr) => {
          const docRef = doc(db, COLLECTIONS.GRUPAMENTOS, gr.id);
          batch.set(docRef, gr);
        });
        await batch.commit();
      } catch (seedErr) {
        console.error('Error seeding initial grupamentos to Firestore:', seedErr);
      }
      callback(initialData);
    } else {
      const items: GrupamentoConfig[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as GrupamentoConfig);
      });
      // Sort: defaults first, then custom alphabetically
      items.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
      callback(items);
      try {
        localStorage.setItem('insanos_mc_grupamentos_v1', JSON.stringify(items));
      } catch (e) {}
    }
  }, (err) => {
    console.error('Firestore grupamentos subscription error:', err);
    if (onError) onError(err);
  });
};

/**
 * Save or update Grupamento in Firestore
 */
export const saveGrupamentoToFirestore = async (grupamento: GrupamentoConfig): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.GRUPAMENTOS, grupamento.id);
  await setDoc(docRef, grupamento, { merge: true });
};

/**
 * Delete Grupamento from Firestore
 */
export const deleteGrupamentoFromFirestore = async (grupamentoId: string): Promise<void> => {
  const docRef = doc(db, COLLECTIONS.GRUPAMENTOS, grupamentoId);
  await deleteDoc(docRef);
};


