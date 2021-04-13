import { multiAwaiter, MultiAwaiterData } from '.';

export interface State {
  entry?: () => Promise<void>;
  final?: boolean;
}

export class StateMachine {
  states: Record<string, State>;

  state: string;

  promises: MultiAwaiterData<any>;

  data: { result: any; key: string };

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
      this.states[this.state].entry();
    }
    if (!this.states[this.state].final) {
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
}
