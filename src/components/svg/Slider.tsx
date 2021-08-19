import * as React from 'react';
import { signal, slot } from '../emitter';

interface Props {
  step: number;
  max: number;
  scale: any;
  width: number;
  height: number;
  selectedColor: string;
  unselectedColor: string;
  variablesHighlight: any;
  statementsHighlight: any;
}
interface State {
  dragging: boolean;
  dragIndex?: any;
}

export default class Slider extends React.Component<Props, State> {
  componentDidMount() {
    window.addEventListener('mouseup', this.dragEnd, false);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.dragEnd, false);
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      dragging: false,
    };
  }

  dragStart = (e) => {
    e.stopPropagation();
    if (!this.state.dragging) {
      this.setState(
        {
          dragging: true,
        },
        () => {
          this.setState({ dragging: true });
        }
      );
    }
  };

  dragEnd = (e) => {
    e.stopPropagation();
    this.setState(
      {
        dragging: false,
      },
      () => {
        this.setState({ dragging: false });
      }
    );
  };

  dragFromSVG = (e) => {
    if (!this.state.dragging) {
      let step = this.props.scale.invert(e.nativeEvent.offsetX);
      step = Math.min(step, this.props.max);
      step = Math.max(step, 0);
      step = Math.round(step);
      signal('changeStep', step);
      signal('jumpTo', step);
      this.setState(
        {
          dragging: true,
        },
        () => {
          this.setState({ dragging: true });
        }
      );
    }
  };

  mouseMove = (e) => {
    if (this.state.dragging) {
      let step = this.props.scale.invert(e.nativeEvent.offsetX);
      step = Math.min(step, this.props.max);
      step = Math.max(step, 0);
      step = Math.round(step);
      signal('changeStep', step);
      signal('jumpTo', step);
    }
  };

  render() {
    const {
      step,
      max,
      scale,
      width,
      height,
      selectedColor,
      unselectedColor,
      variablesHighlight,
      statementsHighlight,
    } = this.props;
    const selectionWidth = width - (step / max) * width;

    return (
      <svg
        style={{
          display: 'block',
          paddingBottom: '8px',
          zIndex: 6,
          overflow: 'visible',
        }}
        height={height}
        width={width + 100}
        onMouseDown={this.dragFromSVG}
        onMouseMove={this.mouseMove}
      >
        <rect height={4} fill={unselectedColor} x={0} y={10} width={width} />
        <rect
          height={4}
          fill={selectedColor}
          x={scale(step)}
          y={10}
          width={selectionWidth}
        />
        <g
          tabIndex={0}
          transform={`translate(${scale(step)}, 0)`}
          key={`handle`}
          style={{ outline: 'none' }}
        >
          <circle
            style={{
              cursor: 'move',
              MozUserSelect: 'none',
              KhtmlUserSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            r={10}
            cx={0}
            cy={12.5}
            fill="#ddd"
            strokeWidth="1"
          />
          <circle
            style={{
              cursor: 'move',
              MozUserSelect: 'none',
              KhtmlUserSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onMouseDown={this.dragStart.bind(this)}
            r={9}
            cx={0}
            cy={12}
            fill="white"
            stroke="#ccc"
            strokeWidth="1"
          />
        </g>
        <g>
          {variablesHighlight.map((m) => {
            return (
              <g>
                {m['steps'].map((_step) => {
                  if (m['visible']) {
                    return (
                      <rect
                        height={30}
                        x={scale(_step) - 1.5}
                        y={-20}
                        width={3}
                        fill={m['color']}
                      ></rect>
                    );
                  }
                })}
              </g>
            );
          })}
        </g>
        <g>
          {statementsHighlight.map((m) => {
            return (
              <g>
                {m['steps'].map((_step, i) => {
                  if (m['visible']) {
                    let h = 5;
                    if (m['depth'][i] < 5) {
                      h = m['depth'][i] * 7 + h;
                    } else {
                      h = 40;
                    }
                    return (
                      <rect
                        height={h}
                        x={scale(_step) - 1.5}
                        y={14}
                        width={3}
                        fill={m['color']}
                      ></rect>
                    );
                  }
                })}
              </g>
            );
          })}
        </g>
      </svg>
    );
  }
}
