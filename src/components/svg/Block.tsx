import * as React from 'react';
import { BlockStack, BlockCell } from './BlockDrawer';
import * as d3 from 'd3';

interface Props {
  blockStack: BlockStack;
}

interface State {}

export function wrapWord(text, width, className) {
  text.each(function () {
    let text = d3.select(this),
      words = text.text().split('').reverse(),
      word,
      line = [],
      x = text.attr('x'),
      y = text.attr('y'),
      tspan = text
        .text(null)
        .append('tspan')
        .attr('class', className)
        .attr('x', x)
        .attr('y', y);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(''));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        line.splice(line.length - 2, 3, '.', '.', '.');
        tspan.text(line.join(''));
        break;
      }
    }
  });
}

export default class Block extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate() {
    wrapWord(d3.selectAll('.value'), BlockCell.WIDTH - 10, 'value');
  }

  renderBlockBackground() {
    const { blockStack } = this.props;
    return (
      <React.Fragment>
        <rect
          x={blockStack.x()}
          y={blockStack.y()}
          width={blockStack.getWidth()}
          height={blockStack.getHeight()}
          fill="white"
          style={{ stroke: blockStack.getColor(), strokeWidth: '1.5px' }}
        ></rect>
        <text
          x={blockStack.x() + 5}
          y={blockStack.y() + BlockCell.FONT_SIZE + 7}
          fontSize={BlockCell.FONT_SIZE + 2}
          fontWeight="bold"
          fill={blockStack.getColor()}
        >
          {blockStack.key}
        </text>
      </React.Fragment>
    );
  }

  renderBlockContent() {
    const { blockStack } = this.props;
    const list: JSX.Element[] = [];
    const blockTable = blockStack.getBlockTable();
    blockTable.forEach((blockCellContainer) => {
      for (let i = 0; i < 1; i++) {
        if (i >= 3) break;
        const blockCell = blockCellContainer[i];
        list.push(
          <g id={blockCell.key}>
            <text
              x={blockCell.x() + 5}
              y={blockCell.y() - 5}
              fontSize={BlockCell.FONT_SIZE}
              fontWeight="blod"
              fill={blockStack.getColor()}
            >
              {blockCell.getName()}
            </text>
            <rect
              x={blockCell.x()}
              y={blockCell.y()}
              width={blockCell.getWidth()}
              height={blockCell.getHeight()}
              fill="white"
              style={{ stroke: blockStack.getColor(), strokeWidth: '1.5px' }}
            />
            <text
              className="value"
              x={blockCell.x() + 10}
              y={blockCell.y() + BlockCell.FONT_SIZE + 10}
              fontSize={BlockCell.FONT_SIZE}
              fill={blockStack.getColor()}
            >
              {blockCell.getValue()}
            </text>
          </g>
        );
      }
    });
    return list;
  }

  render() {
    const backgroud = this.renderBlockBackground();
    const content = this.renderBlockContent();
    return (
      <g id={this.props.blockStack.getName()}>
        {backgroud}
        {content}
      </g>
    );
  }
}
