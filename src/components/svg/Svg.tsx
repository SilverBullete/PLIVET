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
}

export default class Svg extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { execState: undefined };
    console.log(this.state.execState);

    slot('draw', (execState: ExecState) => this.setState({ execState }));
  }

  render() {
    // const marker = Arrow.drawArrowMarker();

    //  <defs>
    //           <marker
    //             id="arrow"
    //             markerUnits="strokeWidth"
    //             markerWidth="12"
    //             markerHeight="12"
    //             viewBox="0 0 12 12"
    //             refX="6"
    //             refY="6"
    //             orient="auto"
    //           >
    //             <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#000"></path>
    //           </marker>
    //         </defs>
    //         <SvgContent svgDrawer={new SvgDrawer(this.state.execState)} />
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
            animationDrawer={new AnimationDrawer(this.state.execState)}
          />
        </div>
      </div>
    );
  }
}
