import React from 'react';
import { Group } from 'react-konva';
import { SvgRow, SvgCell } from './SvgDrawer';
import TextWithRect from './TextWithRect';

interface Props {
  svgRow: SvgRow;
}

interface State {}

export default class VariableRect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const canvasRow = this.props.svgRow;
    const list = canvasRow.map((cell: SvgCell) => {
      const { width, isVisible, key } = cell;
      const x = cell.x();
      const y = cell.y();
      const text = cell.getText();
      const canToggleFold = cell.canToggleFold();
      return (
        <TextWithRect
          key={key}
          x={x}
          y={y}
          text={text}
          width={width}
          align={canToggleFold ? 'center' : undefined}
          onClick={canToggleFold ? () => cell.toggleFold() : undefined}
          isVisible={isVisible}
          colors={cell.getColors()}
        />
      );
    });
    return <Group>{list}</Group>;
  }
}
