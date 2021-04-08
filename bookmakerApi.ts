declare global {
  interface Window {
    germesData: {
      bookmakerName: string;
      doStakeTime: Date;
      betProcessingStep: string;
      betProcessingAdditionalInfo: string;
    };
  }
}

export default {};
