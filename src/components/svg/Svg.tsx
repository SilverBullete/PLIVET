import * as React from 'react';
import { slot } from '../emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import SvgContent from './SvgContent';
import '../../css/canvas.css';
import { MemoryDrawer } from './MemoryDrawer';
import { BlockDrawer } from './BlockDrawer';
import { AnimationDrawer } from './AnimationDrawer';
import Arrow from './Arrow';
import Memory from './Memory';
import BlockContent from './BlockContent';
import AnimationContent from './AnimationContent';
import { MDBCard, MDBCardHeader, MDBCardBody } from 'mdb-react-ui-kit';
import * as d3 from 'd3';
import PerfectScrollbar from 'react-perfect-scrollbar';
import KeyframeContent from './KeyframeContent';

interface Props {
  width: number;
  height: number;
}
interface State {
  execState?: ExecState;
  lastState?: ExecState;
}

export default class Svg extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { execState: undefined };
    slot('draw', (execState: ExecState, lastState: ExecState) =>
      this.setState({ execState, lastState })
    );
  }
  render() {
    return (
      <div id="display">
        <div id="keyframe">
          <MDBCard border="#ececec">
            <MDBCardHeader style={{ fontSize: 15 }}>Keyframe</MDBCardHeader>
            <MDBCardBody style={{}}>
              <KeyframeContent></KeyframeContent>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="left">
          <MDBCard border="#ececec">
            <MDBCardHeader style={{ fontSize: 15 }}>
              Calling Stack
            </MDBCardHeader>
            <MDBCardBody style={{ height: 0.99 * this.props.height - 290 }}>
              <svg
                width={0.65 * this.props.width}
                height={0.99 * this.props.height - 310}
                id="svg"
              >
                {/* <BlockContent
                  blockDrawer={new BlockDrawer(this.state.execState)}
                ></BlockContent> */}
              </svg>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="right">
          <MDBCard border="#ececec">
            <MDBCardHeader style={{ fontSize: 15 }}>
              Memory Allocation
            </MDBCardHeader>
            <PerfectScrollbar>
              <MDBCardBody style={{ height: 0.99 * this.props.height - 290 }}>
                <svg
                  id="memory"
                  width={0.28 * this.props.width}
                  height={0.99 * this.props.height - 310}
                >
                  <Memory
                    memoryDrawer={new MemoryDrawer(this.state.execState)}
                  />
                </svg>

                {/* <AnimationContent
                  animationDrawer={
                    new AnimationDrawer(
                      this.state.execState,
                      this.state.lastState
                    )
                  }
                /> */}
              </MDBCardBody>
            </PerfectScrollbar>
          </MDBCard>
        </div>
      </div>
    );
  }
}
