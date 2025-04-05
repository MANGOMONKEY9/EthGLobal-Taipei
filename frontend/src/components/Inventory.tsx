import styled from 'styled-components';

const InventoryContainer = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid #555;
  padding: 10px;
  margin-top: 20px;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 180px;
    left: 0;
    right: 0;
    margin: 0;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.85);
    border-top: 2px solid #666;
    border-bottom: none;
    padding: 4px;
  }
`;

const InventoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #666;
  color: #fff;

  @media (max-width: 768px) {
    margin-bottom: 2px;
    padding-bottom: 2px;
  }
`;

const Title = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const TokenBalance = styled.div`
  font-weight: bold;
  color: #ffd700;
  font-size: 16px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const ItemsGrid = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 769px) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  @media (max-width: 768px) {
    padding: 2px;
    gap: 2px;
  }
`;

const Item = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid #666;
  border-radius: 4px;
  min-width: 60px;
  height: 60px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: #888;
  }

  @media (min-width: 769px) {
    min-width: unset;
    height: unset;
    padding: 10px;
  }

  @media (max-width: 768px) {
    min-width: 45px;
    height: 45px;
    padding: 3px;
    border-width: 1px;
  }
`;

const ItemIcon = styled.div`
  font-size: 24px;
  margin-bottom: 2px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 0;
  }
`;

const ItemName = styled.div`
  font-weight: bold;
  text-align: center;
  margin-bottom: 2px;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (min-width: 769px) {
    font-size: 14px;
    margin-bottom: 5px;
  }

  @media (max-width: 768px) {
    font-size: 8px;
    margin-bottom: 0;
  }
`;

const ItemDescription = styled.div`
  font-size: 12px;
  color: #aaa;
  text-align: center;
  display: none;

  @media (min-width: 769px) {
    display: block;
  }
`;

const EmptyInventory = styled.div`
  text-align: center;
  padding: 10px;
  color: #888;
  font-style: italic;
`;

interface InventoryProps {
  items: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
  tokenBalance?: number;
}

const Inventory: React.FC<InventoryProps> = ({ items, tokenBalance = 0 }) => {
  return (
    <InventoryContainer>
      <InventoryHeader>
        <Title>Inventory</Title>
        <TokenBalance>SE7EN Blockchain Carnival</TokenBalance>
      </InventoryHeader>
      
      {items.length > 0 ? (
        <ItemsGrid>
          {items.map(item => (
            <Item key={item.id}>
              <ItemIcon>{item.icon}</ItemIcon>
              <ItemName>{item.name}</ItemName>
              <ItemDescription>{item.description}</ItemDescription>
            </Item>
          ))}
        </ItemsGrid>
      ) : (
        <EmptyInventory>
          Your inventory is empty. Visit booths to collect items!
        </EmptyInventory>
      )}
    </InventoryContainer>
  );
};

export default Inventory;