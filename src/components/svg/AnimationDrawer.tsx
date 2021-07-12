import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import * as d3 from 'd3';

export class AnimationDrawer {
  private execState: ExecState | null = null;
  private state: string;
  private variableKey: string;
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') return;
    this.execState = execState;
    this.parseExe();
  }

  private parseExe() {
    const currentExpr = this.execState.getCurrentExpr();
    console.log(currentExpr);

    const className = currentExpr.constructor.name;
    switch (className) {
      case 'UniProgram':
        this.state = 'programInit';
        break;
      case 'UniVariableDec':
        this.state = 'variableInit';
        this.variableKey = 'main-n';
        break;
    }
  }

  public getState() {
    return this.state;
  }

  public getVariableKey() {
    return this.variableKey;
  }
}
