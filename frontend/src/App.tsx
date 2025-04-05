import React, { useEffect } from 'react';
import styled from 'styled-components';
import CarnivalGame from '@components/CarnivalGame';
import WorldIDVerification from '@components/WorldIDVerification';
import { useWorldID } from '@hooks/useWorldID';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const AppContainer = styled.div<{ isVerified: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Arial', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.isVerified ? '0' : '20px'};
  height: ${props => props.isVerified ? '100vh' : 'auto'};
  overflow: ${props => props.isVerified ? 'hidden' : 'visible'};
  position: ${props => props.isVerified ? 'fixed' : 'relative'};
  top: ${props => props.isVerified ? '0' : 'auto'};
  left: ${props => props.isVerified ? '0' : 'auto'};
  right: ${props => props.isVerified ? '0' : 'auto'};
  bottom: ${props => props.isVerified ? '0' : 'auto'};
  @media (max-width: 768px) {
    padding: ${props => props.isVerified ? '0' : '1rem'};
  }
`;

const Header = styled.header`
  width: 100%;
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #3366cc;
  font-size: 32px;
  margin-bottom: 10px;
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 18px;
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

function App() {
  const { 
    isVerified, 
    handleVerification, 
    handleError, 
    checkExistingVerification,
    clearVerification
  } = useWorldID();

  useEffect(() => {
    console.log('App mounting...');
    
    // Log environment info
    console.log('Environment:', {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
    });

    // Log available modules
    console.log('Checking module availability...');
    try {
      const modules = {
        react: !!React,
        useSyncExternalStore: !!(require('use-sync-external-store/shim')),
        worldcoinIDKit: !!require('@worldcoin/idkit'),
        worldcoinMinikit: !!require('@worldcoin/minikit-js'),
      };
      console.log('Available modules:', modules);
    } catch (error) {
      console.error('Error checking modules:', error);
    }

    checkExistingVerification();

    return () => {
      console.log('App unmounting...');
    };
  }, [checkExistingVerification]);

  return (
    <ErrorBoundary>
      <AppContainer isVerified={isVerified}>
        {!isVerified && (
          <>
            <Header>
              <Title>SE7EN Blockchain Carnival</Title>
              <Subtitle>Learn blockchain concepts through interactive booths</Subtitle>
            </Header>

            <WorldIDVerification 
              onSuccess={(result) => {
                console.log('Verification result:', result);
                handleVerification(result);
              }}
              onError={handleError}
              isVerified={isVerified}
            />
          </>
        )}

        <CarnivalGame 
          isVerified={isVerified}
          onVerificationExpired={clearVerification}
        />
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App;