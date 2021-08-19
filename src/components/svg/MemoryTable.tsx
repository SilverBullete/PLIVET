import React from 'react';
import { SvgMemoryCell } from './MemoryDrawer';
import hexToRgba from '../Color';
import * as d3 from 'd3';

interface Props {
  id: string;
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

export default class MemoryTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  
}