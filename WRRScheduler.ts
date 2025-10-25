import { NetworkFlow, Packet } from '../types';

export class WeightedRoundRobinScheduler {
  private queues: Map<string, Packet[]>;
  private weights: Map<string, number>;
  private counters: Map<string, number>;
  private currentIndex: number;
  private flowOrder: string[];

  constructor(flows: NetworkFlow[]) {
    this.queues = new Map();
    this.weights = new Map();
    this.counters = new Map();
    this.currentIndex = 0;
    this.flowOrder = [];

    flows.forEach(flow => {
      this.queues.set(flow.id, []);
      this.weights.set(flow.id, flow.weight);
      this.counters.set(flow.id, 0);
      this.flowOrder.push(flow.id);
    });
  }

  addPacket(flowId: string, packet: Packet) {
    const queue = this.queues.get(flowId);
    if (queue) {
      queue.push(packet);
    }
  }

  schedule(): { packet: Packet | null, flowId: string | null } {
    if (this.queues.size === 0) return { packet: null, flowId: null };

    // Find next flow with packets and remaining weight
    let attempts = 0;
    while (attempts < this.flowOrder.length * 2) {
      const flowId = this.flowOrder[this.currentIndex];
      const queue = this.queues.get(flowId);
      const weight = this.weights.get(flowId) || 1;
      const counter = this.counters.get(flowId) || 0;

      if (queue && queue.length > 0 && counter < weight) {
        // Serve packet from this flow
        const packet = queue.shift()!;
        this.counters.set(flowId, counter + 1);
        return { packet, flowId };
      } else if (counter >= weight) {
        // Reset counter and move to next flow
        this.counters.set(flowId, 0);
      }

      // Move to next flow
      this.currentIndex = (this.currentIndex + 1) % this.flowOrder.length;
      attempts++;
    }

    return { packet: null, flowId: null };
  }

  getQueueLengths(): number[] {
    return Array.from(this.queues.values()).map(queue => queue.length);
  }

  hasPackets(): boolean {
    return Array.from(this.queues.values()).some(queue => queue.length > 0);
  }
}