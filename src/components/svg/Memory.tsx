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
      d3.select('#memory').select('.content').node().getBBox().height + 50
    );
    const variablesMapJson = sessionStorage.getItem('variablesMap');
    let variablesMap = JSON.parse(variablesMapJson);
    if (!variablesMap) {
      variablesMap = {};
    }
    Object.keys(variablesMap).forEach((key) => {
      if (variablesMap[key]['visible']) {
        const stackName = key.split('_')[0];
        const name = key.split('_')[1];
        const cells = d3
          .select('#memory')
          .selectAll(`.memory-${stackName}-${name}`);
        cells.select('rect').style('stroke', variablesMap[key]['color']);
        cells.selectAll('text').attr('fill', variablesMap[key]['color']);
      }
    });
    const activeStack = sessionStorage.getItem('activeStack');
    const memoryLeft = d3.select('#memory').selectAll('.memory-left');
    memoryLeft.select('text').attr('fill', 'black');
    memoryLeft.select('line').style('stroke', 'black');
    const memoryLeftHighlight = d3
      .select('#memory')
      .select('#memory-left-' + activeStack);
    memoryLeftHighlight.select('text').attr('fill', '#0074D9');
    memoryLeftHighlight.select('line').style('stroke', '#0074D9');
    this.renderArrow();
  }

  clickHandle(cell) {
    const container = d3
      .select('#container')
      .select('.ant-descriptions-view')
      .select('table')
      .select('tbody');
    const info = [];
    info.push(cell.getStackName().split('.')[0]);
    info.push(cell.getName());
    info.push(str_pad(cell.getAddress().toString(16)));
    info.push(cell.getType());
    info.push(cell.getValue());
    info.push('');
    container
      .selectAll('tr')
      .data(info)
      .select('td')
      .select('span')
      .text((d) => {
        return d;
      });
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
          <g
            className={`memory-${
              cell.getStackName().split('.')[0]
            }-${cell.getName()}`}
            id={`memory-${cell.getStackName()}-${cell.getName()}`.replace(
              /[&\|\\\*:^%$@()\[\].]/g,
              '_'
            )}
          >
            <rect
              x={cell.x()}
              y={cell.y()}
              width={width}
              height={cell.getHeight()}
              fill="white"
              style={{ stroke: 'black', strokeWidth: '1.5px' }}
              onClick={() => {
                this.clickHandle(cell);
              }}
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
        <g id={'memory-left-' + key} className="memory-left">
          <text x={originX - 7} y={startY} fontSize="13">
            {key.split('_')[0]}
          </text>
          <line
            x1="5"
            y1={startY - 7}
            x2="5"
            y2={y + 5}
            style={{ stroke: 'black', strokeWidth: '2px' }}
          />
          {variables}
        </g>
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
    let startY = -20;
    let name = '';
    Object.keys(svgHeapTable).forEach((key) => {
      startY = startY + 40;
      switch (key) {
        case 'global':
          name = 'Global/Static';
          break;
        case 'heap':
          name = 'Heap';
          break;
      }
      const variables: JSX.Element[] = [];
      svgHeapTable[key].forEach((cell, i) => {
        if (i === 0) {
          startY = cell.y() - 25;
        }
        variables.push(
          <g
            className={`memory-${
              cell.getStackName().split('.')[0]
            }-${cell.getName()}`}
            id={`memory-${cell.getStackName()}-${cell.getName()}`.replace(
              /[&\|\\\*:^%$@()\[\].]/g,
              '_'
            )}
          >
            <rect
              x={cell.x()}
              y={cell.y()}
              width={width}
              height={cell.getHeight()}
              fill="white"
              style={{ stroke: 'black', strokeWidth: '1.5px' }}
              onClick={() => {
                this.clickHandle(cell);
              }}
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
          <text x={x} y={startY} fontSize="20">
            {name}
          </text>
          {variables}
        </React.Fragment>
      );
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
          <g
            className={`memory-${
              cell.getStackName().split('.')[0]
            }-${cell.getName()}`}
            id={`memory-${cell.getStackName()}-${cell.getName()}`.replace(
              /[&\|\\\*:^%$@()\[\].]/g,
              '_'
            )}
          >
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
              {cell.getName().split(':').length > 1 ? '' : cell.getName()}
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

  renderArrow() {
    d3.select('#memory').select('#arrows').selectAll('path').remove();
    const { memoryDrawer } = this.props;
    const arrowList = memoryDrawer.getArrowList();
    arrowList.forEach((arrow) => {
      console.log(arrow);

      if (arrow['from'] && arrow['to']) {
        let source = d3
          .select('#memory')
          .select(`#memory-${arrow['from']}`)
          .select('rect');
        let target = d3
          .select('#memory')
          .select(`#memory-${arrow['to']}`)
          .select('rect');
        let sourceX = Number(source.attr('x')) + Number(source.attr('width'));
        let sourceY =
          Number(source.attr('y')) + 0.5 * Number(source.attr('height'));
        let targetX = 0;
        let targetY = 0;
        if (Number(source.attr('x')) < Number(target.attr('x'))) {
          targetX = Number(target.attr('x')) - 6;
          targetY =
            Number(target.attr('y')) + 0.5 * Number(target.attr('height'));
          let temp = targetX - sourceX;
          d3.select('#memory')
            .select('#arrows')
            .append('path')
            .attr('style', 'stroke:#858585; fill:none; stroke-width:2;')
            .attr(
              'd',
              'M' +
                sourceX +
                ',' +
                sourceY +
                ' C' +
                (targetX - temp / 3) +
                ',' +
                sourceY +
                ' ' +
                (sourceX + temp / 3) +
                ',' +
                targetY +
                ' ' +
                targetX +
                ',' +
                targetY
            )
            .attr('marker-end', 'url(#arrow)');
        } else {
          targetX = Number(target.attr('x')) + Number(target.attr('width')) + 6;
          targetY =
            Number(target.attr('y')) + 0.5 * Number(target.attr('height'));
          let dx = targetX - sourceX;
          let dy = targetY - sourceY;
          let dr = Math.sqrt(dx * dx + dy * dy);
          let sweepFlag = 0;
          if (dy > 0) {
            sweepFlag = 1;
          }
          d3.select('#memory')
            .select('#arrows')
            .append('path')
            .attr('style', 'stroke:#858585; fill:none; stroke-width:2;')
            .attr(
              'd',
              'M' +
                sourceX +
                ',' +
                sourceY +
                'A' +
                dr +
                ',' +
                dr +
                ' 0 0,' +
                sweepFlag +
                ' ' +
                targetX +
                ',' +
                targetY
            )
            .attr('marker-end', 'url(#arrow)');
        }
      }
    });
  }

  render() {
    const stack = this.renderStack();
    const heap = this.renderHeap();
    const physical = this.renderPhysicalView();
    if (this.props.memoryView === 'logical') {
      return (
        <g className="content">
          <g>{stack}</g>
          <g>{heap}</g>
        </g>
      );
    } else if (this.props.memoryView === 'physical') {
      return (
        <g className="content">
          <g>{physical}</g>
        </g>
      );
    } else {
      return <g className="content"></g>;
    }
  }
}
