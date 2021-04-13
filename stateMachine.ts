export interface State {
  entry?: () => Promise<void>;
}

export class StateMachine {
  states: Record<string, State>;

  state: string;

  setData = (states: Record<string, State>, initialState: string): void => {
    this.states = states;
    this.changeState(initialState);
  };

  changeState = (newState: string): void => {
    const statesNames = Object.keys(this.states);
    if (!statesNames.includes(newState)) {
      throw new Error(`No new state ${newState} in states [${statesNames}]`);
    }
    this.state = newState;
    if ('entry' in this.states[this.state]) {
      this.states[this.state].entry();
    }
  };
}
