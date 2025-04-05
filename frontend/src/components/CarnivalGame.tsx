import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import BoothInteraction from '@components/BoothInteraction';
import Inventory from '@components/Inventory';

const GameContainer = styled.div<{ isGameStarted: boolean }>`
width: 100%;
display: flex;
flex-direction: column;
gap: 20px;
height: ${props => props.isGameStarted ? '100vh' : 'auto'};
padding-top: ${props => props.isGameStarted ? '0' : '20px'};
overflow: ${props => props.isGameStarted ? 'hidden' : 'visible'};
position: ${props => props.isGameStarted ? 'fixed' : 'relative'};
top: ${props => props.isGameStarted ? '0' : 'auto'};
left: ${props => props.isGameStarted ? '0' : 'auto'};
right: ${props => props.isGameStarted ? '0' : 'auto'};
bottom: ${props => props.isGameStarted ? '0' : 'auto'};
`;

const MobileControls = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 20px;
    background: #DFDFDF;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
    z-index: 998;
    border-top: none;
  }
`;

const DPadContainer = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  margin: 5px;
`;

const DPad = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  background: #444444;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);

  &:before {
    content: '';
    position: absolute;
    width: 35px;
    height: 100px;
    background: #444444;
    border-radius: 5px;
  }

  &:after {
    content: '';
    position: absolute;
    width: 100px;
    height: 35px;
    background: #444444;
    border-radius: 5px;
  }
`;

const DPadButton = styled.button<{ direction: string }>`
  position: absolute;
  width: 35px;
  height: 35px;
  background: #2a2a2a;
  border: none;
  cursor: pointer;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  &:active {
    background: #1a1a1a;
    transform: scale(0.95) ${props => {
      switch(props.direction) {
        case 'up':
          return 'translateX(-50%)';
        case 'down':
          return 'translateX(-50%)';
        case 'left':
          return 'translateY(-50%)';
        case 'right':
          return 'translateY(-50%)';
      }
    }};
  }

  ${props => {
    switch(props.direction) {
      case 'up':
        return 'top: 0; left: 50%; transform: translateX(-50%);';
      case 'down':
        return 'bottom: 0; left: 50%; transform: translateX(-50%);';
      case 'left':
        return 'left: 0; top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'right: 0; top: 50%; transform: translateY(-50%);';
      default:
        return '';
    }
  }}

  &:before {
    content: '${props => {
      switch(props.direction) {
        case 'up':
          return '▲';
        case 'down':
          return '▼';
        case 'left':
          return '◄';
        case 'right':
          return '►';
        default:
          return '';
      }
    }}';
  }
`;

const ActionButtons = styled.div`
  display: flex;
  margin-left: auto;
  padding: 10px;
`;

const ActionButton = styled.button`
  width: 50px;
  height: 50px;
  background: #D10000;
  border: 3px solid #8B0000;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: rotate(-25deg);

  &:active {
    transform: rotate(-25deg) scale(0.95);
    background: #B00000;
  }
`;

const ControlsLayout = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const GameBoard = styled.div<{ isGameStarted: boolean; isBlurred?: boolean }>`
  width: 100%;
  height: ${(props) => props.isGameStarted ? '70vh' : '50vh'};
  background-color: #88cc88;
  position: relative;
  border: 4px solid #333;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  filter: ${(props) => props.isBlurred ? 'blur(5px)' : 'none'};
  transition: filter 0.3s ease;

  @media (max-width: 768px) {
    height: calc(100vh - 160px);
    margin-bottom: 0;
  }
`;

const Player = styled.div`
width: 32px;
height: 32px;
background-color: #3366ff;
border: 2px solid #000;
border-radius: 50%;
position: absolute;
z-index: 100;
transition: all 0.05s ease-out;
`;

const Booth = styled.div<{ isActive: boolean }>`
width: 80px;
height: 80px;
background-color: ${props => props.isActive ? '#ffcc00' : '#ffcc66'};
border: 2px solid #663300;
position: absolute;
text-align: center;
font-weight: bold;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
cursor: pointer;
border-radius: 5px;
transition: all 0.2s;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
transform: translate(-50%, -50%);

@media (max-width: 768px) {
  width: 60px;
  height: 60px;
  font-size: 12px;
}

&:hover {
  transform: ${props => props.isActive ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1.05)'};
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
`;

const Controls = styled.div`
text-align: center;
margin: 10px auto;
color: #555;
font-style: italic;

@media (max-width: 768px) {
  display: none;
}
`;

const GameMessage = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #4CAF50;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  z-index: 100;
  animation: fadeInOut 3s ease-in-out forwards;

  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -20px); }
    15% { opacity: 1; transform: translate(-50%, 0); }
    85% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -20px); }
  }
`;

interface GameProps {
  isVerified: boolean;
  onVerificationExpired: () => void;
}

interface BoothData {
  id: string;
  name: string;
  position: { top: string; left: string };
  description: string;
}

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const booths: BoothData[] = [
{ 
  id: 'booth1', 
  name: 'Decentralisation', 
  position: { top: '15%', left: '20%' },
  description: 'Learn about decentralization and trustlessness in blockchain networks.'
},
{ 
  id: 'booth2', 
  name: 'Valentines Special', 
  position: { top: '15%', left: '80%' },
  description: 'Uniswap is giving out special bubble tea tokens today!'
},
{ 
  id: 'booth3', 
  name: 'Self Custody', 
  position: { top: '50%', left: '20%' },
  description: 'Learn how to secure your digital assets with self-custody.'
},
{ 
  id: 'booth4', 
  name: 'DeFi Workshop', 
  position: { top: '50%', left: '80%' },
  description: 'Explore decentralized finance concepts like liquidity pools and token swaps.'
},
{ 
  id: 'booth5', 
  name: 'Web3 Future', 
  position: { top: '85%', left: '20%' },
  description: 'Discuss the future of Web3 technologies and their impact.'
},
{ 
  id: 'booth6', 
  name: 'Unichain Build', 
  position: { top: '85%', left: '80%' },
  description: 'Create your own token on the Unichain network.'
},
];

const CarnivalGame: React.FC<GameProps> = ({ isVerified, onVerificationExpired }) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const [nearestBooth, setNearestBooth] = useState<string | null>(null);
  const [interactingBooth, setInteractingBooth] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameMessage, setShowGameMessage] = useState(false);

  // Log when component mounts/unmounts and when isVerified changes
  useEffect(() => {
    console.log('[CarnivalGame] Component mounted');
    console.log('[CarnivalGame] Initial isVerified:', isVerified);
    return () => {
      console.log('[CarnivalGame] Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('[CarnivalGame] isVerified changed to:', isVerified);
    if (isVerified) {
      console.log('[CarnivalGame] Starting game...');
      setGameStarted(true);
    } else {
      console.log('[CarnivalGame] Stopping game...');
      setGameStarted(false);
      onVerificationExpired();
    }
  }, [isVerified, onVerificationExpired]);

  const gameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const boothRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for arrow keys to stop page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }
      
      setActiveKeys(prev => ({ ...prev, [event.key]: true }));
      
      // Space key for interaction with nearest booth
      if (event.key === ' ' && nearestBooth && !interactingBooth) {
        setInteractingBooth(nearestBooth);
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      setActiveKeys(prev => ({ ...prev, [event.key]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearestBooth, interactingBooth]);

  // Player movement
  useEffect(() => {
    if (interactingBooth) return; // No movement while interacting
    
    const moveSpeed = 5;
    const moveInterval = setInterval(() => {
      let newX = playerPosition.x;
      let newY = playerPosition.y;
      
      if (activeKeys['ArrowUp'] && newY > 0) {
        newY -= moveSpeed;
      }
      if (activeKeys['ArrowDown'] && newY < (gameRef.current?.offsetHeight || 0) - 32) {
        newY += moveSpeed;
      }
      if (activeKeys['ArrowLeft'] && newX > 0) {
        newX -= moveSpeed;
      }
      if (activeKeys['ArrowRight'] && newX < (gameRef.current?.offsetWidth || 0) - 32) {
        newX += moveSpeed;
      }
      
      setPlayerPosition({ x: newX, y: newY });
    }, 16);
    
    return () => clearInterval(moveInterval);
  }, [playerPosition, activeKeys, interactingBooth]);

  // Check nearest booth based on player position
  useEffect(() => {
    if (!playerRef.current) return;
    
    const playerRect = playerRef.current.getBoundingClientRect();
    let nearestId: string | null = null;
    let minDistance = Infinity;
    
    booths.forEach(booth => {
      const boothElement = boothRefs.current[booth.id];
      if (!boothElement) return;
      
      const boothRect = boothElement.getBoundingClientRect();
      
      const distance = Math.sqrt(
        Math.pow((playerRect.x + playerRect.width/2) - (boothRect.x + boothRect.width/2), 2) +
          Math.pow((playerRect.y + playerRect.height/2) - (boothRect.y + boothRect.height/2), 2)
      );
      
      if (distance < 100 && distance < minDistance) {
        minDistance = distance;
        nearestId = booth.id;
      }
    });
    
    setNearestBooth(nearestId);
  }, [playerPosition]);

  // Center player when game starts
  useEffect(() => {
    if (gameStarted && gameRef.current) {
      const boardWidth = gameRef.current.offsetWidth;
      const boardHeight = gameRef.current.offsetHeight;
      const playerWidth = 32; // Player width from styled component
      const playerHeight = 32; // Player height from styled component
      
      setPlayerPosition({
        x: (boardWidth - playerWidth) / 2,
        y: (boardHeight - playerHeight) / 2
      });
    }
  }, [gameStarted]);

  // Add an item to inventory
  const addToInventory = (item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  };

  const closeInteraction = () => {
    setInteractingBooth(null);
  };

  const handleShowCongrats = () => {
    setShowGameMessage(true);
    setTimeout(() => {
      setShowGameMessage(false);
    }, 3000);
  };

  return (
    <GameContainer isGameStarted={gameStarted}>
      {!gameStarted ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>Please verify with World ID to play.</p>
        </div>
      ) : (
        <>
          <Controls>
            Use arrow keys (↑ ↓ ← →) to move around and SPACE to interact with booths
          </Controls>
          
          <GameBoard 
            ref={gameRef} 
            isGameStarted={gameStarted}
          >
            {showGameMessage && (
              <GameMessage>
                🎉 Congratulations! You've completed the Self Custody Workshop! 🎉
              </GameMessage>
            )}

            <Player 
              ref={playerRef}
              style={{ top: `${playerPosition.y}px`, left: `${playerPosition.x}px` }} 
            />
            
            {booths.map(booth => (
              <Booth
                key={booth.id}
                id={booth.id}
                isActive={booth.id === nearestBooth}
                style={{ 
                  top: booth.position.top, 
                  left: booth.position.left 
                }}
                ref={el => {
                  boothRefs.current[booth.id] = el;
                }}
                onClick={() => {
                  if (booth.id === nearestBooth) {
                    setInteractingBooth(booth.id);
                  } else {
                    setErrorMessage('Move closer to interact with this booth!');
                    setTimeout(() => setErrorMessage(null), 2000);
                  }
                }}
              >
                {booth.name}
              </Booth>
            ))}
          </GameBoard>
          
          {errorMessage && (
            <div style={{ 
              textAlign: 'center', 
              color: '#ff6b6b', 
              padding: '10px',
              marginTop: '10px'
            }}>
              {errorMessage}
            </div>
          )}
          
          {interactingBooth ? (
            <BoothInteraction
              boothId={interactingBooth}
              onClose={closeInteraction}
              addToInventory={addToInventory}
              isVerified={isVerified}
              onShowCongrats={handleShowCongrats}
            />
          ) : (
            <>
              <Inventory items={inventory} tokenBalance={0} />
              <MobileControls>
                <ControlsLayout>
                  <DPadContainer>
                    <DPad />
                    <DPadButton 
                      direction="up"
                      onTouchStart={() => setActiveKeys(prev => ({...prev, ArrowUp: true}))}
                      onTouchEnd={() => setActiveKeys(prev => ({...prev, ArrowUp: false}))}
                    />
                    <DPadButton 
                      direction="down"
                      onTouchStart={() => setActiveKeys(prev => ({...prev, ArrowDown: true}))}
                      onTouchEnd={() => setActiveKeys(prev => ({...prev, ArrowDown: false}))}
                    />
                    <DPadButton 
                      direction="left"
                      onTouchStart={() => setActiveKeys(prev => ({...prev, ArrowLeft: true}))}
                      onTouchEnd={() => setActiveKeys(prev => ({...prev, ArrowLeft: false}))}
                    />
                    <DPadButton 
                      direction="right"
                      onTouchStart={() => setActiveKeys(prev => ({...prev, ArrowRight: true}))}
                      onTouchEnd={() => setActiveKeys(prev => ({...prev, ArrowRight: false}))}
                    />
                  </DPadContainer>
                  <ActionButtons>
                    <ActionButton 
                      onTouchStart={() => {
                        if (nearestBooth && !interactingBooth) {
                          setInteractingBooth(nearestBooth);
                        }
                      }}
                    >
                      A
                    </ActionButton>
                  </ActionButtons>
                </ControlsLayout>
              </MobileControls>
            </>
          )}
        </>
      )}
    </GameContainer>
  );
};

export default CarnivalGame;