import * as React from 'react';
import { slot } from '../emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import SvgContent from './SvgContent';
import '../../css/canvas.css';
import { SvgDrawer, MemoryDrawer } from './SvgDrawer';
import { BlockDrawer } from './BlockDrawer';
import { AnimationDrawer } from './AnimationDrawer';
import Arrow from './Arrow';
import Memory from './Memory';
import BlockContent from './BlockContent';
import AnimationContent from './AnimationContent';
import * as d3 from 'd3';

interface Props {
  width: number;
  height: number;
}
interface State {
  execState?: ExecState;
  lastState?: ExecState;
}

export default class Svg extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { execState: undefined };
    slot('draw', (execState: ExecState, lastState: ExecState) =>
      this.setState({ execState, lastState })
    );
  }
  render() {
    return (
      <div id="display">
        <div className="left">
          <svg
            width={0.65 * this.props.width}
            height={0.98 * this.props.height}
            id="svg"
          >
            <BlockContent
              blockDrawer={new BlockDrawer(this.state.execState)}
            ></BlockContent>
          </svg>
        </div>
        <div className="right">
          <svg
            id="memory"
            width={0.3 * this.props.width}
            height={0.98 * this.props.height}
          >
            <Memory memoryDrawer={new MemoryDrawer(this.state.execState)} />
          </svg>
          <AnimationContent
            animationDrawer={
              new AnimationDrawer(this.state.execState, this.state.lastState)
            }
          />
        </div>
      </div>
    );
  }
}
