import React, { useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import SelfCustodyWorkshopABI from '../contracts/SelfCustodyWorkshop.json';

declare global {
    interface Window {
        ethereum: any;
    }
}

// Styled components
const WorkshopContainer = styled.div`
  max-width: 2xl;
  margin: 0 auto;
  padding: 1rem;
`;

const StepContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SeedPhraseDisplay = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const SeedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

const SeedWord = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.5rem;
  font-family: monospace;
  text-align: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'secondary' ? '#4B5563' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background: #9CA3AF;
    cursor: not-allowed;
  }
`;

const TipContainer = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #3B82F6;
`;

const TipTitle = styled.h3`
  color: #1F2937;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const TipContent = styled.p`
  color: #4B5563;
  line-height: 1.5;
`;

const StepTitle = styled.h2`
  color: #1F2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  margin: 1rem 0;
  overflow: hidden;
`;

const Progress = styled.div<{ width: number }>`
  height: 100%;
  background: #3B82F6;
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

interface WorkshopStep {
    title: string;
    content: React.ReactNode;
}

interface SelfCustodyWorkshopProps {
    onComplete?: () => void;
    onAddToInventory?: (item: any) => void;
    panelRef?: React.RefObject<HTMLDivElement>;
}

const SelfCustodyWorkshop: React.FC<SelfCustodyWorkshopProps> = ({ onComplete, onAddToInventory, panelRef }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [seedPhrase, setSeedPhrase] = useState<string>('');

    const generateSeedPhrase = async () => {
        try {
            const wallet = ethers.Wallet.createRandom();
            if (wallet.mnemonic?.phrase) {
                setSeedPhrase(wallet.mnemonic.phrase);
            }
        } catch (error) {
            console.error("Error generating seed phrase:", error);
        }
    };

    const workshopSteps: WorkshopStep[] = [
        {
            title: "Generate Your Seed Phrase",
            content: (
                <TipContainer>
                    <TipTitle>What is a Seed Phrase?</TipTitle>
                    <TipContent>
                        A seed phrase is your master key to your crypto wallet. It's a sequence of 12 or 24 words that can restore your entire wallet.
                    </TipContent>
                    {!seedPhrase && (
                        <Button 
                            onClick={generateSeedPhrase}
                            style={{ marginTop: '1rem' }}
                        >
                            Generate Seed Phrase
                        </Button>
                    )}
                </TipContainer>
            )
        },
        {
            title: "Secure Storage Guidelines",
            content: (
                <>
                    <TipContainer>
                        <TipTitle>Write it Down</TipTitle>
                        <TipContent>
                            Always write your seed phrase on paper. Never store it digitally or take screenshots.
                        </TipContent>
                    </TipContainer>
                    
                    <TipContainer>
                        <TipTitle>Safe Storage</TipTitle>
                        <TipContent>
                            Store your written seed phrase in a secure location, like a safe. Consider making a backup copy stored in a different secure location.
                        </TipContent>
                    </TipContainer>
                    
                    <TipContainer>
                        <TipTitle>Never Share</TipTitle>
                        <TipContent>
                            Never share your seed phrase with anyone, not even support staff. Legitimate services will never ask for it.
                        </TipContent>
                    </TipContainer>
                </>
            )
        },
        {
            title: "Best Security Practices",
            content: (
                <>
                    <TipContainer>
                        <TipTitle>Use Hardware Wallets</TipTitle>
                        <TipContent>
                            For large amounts, use hardware wallets. They provide better security than software wallets.
                        </TipContent>
                    </TipContainer>
                    
                    <TipContainer>
                        <TipTitle>Beware of Phishing</TipTitle>
                        <TipContent>
                            Always verify URLs and never enter your seed phrase on websites. Be cautious of unexpected messages or requests.
                        </TipContent>
                    </TipContainer>
                    
                    <TipContainer>
                        <TipTitle>Regular Backups</TipTitle>
                        <TipContent>
                            Regularly verify that your seed phrase backup is readable and stored securely.
                        </TipContent>
                    </TipContainer>
                </>
            )
        }
    ];

    const nextStep = () => {
        // Reset scroll position of the parent modal
        if (panelRef?.current) {
            panelRef.current.scrollTop = 0;
        }

        if (currentStep < workshopSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeWorkshop();
        }
    };

    const completeWorkshop = () => {
        // Just call onComplete immediately
        if (onComplete) {
            onComplete();
        }
    };

    const progress = ((currentStep + 1) / workshopSteps.length) * 100;

    return (
        <WorkshopContainer>
            <ProgressBar>
                <Progress width={progress} />
            </ProgressBar>

            {seedPhrase && (
                <SeedPhraseDisplay>
                    <TipTitle>Your Seed Phrase</TipTitle>
                    <SeedGrid>
                        {seedPhrase.split(' ').map((word, index) => (
                            <SeedWord key={index}>
                                {index + 1}. {word}
                            </SeedWord>
                        ))}
                    </SeedGrid>
                </SeedPhraseDisplay>
            )}

            <StepContainer>
                <StepTitle>{workshopSteps[currentStep].title}</StepTitle>
                {workshopSteps[currentStep].content}
            </StepContainer>

            <Button
                onClick={nextStep}
                disabled={currentStep === 0 && !seedPhrase}
            >
                {currentStep < workshopSteps.length - 1 ? "Next Step" : "Complete Workshop"}
            </Button>
        </WorkshopContainer>
    );
};

export default SelfCustodyWorkshop; 