import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANIVd8ivNACjkgoXSgE3eGK7_mVpiT9eM",
  authDomain: "election2025-de224.firebaseapp.com",
  projectId: "election2025-de224",
  storageBucket: "election2025-de224.firebasestorage.app",
  messagingSenderId: "428347184164",
  appId: "1:428347184164:web:e33d62ce940af77778b4b1"
};

interface FirebaseContextType {
  db: any;
  votes: Record<string, any>;
  loading: boolean;
  error: Error | null;
  isInitialized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  db: null,
  votes: {},
  loading: true,
  error: null,
  isInitialized: false
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [votes, setVotes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [db, setDb] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeFirebase = async () => {
      try {
        // Check if Firebase is already initialized
        if (getApps().length === 0) {
          initializeApp(firebaseConfig);
        }

        const firestore = getFirestore();
        setDb(firestore);
        setIsInitialized(true);

        // Set up real-time listener for votes
        const votesRef = collection(firestore, 'votes');
        
        unsubscribe = onSnapshot(
          votesRef,
          (snapshot) => {
            const votesData: Record<string, any> = {};
            snapshot.forEach((doc) => {
              votesData[doc.id] = doc.data();
            });
            setVotes(votesData);
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching votes:', err);
            setError(new Error('Failed to connect to the voting system. Please try again.'));
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error initializing Firebase:', err);
        setError(new Error('Failed to initialize the voting system. Please refresh the page.'));
        setLoading(false);
      }
    };

    initializeFirebase();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  // Provide a way to retry initialization if it fails
  const retry = () => {
    setError(null);
    setLoading(true);
    setIsInitialized(false);
  };

  return (
    <FirebaseContext.Provider value={{ 
      db, 
      votes, 
      loading, 
      error, 
      isInitialized 
    }}>
      {error ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error.message}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry Connection
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext;