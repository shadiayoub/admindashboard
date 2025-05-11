// hooks/useBlockchainStats.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

interface BlockData {
  number: number;
  timestamp: Date;
}

export const useBlockchainStats = () => {
  const [latestBlock, setLatestBlock] = useState<BlockData | null>(null);
  const [nodeCount, setNodeCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest block
        const blockRes = await axios.get('/api/blocks/latest');
        setLatestBlock({
          number: blockRes.data.number,
          timestamp: new Date(blockRes.data.timestamp * 1000)
        });

        // Fetch node count
        const nodesRes = await axios.get('/api/nodes/count');
        setNodeCount(nodesRes.data.count);

      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s

    return () => clearInterval(interval);
  }, []);

  return { latestBlock, nodeCount, loading, error };
};
