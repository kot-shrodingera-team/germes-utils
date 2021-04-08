interface GermesData {
  bookmakerName: string;
  doStakeTime: Date;
  betProcessingStep: string;
  betProcessingAdditionalInfo: string;
  betProcessingTimeout: number;
}

declare global {
  interface Window {
    consoleCopy: Console;
    germesData: GermesData;
  }
}

export default {};
