import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface MockWalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const MockWalletContext = createContext<MockWalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function MockWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check for stored connection on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('mockWalletAddress');
    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock address (you can make this configurable if needed)
      const mockAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      
      setAddress(mockAddress);
      setIsConnected(true);
      
      // Store in local storage
      localStorage.setItem('mockWalletAddress', mockAddress);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('mockWalletAddress');
  };

  return (
    <MockWalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </MockWalletContext.Provider>
  );
}

export function useMockWallet() {
  return useContext(MockWalletContext);
}
