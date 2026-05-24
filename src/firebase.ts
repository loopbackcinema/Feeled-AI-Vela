import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID);
export const auth = getAuth(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async () => {
  try {
    if (import.meta.env.DEV) { console.log("Current Origin:", window.location.origin); }
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    if (import.meta.env.DEV) { console.error("Firebase Auth Error:", error.code, error.message); }

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
        friendlyMessage += `This domain (${window.location.hostname}) is not authorized for Firebase Auth. \n\nTo fix this:\n1. Go to Firebase Console > Auth > Settings > Authorized Domains\n2. Add '${window.location.hostname}' to the list.\n3. Also add 'ais-pre-p53itmldkdjmi6kpqkjfru-222825292700.asia-southeast1.run.app' for the shared version.`;
        break;
      default:
        friendlyMessage += error.message || "An unexpected error occurred.";
    }
    
    throw new Error(friendlyMessage);
  }
};
export const logOut = () => signOut(auth);

// Firebase Cloud Messaging — only available in secure contexts with SW support
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

// Connection Test
async function testConnection() {
  try {
    // Attempt to fetch a dummy doc to verify connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    if (import.meta.env.DEV) { console.log("Firebase connection verified."); }
  } catch (error: any) {
    if (import.meta.env.DEV) {
      if (error.message?.includes('the client is offline')) {
        console.error("Firebase offline — check Firestore DB is created in Console.");
      } else {
        console.warn("Firebase connection test:", error.message);
      }
    }
  }
}
testConnection();
