import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export type UserProfile = {
  name: string;
  age: number;
  updatedAt: number;
};

const USERS = 'users';
const PROFILE = 'profile';

function requireUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Utilisateur non authentifié');
  return uid;
}

function userProfileDoc() {
  const uid = requireUserId();
  return doc(db, `${USERS}/${uid}/${PROFILE}/data`);
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const docRef = userProfileDoc();
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return {
      name: data.name || '',
      age: data.age || 0,
      updatedAt: data.updatedAt || Date.now(),
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
}

export async function updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
  try {
    const docRef = userProfileDoc();
    const currentProfile = await getUserProfile();
    const updatedProfile = {
      ...currentProfile,
      ...profile,
      updatedAt: Date.now(),
    };
    
    await setDoc(docRef, updatedProfile);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
} 