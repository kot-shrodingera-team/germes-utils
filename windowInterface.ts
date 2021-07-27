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
    updateMaximumIntervalId: number;
    updateCoefIntervalId: number;
    manualMax: number;
    manualCoef: number;
  }

  interface Window {
    consoleCopy: Console;
    germesData: GermesData;
  }
}

export default {};
