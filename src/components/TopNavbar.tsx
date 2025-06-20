import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Wallet, Droplets, Clock, LogOut } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useFaucet } from '@/hooks/use-faucet';
import { toast } from 'sonner';

export const TopNavbar = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { 
    claimFaucet, 
    isLoading, 
    canClaim, 
    formatTimeRemaining, 
    faucetAmount 
  } = useFaucet();

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected successfully');
  };

  const handleFaucetClaim = async () => {
    const result = await claimFaucet();
    
    if (result.success) {
      toast.success(result.message, {
        description: result.txHash ? `Transaction: ${result.txHash.slice(0, 10)}...` : undefined,
      });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <nav className="h-16 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-6 relative z-50">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-white">MangroveMatrix</span>
        <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-400/30 text-xs">
          CLIMATE CHANGE
        </Badge>
      </div>

      {/* Right Side - Network + Wallet Controls */}
      <div className="flex items-center space-x-3">
        {/* Network Indicator */}
        <Badge variant="outline" className="bg-gray-800 text-green-400 border-green-400/30 text-xs">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          OP Sepolia
        </Badge>

        {/* Faucet Button - Only show when connected */}
        {isConnected && (
          <Button
            onClick={handleFaucetClaim}
            disabled={!canClaim || isLoading}
            variant="outline"
            size="sm"
            className={`${
              canClaim 
                ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700' 
                : 'bg-gray-700 text-gray-400 border-gray-600'
            }`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Droplets className="w-4 h-4 mr-2" />
            )}
            {canClaim ? (
              'Faucet'
            ) : (
              <>
                <Clock className="w-4 h-4 mr-1" />
                {formatTimeRemaining()}
              </>
            )}
          </Button>
        )}

        {isConnected ? (
          <div className="flex items-center space-x-2">
            {/* Wallet Address Display */}
            <div className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 text-sm flex items-center">
              <Wallet className="w-4 h-4 mr-2 text-green-400" />
              {address && formatAddress(address)}
            </div>
            {/* Disconnect Button */}
            <Button 
              variant="outline" 
              size="sm"
              className="bg-red-600 text-white border-red-700 hover:bg-red-700"
              onClick={handleDisconnect}
              title="Disconnect Wallet"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
            onClick={handleConnect}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </div>
    </nav>
  );
};
