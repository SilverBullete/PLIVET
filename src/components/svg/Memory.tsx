import * as React from 'react';
import { MemoryDrawer, SvgMemory } from './SvgDrawer';
import * as d3 from 'd3';

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

  renderBackgroud() {
    const { memoryDrawer } = this.props;
    const minAddress = memoryDrawer.getMinAddress();
    const maxAddress = memoryDrawer.getMaxAddress();
    const width = memoryDrawer.getWidth();
    const list: JSX.Element[] = [];
    for (let i = minAddress; i <= maxAddress; i++) {
      list.push(
        <React.Fragment>
          <rect
            id={String(i)}
            x="100"
            y={50 + 20 * (i - minAddress)}
            width={width}
            height="20"
            fill="white"
            style={{ stroke: 'black', strokeWidth: '1.5px' }}
          ></rect>
          <text x="40" y={65 + 20 * (i - minAddress)} fontSize="15">
            {i}
          </text>
        </React.Fragment>
      );
    }
    return list;
  }

  renderVariable() {
    const { memoryDrawer } = this.props;
    const svgMemoryTable = memoryDrawer.getSvgMemoryTable();
    const minAddress = memoryDrawer.getMinAddress();
    const maxAddress = memoryDrawer.getMaxAddress();
    const width = memoryDrawer.getWidth();
    const list: JSX.Element[] = [];
    svgMemoryTable.forEach((cell) => {
      if (cell.getAddress() > 50000) {
        list.push(
          <React.Fragment>
            <rect
              x="100.5"
              y={50.5 + 20 * (cell.getAddress() - minAddress)}
              width={width - 0.9}
              height={cell.getHeight() * 20 - 1.5}
              fill="white"
            ></rect>
            <text
              x="110"
              y={65 + 20 * (cell.getAddress() - minAddress)}
              fontSize="15"
            >
              {cell.getStackName() + '_' + cell.getName()}
            </text>
          </React.Fragment>
        );
      }
    });
    d3.select('#memory').attr('height', (d) => {
      if (
        100 + 20 * (maxAddress - minAddress) &&
        100 + 20 * (maxAddress - minAddress) > 0
      ) {
        return 100 + 20 * (maxAddress - minAddress);
      } else {
        return 0;
      }
    });
    return list;
  }

  render() {
    const backgroud = this.renderBackgroud();
    const variable = this.renderVariable();
    return (
      <React.Fragment>
        <g>{backgroud}</g>
        <g>{variable}</g>
      </React.Fragment>
    );
  }
}
