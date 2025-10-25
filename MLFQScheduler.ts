import { NetworkFlow, Packet } from '../types';

export class MultiLevelFeedbackQueueScheduler {
  private queues: Packet[][];
  private timeSlices: number[];
  private flowPriorities: Map<string, number>;
  private flowTimeUsed: Map<string, number>;
  private starvationCount: number;

  constructor(numQueues: number = 3) {
    this.queues = Array.from({ length: numQueues }, () => []);
    this.timeSlices = [2, 4, 8]; // Time slices for each queue level
    this.flowPriorities = new Map();
    this.flowTimeUsed = new Map();
    this.starvationCount = 0;
  }

  addPacket(flow: NetworkFlow, packet: Packet) {
    if (!this.flowPriorities.has(flow.id)) {
      // Higher priority number = lower actual priority (inverse of flow.priority)
      const initialQueue = Math.max(0, 3 - flow.priority);
      this.flowPriorities.set(flow.id, initialQueue);
      this.flowTimeUsed.set(flow.id, 0);
    }

    const queueLevel = this.flowPriorities.get(flow.id)!;
    this.queues[queueLevel].push(packet);
  }

  schedule(): { packet: Packet | null, flowId: string | null } {
    // Find highest priority queue with packets
    for (let i = 0; i < this.queues.length; i++) {
      if (this.queues[i].length > 0) {
        const packet = this.queues[i].shift()!;
        
        // Find which flow this packet belongs to
        let flowId: string | null = null;
        for (const [fid, priority] of this.flowPriorities.entries()) {
          // This is simplified - in real implementation you'd track flow-packet mapping
          if (priority === i) {
            flowId = fid;
            break;
          }
        }

        if (flowId) {
          // Update time used and check for demotion
          const timeUsed = (this.flowTimeUsed.get(flowId) || 0) + 1;
          this.flowTimeUsed.set(flowId, timeUsed);

          if (timeUsed >= this.timeSlices[i] && i < this.queues.length - 1) {
            // Demote to lower priority queue
            this.flowPriorities.set(flowId, i + 1);
            this.flowTimeUsed.set(flowId, 0);
          }
        }

        // Check for starvation in lower queues
        this.checkStarvation();

        return { packet, flowId };
      }
    }

    return { packet: null, flowId: null };
  }

  private checkStarvation() {
    let lowPriorityWaiting = 0;
    for (let i = 1; i < this.queues.length; i++) {
      lowPriorityWaiting += this.queues[i].length;
    }

    if (lowPriorityWaiting > 10) { // Threshold for starvation
      this.starvationCount++;
      // Boost one low-priority flow (simplified)
      for (const [flowId, priority] of this.flowPriorities.entries()) {
        if (priority > 0) {
          this.flowPriorities.set(flowId, priority - 1);
          break;
        }
      }
    }
  }

  getStarvationCount(): number {
    return this.starvationCount;
  }

  getQueueLengths(): number[] {
    return this.queues.map(queue => queue.length);
  }

  hasPackets(): boolean {
    return this.queues.some(queue => queue.length > 0);
  }
}