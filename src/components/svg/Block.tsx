import * as React from 'react';
import { BlockStack, BlockCell } from './BlockDrawer';

interface Props {
  blockStack: BlockStack;
}

interface State {}

export default class Block extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
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
          style={{ stroke: 'black', strokeWidth: '1.5px' }}
        ></rect>
        <text
          x={blockStack.x() + 5}
          y={blockStack.y() + BlockCell.FONT_SIZE + 7}
          fontSize={BlockCell.FONT_SIZE + 2}
          fontWeight="bold"
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
            >
              {blockCell.getName()}
            </text>
            <rect
              x={blockCell.x()}
              y={blockCell.y()}
              width={blockCell.getWidth()}
              height={blockCell.getHeight()}
              fill="white"
              style={{ stroke: 'black', strokeWidth: '1.5px' }}
            />
            <text
              x={blockCell.x() + 10}
              y={blockCell.y() + BlockCell.FONT_SIZE + 10}
              fontSize={BlockCell.FONT_SIZE}
            >
              {blockCell.getValue().toString()}
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
      <g id={this.props.blockStack.key}>
        {backgroud}
        {content}
      </g>
    );
  }
}
