export interface NetworkFlow {
  id: string;
  type: 'chat' | 'video' | 'file';
  arrivalTime: number;
  packets: Packet[];
  priority: number; // 1 = highest, 3 = lowest
  weight: number;
  totalBytes: number;
}

export interface Packet {
  id: string;
  size: number;
  arrivalTime: number;
  startTime?: number;
  endTime?: number;
}

export interface SimulationMetrics {
  throughput: { [key: string]: number };
  latency: { [key: string]: number[] };
  fairness: number;
  latency95: { [key: string]: number };
  starvationCount: number;
  queueLengths: number[];
}

export interface SimulationPoint {
  time: string;
  [key: string]: number | string;
}