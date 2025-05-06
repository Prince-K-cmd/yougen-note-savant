
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import websocketService from '@/services/websocket';

export function InitApp() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check API connection
    const checkBackendConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/');
        if (response.ok) {
          toast({
            title: 'Backend Connected',
            description: 'Successfully connected to the backend API.',
          });
        } else {
          throw new Error('Backend API returned an error response');
        }
      } catch (error) {
        toast({
          title: 'Backend Connection Error',
          description: 'Could not connect to the backend API. Some features may not work properly.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    };

    // Connect WebSocket
    try {
      websocketService.connect();
      
      // Add connection event handler
      const handleConnect = () => {
        setIsConnected(true);
        toast({
          title: 'WebSocket Connected',
          description: 'Real-time updates are now enabled.',
        });
      };
      
      // Add disconnection event handler
      const handleDisconnect = () => {
        setIsConnected(false);
        toast({
          title: 'WebSocket Disconnected',
          description: 'Real-time updates are disabled. Reconnecting...',
          variant: 'default',
        });
      };
      
      // Listen for the "system" message which indicates connection
      websocketService.on('system', handleConnect);
      
      // Clean up
      return () => {
        websocketService.off('system', handleConnect);
        websocketService.disconnect();
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }

    checkBackendConnection();
  }, [toast]);

  return null; // This is a utility component with no UI
}
