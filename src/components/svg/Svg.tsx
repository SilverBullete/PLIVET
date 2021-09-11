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
import { Radio, Descriptions } from 'antd';
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
  changeMemory: any;
}

export default class Svg extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      execState: undefined,
      memoryView: 'logical',
      changeMemory: [false],
    };
    slot('draw', (execState: ExecState, lastState: ExecState) =>
      this.setState({ execState, lastState })
    );
  }

  changeHandel = (e) => {
    this.setState({ memoryView: e.target.value, changeMemory: [true] });
  };

  componentDidUpdate() {
    this.state.changeMemory[0] = false;
  }

  render() {
    return (
      <div id="display">
        <div id="keyframe">
          <MDBCard border="#ececec">
            <MDBCardHeader style={{ fontSize: 20 }}>Keyframe</MDBCardHeader>
            <MDBCardBody style={{}}>
              <KeyframeContent></KeyframeContent>
            </MDBCardBody>
          </MDBCard>
        </div>
        <div className="left">
          <MDBCard border="#ececec" style={{ height: '100%' }}>
            <MDBCardHeader style={{ fontSize: 20 }}>
              Calling Stack
            </MDBCardHeader>
            <MDBCardBody style={{ height: '100%' }}>
              <svg
                width={0.65 * this.props.width}
                height={0.98 * this.props.height - 330}
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
                  <path d="M0,-5L10,0L0,5" style={{ stroke: '#858585' }}></path>
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
          <MDBCard border="#ececec" style={{ height: '100%' }}>
            <MDBCardHeader style={{ fontSize: 20 }}>
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
            <MDBCardBody>
              <div
                style={{
                  height: 0.98 * this.props.height - 670,
                }}
              >
                <PerfectScrollbar>
                  <svg
                    id="memory"
                    width={0.3 * this.props.width - 35}
                    height={0}
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
                      <path
                        d="M0,-5L10,0L0,5"
                        style={{ fill: '#858585' }}
                      ></path>
                    </marker>
                    <g id="arrows"></g>
                    <Memory
                      memoryDrawer={new MemoryDrawer(this.state.execState)}
                      memoryView={this.state.memoryView}
                    />
                  </svg>
                  <AnimationContent
                    animationDrawer={
                      new AnimationDrawer(
                        this.state.execState,
                        this.state.lastState
                      )
                    }
                    changeMemory={this.state.changeMemory}
                  />
                </PerfectScrollbar>
              </div>
            </MDBCardBody>
            <div
              id="container"
              style={{
                position: 'absolute',
                bottom: 10,
                left: 20,
                fontSize: 20,
                width: 0.3 * this.props.width - 40,
              }}
            >
              <Descriptions
                bordered
                title="Variable Information"
                size="small"
                column={2}
                colon={false}
              >
                <Descriptions.Item label="Function Name"> </Descriptions.Item>
                <Descriptions.Item label="Variable Name"> </Descriptions.Item>
                <Descriptions.Item label="Address" span={2}>
                  {' '}
                </Descriptions.Item>
                <Descriptions.Item label="Type" span={2}>
                  {' '}
                </Descriptions.Item>
                <Descriptions.Item label="Value" span={2}>
                  {' '}
                </Descriptions.Item>
                <Descriptions.Item label="Binary Code" span={2}>
                  {' '}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </MDBCard>
        </div>
      </div>
    );
  }
}
