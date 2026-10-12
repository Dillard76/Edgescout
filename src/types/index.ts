export interface AssetProvenance {
  artist: string;
  collectionName: string;
  visualSpec: string;
  launchTimestamp: number;
  isVerified: boolean;
}

export interface OracleModelAttempt {
  model: string;
  status: "success" | "failed" | "skipped";
  error?: string;
}

export interface OracleResult {
  success: boolean;
  liveFloorEth: number;
  maxBidEth: number;
  floorWei: string;
  maxBidWei: string;
  discountBps: number;
  discountPercentage: string;
  modelUsed: string;
  attempts: OracleModelAttempt[];
  aiExplanation: string;
  sanitizationVerified: string;
  payloadHash: string;
}

export interface ScanNodeState {
  netflowUSD: number;
  thresholdUSD: number;
  whaleClusterCount: number;
  isNetflowExceeded: boolean;
  isWhaleClusterTriggered: boolean;
  circuitBreakerTripped: boolean;
  reason: string;
  timestamp: number;
}

export interface BlockchainEvent {
  id: string;
  eventName: "MarketSignalArchived" | "CircuitBreakerTripped" | "AcquisitionExecuted" | "SecuritySanitizationVerified";
  data: Record<string, any>;
  timestamp: string;
  txHash: string;
}

export interface PineconeEntry {
  id: string;
  vectorPreview: number[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface PineconeState {
  dimension: number;
  namespaces: {
    identity: PineconeEntry[];
    strategies: PineconeEntry[];
    market_signals: PineconeEntry[];
  };
}
