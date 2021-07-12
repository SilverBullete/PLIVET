import * as React from 'react';
import StackRect from './StackRect';
import { SvgDrawer, SvgStack, SvgArrow } from './SvgDrawer';
import { slot } from '../emitter';
import Arrow from './Arrow';
import * as d3 from 'd3';
interface Props {
  svgDrawer: SvgDrawer;
}

interface State {
  svgStacks: SvgStack[];
  svgArrows: SvgArrow[];
}

export default class SvgContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { svgStacks: [], svgArrows: [] };
    slot('redraw', () => {
      this.updatePos();
    });
  }
  componentDidMount() {}

  makeStacks(svgStacks: SvgStack[]) {
    const list = svgStacks.map((svgStack) => (
      <StackRect key={svgStack.key} svgStack={svgStack} />
    ));
    return list;
  }

  makeArrows(svgArrows: SvgArrow[]) {
    const list = svgArrows.map((svgArrow) => (
      <Arrow svgArrow={svgArrow} />
      // <Arrow
      //   key={key}
      //   points={[from.x, from.y, mid.x, mid.y, to.x, to.y]}
      //   tension={0.25} // 0だと折れ線
      //   stroke={rgbaColor}
      //   // stroke={colors[index % colors.length]} // |(storoke)部分
      //   // strokeWidth={4}
      //   fill={rgbaColor} // △(pointer)部分
      //   pointerLength={10}
      //   pointerWidth={10}
      //   opacity={1.0}
      // />
    ));
    return list;
  }

  updatePos() {
    this.props.svgDrawer.updatePos();
    const svgStacks = this.props.svgDrawer.getSvgStacks();
    const svgArrows = this.props.svgDrawer.getSvgArrows();
    this.setState({ svgStacks, svgArrows });
    d3.selectAll('.path').attr('d', (data) => {
      const fromPos = data.getFromPos();
      const toPos = data.getToPos();
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const dr = Math.sqrt(dx * dx + dy * dy);
      const d =
        'M' +
        fromPos.x +
        ',' +
        fromPos.y +
        'A' +
        dr +
        ',' +
        dr +
        ' 0 0,1 ' +
        toPos.x +
        ',' +
        toPos.y;
      return d;
    });
    // this.forceUpdate();
  }

  render() {
    const svgStacks = this.props.svgDrawer.getSvgStacks();
    const svgArrows = this.props.svgDrawer.getSvgArrows();
    const stack = this.makeStacks(svgStacks);
    const arrow = this.makeArrows(svgArrows);
    return (
      <React.Fragment>
        <g>{stack}</g>
        <g>{arrow}</g>
      </React.Fragment>
    );
  }
}
