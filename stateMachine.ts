import { multiAwaiter, MultiAwaiterData } from '.';

export interface State {
  entry: () => Promise<void>;
}

export class StateMachine {
  states: Record<string, State>;

  state: string;

  promises: MultiAwaiterData<unknown>;

  data: { result: unknown; key: string };

  end: boolean;

  setStates = (states: Record<string, State>): void => {
    this.states = states;
  };

  changeState = async (newState: string): Promise<void> => {
    const statesNames = Object.keys(this.states);
    if (!statesNames.includes(newState)) {
      throw new Error(`No new state ${newState} in states [${statesNames}]`);
    }
    this.state = newState;
    if ('entry' in this.states[this.state]) {
      await this.states[this.state].entry();
    }
    if (!this.end) {
      this.data = await multiAwaiter(this.promises);
      if (this.data.key === null) {
        await this.changeState('timeout');
      } else {
        await this.changeState(this.data.key);
      }
    }
  };

  start = async (initialState: string): Promise<void> => {
    await this.changeState(initialState);
  };

  stop = (): void => {
    this.end = true;
  };
}
