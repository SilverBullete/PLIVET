import React from 'react';
import { MDBBtn, MDBBtnGroup } from 'mdb-react-ui-kit';
import { Button } from 'antd';
import {
  BackwardOutlined,
  ForwardOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RedoOutlined,
  PauseOutlined,
} from '@ant-design/icons';

import { DEBUG_STATE } from '../../server';
import { signal } from '../emitter';
import * as d3 from 'd3';

interface Props {
  debugState: DEBUG_STATE;
}
interface State {
  Start: boolean;
  Stop: boolean;
  BackAll: boolean;
  StepBack: boolean;
  Step: boolean;
  StepAll: boolean;
}

export default class ControlPanel extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      Start: false,
      Stop: false,
      BackAll: false,
      StepBack: false,
      Step: true,
      StepAll: true,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    switch (nextProps.debugState) {
      case 'Stop':
        this.setState({
          Start: false,
          Stop: false,
          BackAll: false,
          StepBack: false,
          Step: true,
          StepAll: true,
        });
        break;
      case 'First':
        this.setState({
          Start: true,
          Stop: true,
          BackAll: false,
          StepBack: false,
          Step: true,
          StepAll: true,
        });
        break;
      case 'stdin':
        this.setState({
          BackAll: false,
          StepBack: false,
          Step: true,
          StepAll: true,
        });
        break;
      case 'Debugging':
        this.setState({
          BackAll: true,
          StepBack: true,
          Step: true,
          StepAll: true,
        });
        break;
      case 'Executing':
        this.setState({
          BackAll: false,
          StepBack: false,
          Step: false,
          StepAll: false,
        });
        break;
      case 'EOF':
        this.setState({
          Start: true,
          Stop: true,
          BackAll: true,
          StepBack: true,
          Step: false,
          StepAll: false,
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <>
        <MDBBtnGroup vertical aria-label="Vertical button group">
          <Button
            icon={<RedoOutlined />}
            onClick={() => {
              signal('debug', 'Start');
              const arrowListJson = sessionStorage.getItem('arrowList');
              let arrowList = JSON.parse(arrowListJson);
              if (!arrowList) {
                arrowList = {};
              }
              Object.keys(arrowList).forEach((name) => {
                d3.select('#svg')
                  .select(`#block_${name}`)
                  .attr('transform', 'matrix(1,0,0,1,0,0)');
              });
              sessionStorage.clear();
            }}
            disabled={!this.state.Start}
          ></Button>
          {/* <Button
            icon={<CaretRightOutlined />}
            onClick={() => signal('debug', 'Stop')}
            disabled={!this.state.Stop}
          ></Button> */}
          <Button
            icon={<BackwardOutlined />}
            onClick={() => signal('debug', 'BackAll')}
            disabled={!this.state.BackAll}
          ></Button>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => signal('debug', 'StepBack')}
            disabled={!this.state.StepBack}
          ></Button>
          <Button
            icon={this.state.Stop ? <ArrowRightOutlined /> : <PauseOutlined />}
            onClick={() => signal('debug', this.state.Stop ? 'Step' : 'Start')}
            disabled={!this.state.Step}
          ></Button>
          <Button
            icon={<ForwardOutlined />}
            onClick={() =>
              signal('debug', this.state.Stop ? 'StepAll' : 'Exec')
            }
            disabled={!this.state.StepAll}
          ></Button>
        </MDBBtnGroup>
      </>
    );
  }
}
