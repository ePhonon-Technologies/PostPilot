// utils/queueState.ts

class QueueState {
  private hasPendingJobs: boolean = false;

  setHasJobs(value: boolean): void {
    this.hasPendingJobs = value;
  }

  get canCheckDb(): boolean {
    return this.hasPendingJobs;
  }
}

// Export a singleton instance
export const queueState = new QueueState();