import * as React from 'react';
import { Layer, Arrow } from 'react-konva';
import StackRect from './StackRect';
import { SvgDrawer, SvgStack, SvgArrow } from './SvgDrawer';
import { slot } from '../emitter';
import hexToRgba from '../Color';
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

  makeStacks(svgStacks: SvgStack[]) {
    const list = svgStacks.map((svgStack) => (
      <StackRect key={svgStack.key} svgStack={svgStack} />
    ));
    return list;
  }

  makeArrows(svgArrows: SvgArrow[]) {
    console.log(svgArrows);

    const list = svgArrows.map((svgArrow) => {
      const { from, mid, to, key, color } = svgArrow;
      const rgbaColor = hexToRgba(color);
      return (
        <Arrow
          key={key}
          points={[from.x, from.y, mid.x, mid.y, to.x, to.y]}
          tension={0.25} // 0だと折れ線
          stroke={rgbaColor}
          // stroke={colors[index % colors.length]} // |(storoke)部分
          // strokeWidth={4}
          fill={rgbaColor} // △(pointer)部分
          pointerLength={10}
          pointerWidth={10}
          opacity={1.0}
        />
      );
    });
    return list;
  }

  updatePos() {
    this.props.svgDrawer.updatePos();
    this.forceUpdate();
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
