import React from 'react';
import { SvgCell } from './SvgDrawer';
import hexToRgba from '../Color';

interface Props {
  x: number;
  y: number;
  text: string;
  width: number;
  marginX: number;
  marginY: number;
  align?: string;
  fontStyle?: string;
  onClick?: () => void;
  isVisible: boolean;
  colors?: string[];
}

interface State {}

export default class TextWithRect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    if (!this.props.isVisible) {
      return null;
    }
    const {
      x,
      y,
      text,
      width,
      align,
      fontStyle,
      onClick,
      colors,
      marginX,
      marginY,
    } = this.props;
    const height = SvgCell.HEIGHT;
    const isAlignCenter = align && align === 'center';
    const colorAndPos: (string | number)[] = [];
    if (Array.isArray(colors) && 0 < colors.length) {
      let pos = 0;
      const colorBuf = colors.length === 1 ? colors.concat(colors[0]) : colors;
      for (const color of colorBuf.map((color) => color + '44')) {
        colorAndPos.push(pos, hexToRgba(color));
        pos += 1.0 / (colorBuf.length - 1);
      }
    } else {
      // [Caution!] Microsoft Edge does not support
      // RGBA hexadecimal notation #RRGGBBAA (e.g. #00000000)
      colorAndPos.push(0, 'rgba(0,0,0,0)', 1, 'rgba(0,0,0,0)');
    }

    return (
      <React.Fragment>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="white"
          style={{ stroke: 'black', strokeWidth: '1.5px' }}
        />
        <text
          x={x + marginX}
          y={y + marginY}
          fontStyle={fontStyle ? fontStyle : 'normal'}
          width={width}
          height={height}
          fontSize={SvgCell.FONT_SIZE}
          onClick={onClick ? onClick : undefined}
        >
          {text}
        </text>
      </React.Fragment>
    );
  }
}
