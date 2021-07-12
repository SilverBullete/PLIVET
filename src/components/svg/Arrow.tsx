import * as React from 'react';
import VariableRect from './VariableRect';
import { Group } from 'react-konva';
import { SvgArrow, SvgCell } from './SvgDrawer';
import hexToRgba from '../Color';
import TextWithRect from './TextWithRect';
import * as d3 from 'd3';

export type SvgRow = SvgCell[];
export type SvgTable = SvgRow[];

interface Props {
  svgArrow: SvgArrow;
}

interface State {}

export default class Arrow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    const svgArrow = this.props.svgArrow;
    const { key } = svgArrow;
    const fromPos = svgArrow.getFromPos();
    const toPos = svgArrow.getToPos();
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
    const p = d3
      .select('#' + key)
      .datum(svgArrow)
      .attr('d', d);
  }

  createArrow() {
    const { key, color } = this.props.svgArrow;
    const rgbaColor = hexToRgba(color);
    const markerEnd = 'url(#m' + key + ')';
    this.drawArrowMarker(key, color);
    return (
      <path
        className="path"
        id={key}
        fill="none"
        stroke={rgbaColor}
        strokeWidth="1.5"
        markerEnd={markerEnd}
      ></path>
    );
  }

  drawArrowMarker(key, color) {
    let defs = d3.select('#svg').select('defs');
    if (defs['_groups'][0].length == 0) {
      defs = d3.select('#svg').append('defs');
    }
    let arrowMarker = defs
      .append('marker')
      .attr('id', 'm' + key)
      .attr('markerUnits', 'strokeWidth')
      .attr('markerWidth', '12')
      .style('stroke-dasharray', '1000, 1000')
      .attr('markerHeight', '12')
      .attr('viewBox', '0 0 12 12')
      .attr('refX', '6')
      .attr('refY', '6')
      .attr('orient', 'auto');

    let arrow_path = 'M2,2 L10,6 L2,10 L6,6 L2,2';

    arrowMarker.append('path').attr('d', arrow_path).attr('fill', color);
  }

  render() {
    const arrow = this.createArrow();
    return arrow;
  }
}
