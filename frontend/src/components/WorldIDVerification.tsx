import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'
import styled from 'styled-components'
import { useEffect, useState } from 'react'

const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`

const VerifyButton = styled.button`
  background: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const StatusMessage = styled.div<{ isError?: boolean }>`
  color: ${props => props.isError ? '#e74c3c' : '#2ecc71'};
  margin: 10px 0;
  text-align: center;
`

interface VerificationResult {
  finalPayload: {
    proof: any;
    nullifier_hash: string;
  };
}

interface WorldIDVerificationProps {
  onSuccess: (result?: any) => void;
  onError?: (error: Error) => void;
  isVerified?: boolean;
}

const WorldIDVerification: React.FC<WorldIDVerificationProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMiniKit = async () => {
      try {
        // First, ensure we're in World App
        const isWorldApp = [
          window.navigator.userAgent.toLowerCase().includes('worldapp'),
          window.navigator.userAgent.toLowerCase().includes('world app'),
          window.navigator.userAgent.toLowerCase().includes('world-app'),
          typeof (window as any).worldapp !== 'undefined',
          typeof (window as any).WorldApp !== 'undefined',
          typeof (window as any).MiniKit !== 'undefined'
        ].some(Boolean);

        if (!isWorldApp) {
          throw new Error('Please open this page in World App');
        }

        // Initialize MiniKit
        console.log('Initializing MiniKit...');
        try {
          // Try to initialize MiniKit if the method exists
          const miniKitAny = MiniKit as any;
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
        
        // Wait for MiniKit to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('MiniKit initialization timed out')), 5000);
          
          const checkMiniKit = () => {
            // Check if MiniKit is available and has the verify method
            const miniKitAvailable = typeof MiniKit?.commandsAsync?.verify === 'function';
            
            if (miniKitAvailable) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkMiniKit, 500);
            }
          };
          
          checkMiniKit();
        });

        console.log('MiniKit initialized successfully');
      } catch (err) {
        console.error('MiniKit initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize World ID');
      }
    };

    initMiniKit();
  }, []);

  const handleVerifyClick = async () => {
    console.log('Starting verification process...');
    setIsLoading(true);
    setError(null);

    try {
      // Double check MiniKit is available
      if (typeof MiniKit?.commandsAsync?.verify !== 'function') {
        throw new Error('Verification is not available. Please make sure you are using World App.');
      }

      const verifyPayload: VerifyCommandInput = {
        action: 'verify',
        verification_level: VerificationLevel.Orb,
      };

      console.log('Verification payload:', verifyPayload);
      
      const result = await MiniKit.commandsAsync.verify(verifyPayload);
      console.log('Raw verification result:', result);
      
      if (!result) {
        throw new Error('No verification response received');
      }
      // Handle both possible response formats
      if (typeof result === 'object') {
        if ('proof' in result && 'nullifier_hash' in result) {
          // Direct proof format
          console.log('Verification successful (direct proof format)');
          setIsVerified(true);
          onSuccess(result); // Pass the result to onSuccess
        } else if ('finalPayload' in result && typeof result.finalPayload === 'object') {
          // Nested finalPayload format
          const finalPayload = result.finalPayload;
          if ('proof' in finalPayload && 'nullifier_hash' in finalPayload) {
            console.log('Verification successful (finalPayload format)');
            setIsVerified(true);
            onSuccess(result); // Pass the result to onSuccess
          } else {
            throw new Error('Invalid finalPayload format');
          }
        } else {
          throw new Error('Invalid verification response format');
        }
      } else {
        throw new Error('Invalid verification response type');
      }

    } catch (err) {
      console.error('Verification error:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setIsVerified(false);
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isVerifyAvailable = typeof MiniKit?.commandsAsync?.verify === 'function';

  return (
    <VerificationContainer>
      {isLoading && (
        <>
          <LoadingSpinner />
          <StatusMessage>
            Verifying... Please check your World App for prompts.
            {error && <div style={{ color: '#e74c3c', marginTop: '8px' }}>{error}</div>}
          </StatusMessage>
        </>
      )}
      
      {!isLoading && error && (
        <StatusMessage isError>{error}</StatusMessage>
      )}

      {!isVerified && (
        <VerifyButton 
          onClick={handleVerifyClick}
          disabled={isLoading || !isVerifyAvailable}
        >
          {isLoading ? 'Verifying...' : 'Verify with World ID'}
        </VerifyButton>
      )}

      {isVerified && (
        <StatusMessage>Successfully verified with World ID!</StatusMessage>
      )}

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Status: {isVerifyAvailable ? 'World ID Ready' : 'Initializing World ID...'}
      </div>
    </VerificationContainer>
  );
};

export default WorldIDVerification; 