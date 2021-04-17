declare global {
  interface GermesData {
    bookmakerName: string;
    doStakeTime: Date;
    betProcessingStep: string;
    betProcessingAdditionalInfo: string;
    betProcessingTimeout: number;
    stakeDisabled: boolean;
    stopBetProcessing: () => void;
  }

  interface Window {
    consoleCopy: Console;
    germesData: GermesData;
  }
}

export default {};
