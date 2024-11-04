import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';
import { useFirebase } from '../contexts/FirebaseContext';

interface VoteStatus {
  canVote: boolean;
  reason?: string;
}

export const useVoteRestriction = () => {
  const { db, isInitialized } = useFirebase();
  const [voteStatus, setVoteStatus] = useState<VoteStatus>({ canVote: true });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkVoteEligibility = async () => {
      if (!isInitialized || !db) {
        setVoteStatus({
          canVote: false,
          reason: 'Voting system is currently initializing. Please try again in a moment.'
        });
        setChecking(false);
        return;
      }

      try {
        // Check localStorage first
        const localVoteRecord = localStorage.getItem('hasVoted');
        if (localVoteRecord) {
          setVoteStatus({
            canVote: false,
            reason: 'You have already voted from this device.'
          });
          setChecking(false);
          return;
        }

        // Generate and check device fingerprint
        const deviceId = generateDeviceFingerprint();
        const deviceRef = doc(db, 'devices', deviceId);
        
        try {
          const deviceDoc = await getDoc(deviceRef);
          
          if (deviceDoc.exists()) {
            setVoteStatus({
              canVote: false,
              reason: 'A vote has already been recorded from this device.'
            });
            localStorage.setItem('hasVoted', 'true');
          } else {
            setVoteStatus({ canVote: true });
          }
        } catch (err) {
          console.error('Error checking device record:', err);
          setVoteStatus({
            canVote: false,
            reason: 'Unable to verify voting eligibility. Please try again later.'
          });
        }
      } catch (err) {
        console.error('Error in vote eligibility check:', err);
        setVoteStatus({
          canVote: false,
          reason: 'Unable to verify voting eligibility. Please try again later.'
        });
      } finally {
        setChecking(false);
      }
    };

    checkVoteEligibility();
  }, [db, isInitialized]);

  const recordVote = async () => {
    if (!db || !isInitialized) {
      throw new Error('Voting system is not initialized');
    }

    try {
      const deviceId = generateDeviceFingerprint();
      await setDoc(doc(db, 'devices', deviceId), {
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('hasVoted', 'true');
    } catch (err) {
      console.error('Error recording device vote:', err);
      throw new Error('Failed to record vote. Please try again.');
    }
  };

  return { voteStatus, checking, recordVote };
};