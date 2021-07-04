import * as React from 'react';
import { Stage } from 'react-konva';
import { slot } from '../emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import SvgContent from './SvgContent';
import '../../css/canvas.css';
import { SvgDrawer } from './SvgDrawer';
interface Props {
  width: number;
  height: number;
  scale: number;
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

  render() {
    return (
      <div id="display">
        <Stage
          width={0.95 * this.props.width}
          height={0.95 * this.props.height}
          scale={{ x: this.props.scale, y: this.props.scale }}
        >
          <SvgContent
            svgDrawer={new SvgDrawer(this.state.execState)}
          />
        </Stage>
      </div>
    );
  }
}
