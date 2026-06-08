export interface IDatabasePort {
  start(): Promise<void>;
  stop(): Promise<void>;
  isReady(): boolean;
}
