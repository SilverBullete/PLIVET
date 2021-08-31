import * as React from 'react';
import { slot } from '../emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import '../../css/canvas.css';
import { MemoryDrawer } from './MemoryDrawer';
import { BlockDrawer } from './BlockDrawer';
import { AnimationDrawer } from './AnimationDrawer';
import Memory from './Memory';
import BlockContent from './BlockContent';
import AnimationContent from './AnimationContent';
import { MDBCard, MDBCardHeader, MDBCardBody } from 'mdb-react-ui-kit';
import * as d3 from 'd3';
import { Radio, Affix } from 'antd';
import PerfectScrollbar from 'react-perfect-scrollbar';
import KeyframeContent from './KeyframeContent';

interface Props {
  width: number;
  height: number;
}
interface State {
  execState?: ExecState;
  lastState?: ExecState;
  memoryView: string;
  affixRef?: any;
}

export default class Svg extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      execState: undefined,
      memoryView: 'logical',
      affixRef: React.createRef(),
    };
    slot('draw', (execState: ExecState, lastState: ExecState) =>
      this.setState({ execState, lastState })
    );
  }

  changeHandel = (e) => {
    this.setState({ memoryView: e.target.value });
  };

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
                <marker
                  id="arrow"
                  viewBox="0 -5 10 10"
                  refX="15"
                  refY="-1.5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,-5L10,0L0,5"></path>
                </marker>
                <g id="path"></g>
                <BlockContent
                  blockDrawer={new BlockDrawer(this.state.execState)}
                ></BlockContent>
              </svg>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="right">
          <MDBCard border="#ececec">
            <MDBCardHeader style={{ fontSize: 15 }}>
              Memory Allocation
            </MDBCardHeader>
            <Radio.Group
              defaultValue="logical"
              buttonStyle="solid"
              onChange={this.changeHandel}
              style={{ padding: 4 }}
            >
              <Radio.Button value="logical">Logical view</Radio.Button>
              <Radio.Button value="physical">Physical view</Radio.Button>
            </Radio.Group>
            {this.state.memoryView === 'physical' ? (
              <div
                id="container"
                style={{
                  position: 'absolute',
                  top: 150,
                  left: 230,
                  fontSize: 20,
                }}
              ></div>
            ) : (
              ''
            )}

            <PerfectScrollbar>
              <MDBCardBody
                style={{
                  height: 0.99 * this.props.height - 330,
                }}
              >
                <svg
                  id="memory"
                  width={0.28 * this.props.width}
                  height={0.99 * this.props.height - 350}
                >
                  <marker
                    id="arrow"
                    viewBox="0 -5 10 10"
                    refX="15"
                    refY="-1.5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,-5L10,0L0,5"></path>
                  </marker>
                  <g id="arrows"></g>
                  <Memory
                    memoryDrawer={new MemoryDrawer(this.state.execState)}
                    memoryView={this.state.memoryView}
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
