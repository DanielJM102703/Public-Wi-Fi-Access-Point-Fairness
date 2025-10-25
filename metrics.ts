export function jainFairness(throughputs: number[]): number {
  if (throughputs.length === 0) return 1;
  
  const sum = throughputs.reduce((a, b) => a + b, 0);
  const sumSquares = throughputs.reduce((a, b) => a + b * b, 0);
  
  return (sum * sum) / (throughputs.length * sumSquares);
}

export function calculate95thPercentile(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  
  const sorted = [...latencies].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * 0.95);
  return sorted[Math.min(index, sorted.length - 1)];
}

export function generateNetworkTraffic(numFlows: number, weights: number[]): any[] {
  const trafficTypes: ('chat' | 'video' | 'file')[] = ['chat', 'video', 'file'];
  const priorities = [1, 1, 2, 2, 3]; // Mix of priorities
  
  return Array.from({ length: numFlows }, (_, i) => {
    const type = trafficTypes[i % trafficTypes.length];
    const priority = priorities[i % priorities.length];
    
    let packetSize = 500;
    let numPackets = 5;
    
    switch (type) {
      case 'chat':
        packetSize = 100;
        numPackets = 8;
        break;
      case 'video':
        packetSize = 1500;
        numPackets = 12;
        break;
      case 'file':
        packetSize = 5000;
        numPackets = 3;
        break;
    }
    
    return {
      id: `flow${i + 1}`,
      type,
      arrivalTime: i * 0.5, // Stagger arrivals
      packets: Array.from({ length: numPackets }, (_, j) => ({
        id: `p${i + 1}-${j + 1}`,
        size: packetSize,
        arrivalTime: i * 0.5 + j * 0.2
      })),
      priority,
      weight: weights[i] || 1,
      totalBytes: packetSize * numPackets
    };
  });
}