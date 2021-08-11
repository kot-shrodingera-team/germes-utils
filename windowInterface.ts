declare global {
  interface GermesData {
    bookmakerName: string;
    minimumStake: number;
    maximumStake: number;
    doStakeTime: Date;
    betProcessingStep: string;
    betProcessingAdditionalInfo: string;
    betProcessingTimeout: number;
    stakeDisabled: boolean;
    stopBetProcessing: () => void;
    // Для ручника
    updateManualDataIntervalId: number;
    stopUpdateManualData: boolean;
    manualMaximumStake: number;
    manualCoefficient: number;
    manualParameter: number;
    manualStakeEnabled: boolean;
  }

  interface Window {
    consoleCopy: Console;
    germesData: GermesData;
  }
}

export default {};
