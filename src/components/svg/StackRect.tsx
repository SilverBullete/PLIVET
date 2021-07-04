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

function dragged(d){
  d3.select(this)
    .attr("transform", function(){
      let source = this.attributes.transform.value.replace(")", "");
      source = source.split(",");
      let tx = d.dx + Number(source[4]);
      let ty = d.dy + Number(source[5]);
      return "matrix(1,0,0,1,"+tx+","+ty+")" 
    })
}

export default class StackRect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  renderHeader() {
    const { svgStack } = this.props;
    const x = svgStack.x();
    const y = svgStack.y();
    return (
      <TextWithRect
        x={x}
        y={y}
        text={svgStack.name()}
        width={svgStack.width()}
        fontStyle="bold"
        align="center"
        isVisible={true}
      />
    );
  }
  renderBody() {
    const svgStack = this.props.svgStack;
    const list: JSX.Element[] = [];
    const svgTable = svgStack.getSvgTable();
    for (const svgRow of svgTable) {
      if (!svgRow[0].isVisible) {
        continue;
      }
      const key = svgRow.reduce((sum, cell) => sum.concat(cell.key), '');
      list.push(<VariableRect key={key} svgRow={svgRow} />);
    }
    return list;
  }

  createTable() {
    const { svgStack } = this.props;
    const x = svgStack.x();
    const y = svgStack.y();
    let table = d3.select("svg")
      .append("g")
      .attr("class", "svg-table")
      .attr("id", svgStack.name())
      .attr("x", x)
      .attr("y", y)
      .attr("transform", "matrix(1,0,0,1,0,0)")
      .call(d3.drag()
        .on("drag", dragged));
    return table;
  }

  drawTitle() {
    const { svgStack } = this.props;
    const x = svgStack.x();
    const y = svgStack.y();
    const width = svgStack.width();
    const titleBorder = d3.select("#" + svgStack.name())
      .append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", 33)
      .attr("fill", "white")
      .style('stroke', 'black')
      .style("stroke-width", "1.5px");
    const titleText = d3.select("#" + svgStack.name())
      .append("text")
      .attr("x", x + (width - svgStack.getTitleWidth()) / 2)
      .attr("y", y + 25)
      .attr("font-size", 20)
      .style({'font-weight': 'bold'})
      .text(svgStack.name());
  }

  drawTable() {
    
  }

  render() {
    const svgStack = this.props.svgStack;
    const title = svgStack.name();
    const table = this.createTable();
    

    const header = this.renderHeader();
    const body = this.renderBody();
    return (
      <Group>
        {header}
        {body}
      </Group>
    );
  }
}
