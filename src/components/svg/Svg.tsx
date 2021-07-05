import * as React from 'react';
import { Stage } from 'react-konva';
import { slot } from '../emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import SvgContent from './SvgContent';
import '../../css/canvas.css';
import { SvgDrawer } from './SvgDrawer';
import * as d3 from 'd3';
import { Selection } from 'd3/src/index';

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
    slot('draw', (execState: ExecState) => this.setState({ execState }));
  }

  componentDidMount() {}

  render() {
    return (
      <div id="display">
        <svg
          width={0.95 * this.props.width}
          height={0.95 * this.props.height}
          id="svg"
        >
          <SvgContent svgDrawer={new SvgDrawer(this.state.execState)} />
        </svg>
      </div>
    );
  }
}
