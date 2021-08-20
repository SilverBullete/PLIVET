import * as React from 'react';
import { MemoryDrawer, SvgMemory } from './MemoryDrawer';
import * as d3 from 'd3';
import { wrapWord } from './Block';

interface Props {
  memoryDrawer: MemoryDrawer;
}

interface State {
  svgMemory: SvgMemory;
}

export default class Memory extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { svgMemory: null };
  }

  componentDidUpdate() {
    wrapWord(d3.selectAll('.memory-value'), 55, 'memory-value');
    wrapWord(d3.selectAll('.memory-name'), 65, 'memory-name');
  }

  renderStack() {
    const { memoryDrawer } = this.props;
    const svgStackTable = memoryDrawer.getSvgStackTable();
    const width = memoryDrawer.getWidth();
    const originX = memoryDrawer.x();
    const originY = memoryDrawer.y();
    const offsetX = memoryDrawer.getOffsetX();
    const offsetY = memoryDrawer.getOffsetY();
    const list: JSX.Element[] = [];
    Object.keys(svgStackTable).forEach((key) => {
      let y = 40;
      let startY = originY + 20;
      const variables: JSX.Element[] = [];
      svgStackTable[key].forEach((cell, i) => {
        if (i === 0) {
          startY = cell.y() - 10;
        }
        y = cell.y() + 15;
        if (cell.getHeight() > 20) {
          y = cell.y() + 35;
        }
        variables.push(
          <g>
            <rect
              x={cell.x()}
              y={cell.y()}
              width={width}
              height={cell.getHeight()}
              fill="white"
              style={{ stroke: 'black', strokeWidth: '1.5px' }}
            />
            <text x={cell.x() + 10} y={cell.y() + 15} fontSize="15">
              {cell.getType()}
            </text>
            <text
              x={cell.x() - 3}
              y={cell.y() + cell.getHeight() / 2}
              fontSize="15"
              textAnchor="end"
              className="memory-name"
            >
              {cell.getName()}
            </text>
            <text
              x={cell.x() + width - 5}
              y={y}
              fontSize="15"
              textAnchor="end"
              className="memory-value"
            >
              {cell.getValue()}
            </text>
          </g>
        );
      });
      list.push(
        <React.Fragment>
          <text x={originX - 7} y={startY} fontSize="13">
            {key.split('.')[0]}
          </text>
          <line
            x1="10"
            y1={startY - 7}
            x2="10"
            y2={y + 5}
            style={{ stroke: 'black', strokeWidth: '2px' }}
          />
          {variables}
        </React.Fragment>
      );
    });
    return (
      <React.Fragment>
        <text x={(originX + offsetX + width) / 2} y={originY} fontSize="20">
          Stack
        </text>
        {list}
      </React.Fragment>
    );
  }

  render() {
    const stack = this.renderStack();
    return (
      <React.Fragment>
        <g>{stack}</g>
      </React.Fragment>
    );
  }
}
