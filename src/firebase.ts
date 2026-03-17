import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
if (!firebaseConfig || !firebaseConfig.apiKey) {
  console.error("Firebase configuration is missing or invalid. Please check firebase-applet-config.json");
}

const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Failed to set auth persistence:", err);
});

export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    console.log("Current Origin:", window.location.origin);
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error("Firebase Auth Error:", error.code, error.message);
    
    let friendlyMessage = "Login failed. ";
    
    switch (error.code) {
      case 'auth/popup-blocked':
        friendlyMessage += "Popup was blocked by your browser. Please enable popups for this site.";
        break;
      case 'auth/popup-closed-by-user':
        friendlyMessage += "The login window was closed before completion. Please try again.";
        break;
      case 'auth/cancelled-popup-request':
        return null;
      case 'auth/network-request-failed':
        friendlyMessage += "Network error. Please check your internet connection or firewall settings.";
        break;
      case 'auth/internal-error':
        friendlyMessage += "Internal error. This often happens if 'Block Third-Party Cookies' is enabled in your browser settings. Try disabling 'Block Third-Party Cookies' or use Incognito mode.";
        break;
      case 'auth/operation-not-allowed':
        friendlyMessage += "Google login is not enabled in the Firebase project. Please enable 'Google' as a Sign-in provider in the Firebase Console.";
        break;
      case 'auth/unauthorized-domain':
        friendlyMessage += `This domain (${window.location.hostname}) is not authorized for Firebase Auth. \n\nTo fix this:\n1. Go to Firebase Console > Auth > Settings > Authorized Domains\n2. Add '${window.location.hostname}' to the list.`;
        break;
      default:
        friendlyMessage += error.message || "An unexpected error occurred.";
    }
    
    throw new Error(friendlyMessage);
  }
};
export const logOut = () => signOut(auth);

// Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();
