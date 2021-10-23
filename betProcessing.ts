import { log, stakeInfoString } from '.';
import { JsFailError } from './errors';
import { StateMachine } from './stateMachine';

export const betProcessingError = async (
  machine: StateMachine
): Promise<void> => {
  window.germesData.betProcessingStep = 'error';
  // eslint-disable-next-line no-param-reassign
  machine.end = true;
};

export const betProcessingCompltete = (machine: StateMachine): void => {
  window.germesData.betProcessingStep = 'success';
  // eslint-disable-next-line no-param-reassign
  machine.end = true;
};

export const reopenBet = async (
  openBet: () => Promise<void>
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
};

export const sendErrorMessage = (message: string): void => {
  worker.Helper.SendInformedMessage(
    `В ${window.germesData.bookmakerName} произошла ошибка принятия ставки:\n` +
      `${message}\n` +
      `${stakeInfoString()}`
  );
};
