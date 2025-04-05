import { useState, useCallback, useEffect } from 'react';

interface MinikitVerificationResult {
  proof: string;
  nullifier_hash: string;
  credential_type: string;
  verification_level: string;
}

interface MinikitError {
  code: string;
  message?: string;
}

interface MinikitInstance {
  init?: () => Promise<void>;
  install?: () => Promise<void>;
  verify: () => Promise<MinikitVerificationResult>;
}

export function useWorldID() {
  const [isVerified, setIsVerified] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorldApp, setIsWorldApp] = useState(false);
  const [minikit, setMinikit] = useState<MinikitInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerification = useCallback(async (result: MinikitVerificationResult) => {
    try {
      console.log('Processing verification result:', result);
      
      setVerificationId(result.proof);
      setIsVerified(true);
      setError(null);
      
      // Store verification in localStorage
      localStorage.setItem('worldcoin_verified', 'true');
      localStorage.setItem('worldcoin_proof', result.proof);
      localStorage.setItem('worldcoin_nullifier', result.nullifier_hash);
      localStorage.setItem('worldcoin_credential_type', result.credential_type);
      
      return true;
    } catch (err) {
      console.error('Error handling verification:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
      setIsVerified(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startVerification = useCallback(async () => {
    try {
      if (!minikit) {
        throw new Error('MiniKit not initialized');
      }
      setIsLoading(true);
      setError(null);
      
      console.log('Starting verification with MiniKit...');
      const result = await minikit.verify();
      console.log('Verification result:', result);
      
      if (!result || !result.proof || !result.nullifier_hash) {
        throw new Error('Invalid verification result');
      }

      await handleVerification(result);
      
    } catch (err) {
      console.error('Failed to start verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to start verification');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, [minikit, handleVerification]);

  // Initialize MiniKit
  useEffect(() => {
    const initMiniKit = async () => {
      console.log('Initializing MiniKit...');
      try {
        // First check if we're in World App
        const isInWorldApp = [
          window.navigator.userAgent.toLowerCase().includes('worldapp'),
          window.navigator.userAgent.toLowerCase().includes('world app'),
          window.navigator.userAgent.toLowerCase().includes('world-app'),
          typeof (window as any).worldapp !== 'undefined',
          typeof (window as any).WorldApp !== 'undefined',
          typeof (window as any).MiniKit !== 'undefined'
        ].some(Boolean);

        if (!isInWorldApp) {
          throw new Error('Please open this page in World App');
        }

        setIsWorldApp(true);

        // Get MiniKit instance
        const miniKitAny = (window as any).MiniKit;
        if (!miniKitAny) {
          throw new Error('MiniKit not found in window object');
        }

        // Try to initialize MiniKit
        try {
          if (typeof miniKitAny.init === 'function') {
            await miniKitAny.init();
            console.log('MiniKit initialized via init()');
          } else if (typeof miniKitAny.install === 'function') {
            await miniKitAny.install();
            console.log('MiniKit initialized via install()');
          }
        } catch (initError) {
          console.error('MiniKit initialization error:', initError);
        }

        // Verify MiniKit has verify method
        if (typeof miniKitAny.verify !== 'function') {
          throw new Error('MiniKit verify method not found');
        }

        setMinikit(miniKitAny);
        console.log('MiniKit setup complete');

      } catch (err) {
        console.error('Failed to initialize MiniKit:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize MiniKit');
      }
    };

    initMiniKit();
  }, []);

  const checkExistingVerification = useCallback(() => {
    const verified = localStorage.getItem('worldcoin_verified');
    const proof = localStorage.getItem('worldcoin_proof');
    const nullifier = localStorage.getItem('worldcoin_nullifier');
    
    if (verified === 'true' && proof && nullifier) {
      setIsVerified(true);
      setVerificationId(proof);
    }
  }, []);

  const clearVerification = useCallback(() => {
    setIsVerified(false);
    setVerificationId(null);
    localStorage.removeItem('worldcoin_verified');
    localStorage.removeItem('worldcoin_proof');
    localStorage.removeItem('worldcoin_nullifier');
    localStorage.removeItem('worldcoin_credential_type');
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('World ID verification error:', error);
    setError(error.message);
    setIsVerified(false);
    setVerificationId(null);
    setIsLoading(false);
  }, []);

  return {
    isVerified,
    verificationId,
    error,
    isWorldApp,
    isLoading,
    startVerification,
    handleVerification,
    handleError,
    checkExistingVerification,
    clearVerification
  };
} 