let queueProcessing = false;

export function setOfflineQueueProcessing(value: boolean): void {
  queueProcessing = value;
}

export function isOfflineQueueProcessing(): boolean {
  return queueProcessing;
}
