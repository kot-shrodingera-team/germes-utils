import { log, stakeInfoString } from '.';
import { JsFailError } from './errors';
import { StateMachine } from './stateMachine';

export const betProcessingError = async (
  machine: StateMachine
): Promise<void> => {
  window.germesData.betProcessingStep = 'error';
  machine.stop();
};

export const betProcessingCompltete = (machine: StateMachine): void => {
  window.germesData.betProcessingStep = 'success';
  machine.stop();
};

export const reopenBet = async (
  openBet: () => Promise<void>,
  machine: StateMachine
): Promise<void> => {
  try {
    window.germesData.betProcessingStep = 'reopen';
    await openBet();
    log('Ставка успешно переоткрыта', 'green');
    window.germesData.betProcessingStep = 'reopened';
  } catch (reopenError) {
    if (reopenError instanceof JsFailError) {
      log(reopenError.message, 'red');
    } else {
      log(reopenError.message, 'red');
    }
    window.germesData.betProcessingStep = 'error';
  }
  machine.stop();
};

export const sendErrorMessage = (message: string): void => {
  worker.Helper.SendInformedMessage(
    `В ${window.germesData.bookmakerName} произошла ошибка принятия ставки:\n` +
      `${message}\n` +
      `${stakeInfoString()}`
  );
};
