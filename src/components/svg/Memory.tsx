import * as React from 'react';
import { MemoryDrawer, SvgMemory, str_pad } from './MemoryDrawer';
import * as d3 from 'd3';
import { wrapWord } from './Block';

interface Props {
  memoryDrawer: MemoryDrawer;
  memoryView: string;
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
    wrapWord(d3.selectAll('.memory-value'), 120, 'memory-value');
    wrapWord(d3.selectAll('.memory-name'), 65, 'memory-name');
    d3.select('#memory').attr(
      'height',
      d3.select('#memory').select('g').node().getBBox().height + 50
    );
  }

  clickHandle(cell) {
    const container = d3.select('#container');
    container.select('div').remove();
    const div = container.append('div');
    div
      .append('div')
      .append('span')
      .text(`Function Name: ${cell.getStackName().split('.')[0]}`);
    div
      .append('div')
      .append('span')
      .text(
        `Depth: ${
          cell.getStackName().split('.').length > 1
            ? cell.getStackName().split('.')[1]
            : 1
        }`
      );
    div.append('div').append('span').text(`Variable Name: ${cell.getName()}`);
    div
      .append('div')
      .append('span')
      .text(`Address: ${str_pad(cell.getAddress().toString(16))}`);
    div.append('div').append('span').text(`Type: ${cell.getType()}`);
    div.append('div').append('span').text(`Value: ${cell.getValue()}`);
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
              y={cell.getHeight() > 20 ? cell.y() + 35 : cell.y() + 15}
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
            x1="5"
            y1={startY - 7}
            x2="5"
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

  renderHeap() {
    const { memoryDrawer } = this.props;
    const svgHeapTable = memoryDrawer.getSvgHeapTable();
    const width = memoryDrawer.getWidth();
    const originX = memoryDrawer.x();
    const originY = memoryDrawer.y();
    const offsetX = memoryDrawer.getOffsetX();
    const offsetY = memoryDrawer.getOffsetY();
    const list: JSX.Element[] = [];
    let x = (originX + offsetX) * 1.5 + width * 1.2;
    let startY = 0;
    let name = '';
    Object.keys(svgHeapTable).forEach((key) => {
      if (svgHeapTable[key].length > 0) {
        switch (key) {
          case 'global':
            name = 'Global/Static';
            break;
          case 'heap':
            name = 'Heap';
            break;
          case 'const':
            name = 'Const';
            break;
        }
        const variables: JSX.Element[] = [];
        svgHeapTable[key].forEach((cell, i) => {
          if (i === 0) {
            startY = cell.y();
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
                {name === 'Heap' ? '' : cell.getName()}
              </text>
              <text
                x={cell.x() + width - 5}
                y={cell.getHeight() > 20 ? cell.y() + 35 : cell.y() + 15}
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
            <text x={x} y={startY - 25} fontSize="20">
              {name}
            </text>
            {variables}
          </React.Fragment>
        );
      }
    });
    return list;
  }

  renderPhysicalView() {
    const { memoryDrawer } = this.props;
    const physicalTable = memoryDrawer.getPhysicalTable();
    const originX = 70;
    const originY = 20;
    const width = 120;
    const offsetY = 40;
    const list: JSX.Element[] = [];
    physicalTable['data'].forEach((cell, i) => {
      if (cell === '...') {
        list.push(
          <g>
            <rect
              x={originX}
              y={originY + offsetY * i}
              width={width}
              height={offsetY}
              fill="white"
              style={{ stroke: 'black', strokeWidth: '1.5px' }}
            />
            <text
              x={originX + width / 2}
              y={originY + offsetY * i + offsetY / 2}
              fontSize="20"
              textAnchor="middle"
            >
              ...
            </text>
          </g>
        );
      } else {
        list.push(
          <g>
            <rect
              x={originX}
              y={originY + offsetY * i}
              width={width}
              height={offsetY}
              fill="white"
              style={{ stroke: 'black', strokeWidth: '1.5px' }}
              onClick={() => {
                this.clickHandle(cell);
              }}
            />
            <text x={originX + 10} y={originY + offsetY * i + 15} fontSize="15">
              {cell.getType()}
            </text>
            <text
              x={originX - 3}
              y={originY + offsetY * i + offsetY / 2}
              fontSize="15"
              textAnchor="end"
              className="memory-name"
            >
              {cell.getName()}
            </text>
            <text
              x={originX + width - 5}
              y={originY + offsetY * i + 35}
              fontSize="15"
              textAnchor="end"
              className="memory-value"
            >
              {cell.getValue()}
            </text>
          </g>
        );
      }
    });
    return list;
  }

  render() {
    const stack = this.renderStack();
    const heap = this.renderHeap();
    const physical = this.renderPhysicalView();
    if (this.props.memoryView === 'logical') {
      return (
        <g>
          <g>{stack}</g>
          <g>{heap}</g>
        </g>
      );
    } else if (this.props.memoryView === 'physical') {
      return (
        <g>
          <g>{physical}</g>
        </g>
      );
    } else {
      return <g></g>;
    }
  }
}
