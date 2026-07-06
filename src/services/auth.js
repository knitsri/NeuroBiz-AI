import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

// Sign Up a new user and create their Firestore profile doc
export async function signUpUser(email, password, role, businessType, businessName, ownerName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile = {
      uid: user.uid,
      email: user.email,
      role,
      businessType,
      businessName,
      name: ownerName,
      createdAt: new Date().toISOString()
    };

    // Save profile doc to 'users' collection
    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error in signUpUser:', error);
    throw error;
  }
}

// Log in an existing user and fetch their Firestore profile
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    if (profileDoc.exists()) {
      return profileDoc.data();
    } else {
      throw new Error('User profile document not found in Firestore.');
    }
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
}

// Sign out
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error in logoutUser:', error);
    throw error;
  }
}

// Fetch user profile doc
export async function getUserProfile(uid) {
  try {
    const profileDoc = await getDoc(doc(db, 'users', uid));
    if (profileDoc.exists()) {
      return profileDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}
