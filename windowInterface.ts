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
    updateMaximumStakeIntervalId: number;
    updateCoefficientIntervalId: number;
    updateParameterIntervalId: number;
    updateEnabledIntervalId: number;
    manualMaximumStake: number;
    manualCoefficient: number;
    manualParameter: number;
    manualEnabled: number;
  }

  interface Window {
    consoleCopy: Console;
    germesData: GermesData;
  }
}

export default {};
