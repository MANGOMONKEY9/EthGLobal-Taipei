import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useDeFi } from '@hooks/useDeFi';

const StatusMessage = styled.div`
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  color: ${props => props.style?.color || '#38a169'};
`;

const SuccessMessage = styled(StatusMessage)`
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
`;

const ErrorMessage = styled(StatusMessage)`
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
`;

const InteractionPanel = styled.div`
  width: 100%;
  background-color: #ffffff;
  border: 2px solid #333;
  border-radius: 10px;
  padding: 15px;
  margin: 0 auto;
  min-height: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  
  &:hover {
    color: #e53e3e;
  }
`;

const Content = styled.div`
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  background-color: #3366cc;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  margin-right: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #254e9c;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 8px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 80px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SeedPhraseContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 15px 0;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
`;

const SeedWord = styled.div`
  padding: 8px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
`;

const PoolsDisplay = styled.div`
  margin: 15px 0;
`;

const Pool = styled.div`
  padding: 10px;
  margin-bottom: 5px;
  background-color: #f0f4ff;
  border-radius: 5px;
  border-left: 4px solid #3366cc;
`;

// Add new styled components for DeFi features
const TokenInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const TokenAmount = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TokenLabel = styled.label`
  font-size: 14px;
  color: #666;
`;

const TokenBalance = styled.div`
  font-size: 12px;
  color: #666;
`;

const SwapArrow = styled.div`
  font-size: 24px;
  color: #4CAF50;
  margin: 10px 0;
`;

const DeFiTab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#4CAF50' : 'transparent'};
  border: 1px solid #4CAF50;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.active ? '#4CAF50' : 'rgba(76, 175, 80, 0.2)'};
  }
`;

const DeFiTabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SwapForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #4CAF50;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  width: 100%;
`;

interface BoothInteractionProps {
  boothId: string;
  onClose: () => void;
  addToInventory: (item: any) => void;
  isVerified: boolean;
}

const boothContent = {
  booth1: {
    title: "Fireside Chat: Decentralisation & Trustlessness",
    description: "Welcome to the Decentralisation & Trustlessness Fireside Chat! You see 20 people in the audience and 4 speakers on stage discussing decentralized systems."
  },
  booth2: {
    title: "Valentine's Day Special",
    description: "Welcome to the Valentine's Day Special Booth! You see people queuing for bubble tea and heart-shaped balloons."
  },
  booth3: {
    title: "Self Custody Workshop",
    description: "Welcome to the Self Custody Workshop! A presenter is explaining how to create and secure your crypto wallet to 10 students."
  },
  booth4: {
    title: "DeFi Workshop",
    description: "Welcome to the DeFi Workshop! You see 10 liquidity pools managed by a Game Master, each showing pairs of tokens."
  },
  booth5: {
    title: "Fireside Chat: The Future of Web3",
    description: "Welcome to the Future of Web3 Fireside Chat! You see 20 people in the audience and 4 speakers on stage discussing the future of Web3."
  },
  booth6: {
    title: "Build on Unichain",
    description: "Welcome to the Build on Unichain Booth! You see a vending machine that accepts SEVENx tokens and dispenses token bags."
  }
};

export default function BoothInteraction({ boothId, onClose, addToInventory, isVerified }: BoothInteractionProps) {
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [question, setQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [activeTab, setActiveTab] = useState('swap');
  const [swapAmount, setSwapAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [newTokenAmount, setNewTokenAmount] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  
  const { isLoading: deFiLoading, error: deFiError, pools, fetchPools, swap7ONEFor, createCustomPool } = useDeFi();

  const booth = boothContent[boothId as keyof typeof boothContent];
  
  const handleAskQuestion = () => {
    setAskingQuestion(true);
  };
  
  const handleSubmitQuestion = () => {
    if (question.trim()) {
      addToInventory({
        id: `question-${Date.now()}`,
        name: 'Participation Certificate',
        icon: '📝',
        description: 'You asked a thoughtful question at the blockchain fireside chat.'
      });
      
      setQuestion('');
      setAskingQuestion(false);
      setStatusMessage('Your question has been submitted successfully!');
      setIsError(false);
    }
  };
  
  const handleScanQR = () => {
    addToInventory({
      id: `bubbletea-${Date.now()}`,
      name: 'Valentine Bubble Tea',
      icon: '🧋',
      description: 'A special Valentine\'s Day bubble tea from the Uniswap team.'
    });
    
    setStatusMessage('You received a special Valentine\'s Bubble Tea!');
    setIsError(false);
  };
  
  const handleGenerateSeed = () => {
    const words = [
      'apple', 'orange', 'banana', 'grape', 'kiwi', 'melon',
      'peach', 'cherry', 'lemon', 'lime', 'plum', 'pear'
    ];
    
    setSeedPhrase(words);
    setShowSeedPhrase(true);
  };
  
  const handleSaveSeed = () => {
    addToInventory({
      id: `seed-${Date.now()}`,
      name: 'Seed Phrase Paper',
      icon: '📝',
      description: 'A paper with your 12-word seed phrase. Keep it safe!'
    });
    
    setShowSeedPhrase(false);
    setStatusMessage('Seed phrase saved to your inventory!');
    setIsError(false);
  };
  
  const handleCreateToken = () => {
    if (!tokenName.trim()) {
      setStatusMessage('Please enter a token name!');
      setIsError(true);
      return;
    }
    
    addToInventory({
      id: `token-${Date.now()}`,
      name: `100 ${tokenName} Tokens`,
      icon: '🪙',
      description: `Your custom token on the Unichain network: ${tokenName}`
    });
    
    setTokenName('');
    setStatusMessage(`Congratulations! You've created 100 ${tokenName} tokens!`);
    setIsError(false);
  };
  
  const handleDeFiSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapAmount) return;

    const targetToken = selectedToken === 'USDC' 
      ? '0x1234567890123456789012345678901234567890' // USDC address
      : '0xETH_ADDRESS'; // ETH address

    try {
      const amountInWei = ethers.parseEther(swapAmount);
      const result = await swap7ONEFor(amountInWei.toString(), targetToken);
      
      if (result) {
        setSwapAmount('');
        setStatusMessage(`Successfully swapped ${swapAmount} 7ONE for ${selectedToken}`);
        setIsError(false);
      } else {
        setStatusMessage('Swap failed. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error swapping tokens:', error);
      setStatusMessage('Failed to swap tokens. Please try again.');
      setIsError(true);
    }
  };

  const handleDeFiCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenAddress || !newTokenAmount || !usdcAmount) return;

    try {
      const success = await createCustomPool(newTokenAddress);

      if (success) {
        setNewTokenAddress('');
        setNewTokenAmount('');
        setUsdcAmount('');
        setStatusMessage('Pool created successfully!');
        setIsError(false);
        fetchPools(); // Refresh pools list
      } else {
        setStatusMessage('Failed to create pool. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error creating pool:', error);
      setStatusMessage('Failed to create pool. Please try again.');
      setIsError(true);
    }
  };
  
  useEffect(() => {
    if (boothId === 'booth4') {
      fetchPools();
    }
  }, [boothId, fetchPools]);
  
  return (
    <InteractionPanel>
      <Header>
        <Title>{booth.title}</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>
      
      <Content>
        <p>{booth.description}</p>
        
        {boothId === 'booth1' || boothId === 'booth5' ? (
          <>
            <ActionButton onClick={handleAskQuestion}>Ask a Question</ActionButton>
            
            {askingQuestion && (
              <>
                <TextArea 
                  placeholder="Type your question here..." 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <ActionButton onClick={handleSubmitQuestion}>Submit Question</ActionButton>
              </>
            )}
          </>
        ) : boothId === 'booth2' ? (
          <ActionButton onClick={handleScanQR}>Scan QR Code</ActionButton>
        ) : boothId === 'booth3' ? (
          <>
            <ActionButton onClick={handleGenerateSeed}>Generate Seed Phrase</ActionButton>
            
            {showSeedPhrase && (
              <>
                <p>Your seed phrase (Keep these words safe and never share them!):</p>
                <SeedPhraseContainer>
                  {seedPhrase.map((word, index) => (
                    <SeedWord key={index}>{index + 1}. {word}</SeedWord>
                  ))}
                </SeedPhraseContainer>
                <ActionButton onClick={handleSaveSeed}>Save to Inventory</ActionButton>
              </>
            )}
          </>
        ) : boothId === 'booth4' ? (
          <>
            <div>
              <h3>DeFi Workshop</h3>
              <p>Welcome to the DeFi Workshop! Here you can swap tokens and manage liquidity pools.</p>
              
              <DeFiTabContainer>
                <DeFiTab 
                  active={activeTab === 'swap'} 
                  onClick={() => setActiveTab('swap')}
                >
                  Swap Tokens
                </DeFiTab>
                <DeFiTab 
                  active={activeTab === 'pools'} 
                  onClick={() => setActiveTab('pools')}
                >
                  View Pools
                </DeFiTab>
                <DeFiTab 
                  active={activeTab === 'create'} 
                  onClick={() => setActiveTab('create')}
                >
                  Create Pool
                </DeFiTab>
              </DeFiTabContainer>

              {activeTab === 'swap' && (
                <SwapForm onSubmit={handleDeFiSwap}>
                  <TokenInput>
                    <TokenAmount>
                      <TokenLabel>From (7ONE)</TokenLabel>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                      />
                      <TokenBalance>Available: 100 7ONE</TokenBalance>
                    </TokenAmount>
                  </TokenInput>

                  <SwapArrow>↓</SwapArrow>

                  <TokenInput>
                    <TokenAmount>
                      <TokenLabel>To</TokenLabel>
                      <Select
                        value={selectedToken}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedToken(e.target.value)}
                      >
                        <option value="USDC">USDC</option>
                        <option value="ETH">ETH</option>
                      </Select>
                    </TokenAmount>
                  </TokenInput>

                  <ActionButton 
                    type="submit" 
                    disabled={deFiLoading || !swapAmount || Number(swapAmount) <= 0}
                  >
                    {deFiLoading ? 'Swapping...' : 'Swap Tokens'}
                  </ActionButton>
                </SwapForm>
              )}

              {activeTab === 'pools' && (
                <PoolsDisplay>
                  <h4>Available Liquidity Pools</h4>
                  {pools?.length > 0 ? (
                    pools.map((pool, index) => (
                      <Pool key={index}>
                        <div>
                          {pool.token0Symbol} - {pool.token1Symbol}
                        </div>
                        <div>Liquidity: {pool.liquidity ? parseFloat(pool.liquidity).toFixed(2) : '0.00'}</div>
                      </Pool>
                    ))
                  ) : (
                    <p>No pools available</p>
                  )}
                </PoolsDisplay>
              )}

              {activeTab === 'create' && (
                <SwapForm onSubmit={handleDeFiCreatePool}>
                  <h4>Create New Pool with USDC</h4>
                  <TokenInput>
                    <TokenAmount>
                      <TokenLabel>Token Address</TokenLabel>
                      <Input
                        type="text"
                        placeholder="Enter token address"
                        value={newTokenAddress}
                        onChange={(e) => setNewTokenAddress(e.target.value)}
                      />
                    </TokenAmount>
                  </TokenInput>

                  <TokenInput>
                    <TokenAmount>
                      <TokenLabel>Token Amount</TokenLabel>
                      <Input
                        type="number"
                        placeholder="Amount of your token"
                        value={newTokenAmount}
                        onChange={(e) => setNewTokenAmount(e.target.value)}
                      />
                    </TokenAmount>
                  </TokenInput>

                  <TokenInput>
                    <TokenAmount>
                      <TokenLabel>USDC Amount</TokenLabel>
                      <Input
                        type="number"
                        placeholder="Amount of USDC"
                        value={usdcAmount}
                        onChange={(e) => setUsdcAmount(e.target.value)}
                      />
                    </TokenAmount>
                  </TokenInput>

                  <ActionButton 
                    type="submit"
                    disabled={deFiLoading || !newTokenAddress || !newTokenAmount || !usdcAmount}
                  >
                    {deFiLoading ? 'Creating...' : 'Create Pool'}
                  </ActionButton>
                </SwapForm>
              )}

              {(statusMessage || deFiError) && (
                isError ? (
                  <ErrorMessage>{statusMessage || deFiError}</ErrorMessage>
                ) : (
                  <SuccessMessage>{statusMessage}</SuccessMessage>
                )
              )}
            </div>
          </>
        ) : boothId === 'booth6' ? (
          <>
            <p>Create your own token:</p>
            <Input
              type="text"
              placeholder="Enter token name"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
            <ActionButton onClick={handleCreateToken}>Create Token</ActionButton>
          </>
        ) : null}

        {statusMessage && (
          <StatusMessage style={{ color: isError ? '#e53e3e' : '#38a169' }}>
            {statusMessage}
          </StatusMessage>
        )}
      </Content>
    </InteractionPanel>
  );
}