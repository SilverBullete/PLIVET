import * as React from 'react';
import VariableRect from './VariableRect';
import { Group } from 'react-konva';
import { SvgStack, SvgCell } from './SvgDrawer';
import TextWithRect from './TextWithRect';
import * as d3 from 'd3';

export type SvgRow = SvgCell[];
export type SvgTable = SvgRow[];

interface Props {
  svgStack: SvgStack;
}

interface State {}

function dragged(d: any) {
  d3.select(this).attr('transform', function () {
    let source = this.attributes.transform.value.replace(')', '');
    source = source.split(',');
    let tx = d.dx + Number(source[4]);
    let ty = d.dy + Number(source[5]);
    return 'matrix(1,0,0,1,' + tx + ',' + ty + ')';
  });
}

export default class StackRect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    d3.select('#svg')
      .selectAll('.svg-table')
      .call(d3.drag().on('drag', dragged));
  }

  createTable() {
    const { svgStack } = this.props;
    const x = svgStack.x();
    const y = svgStack.y();
    const title = this.drawTitle();
    const tableContent = this.drawTable();
    let table = (
      <g
        className="svg-table"
        id={svgStack.name()}
        x={x}
        y={y}
        transform="matrix(1,0,0,1,0,0)"
      >
        {title}
        {tableContent}
      </g>
    );
    return table;
  }

  drawTitle() {
    const { svgStack } = this.props;
    const x = svgStack.x();
    const y = svgStack.y();
    const width = svgStack.width();
    const title = (
      <g className="title">
        <TextWithRect
          key={svgStack.name()}
          x={x}
          y={y}
          marginX={(width - svgStack.getTitleWidth()) / 2}
          marginY={25}
          text={svgStack.name()}
          width={width}
          isVisible={true}
        />
      </g>
    );
    return title;
  }

  drawTable() {
    const { svgStack } = this.props;
    const list: JSX.Element[] = [];
    const svgTable = svgStack.getSvgTable();
    console.log(svgTable);
    for (const svgRow of svgTable) {
      if (!svgRow[0].isVisible) {
        continue;
      }
      const key = svgRow.reduce((sum, cell) => sum.concat(cell.key), '');
      list.push(
        <g className="row">
          <VariableRect key={key} svgRow={svgRow} />
        </g>
      );
    }
    return list;
  }

  render() {
    const table = this.createTable();
    return table;
  }
}
