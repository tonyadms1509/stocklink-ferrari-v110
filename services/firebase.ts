
/**
 * StockLink Ferrari | Firebase Neural Bridge
 * High-performance backend integration for South African Construction OS.
 */

// Note: In a production environment, you would import 'firebase/app' and 'firebase/firestore'
// For this build, we are defining the tactical interface for the realApi bridge.

export const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "stocklink-ferrari.firebaseapp.com",
  projectId: "stocklink-ferrari",
  storageBucket: "stocklink-ferrari.appspot.com",
  messagingSenderId: "777",
  appId: "1:777:web:ferrari"
};

export const isFirebaseConfigured = !!process.env.VITE_FIREBASE_API_KEY;

/**
 * Tactical Data Mapping for Firestore
 */
export const mapToDossier = (doc: any) => ({
    id: doc.id,
    ...doc.data(),
    syncedAt: new Date().toISOString(),
    gridState: 'verified'
});
