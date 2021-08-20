import * as React from 'react';
import Slider from './Slider';
import VariableHighlightContent from './VariableHighlightContent';
import StatementsHighlightContent from './StatementsHighlightContent';
import { signal, slot } from '../emitter';
import { scaleLinear as linear } from 'd3-scale';
import { MDBContainer, MDBRow, MDBCol } from 'mdb-react-ui-kit';
import 'rc-color-picker/assets/index.css';
import colors from '../Color';
import * as d3 from 'd3';
import { inArray } from 'jquery';

interface Props {}

interface State {
  max: number;
  marks: any;
  scale: any;
  step: number;
  variablesHighlight: any;
  statementsHighlight: any;
  options: any;
  linesShowUp: any;
  variableShowUp: any;
}

export default class KeyframeContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      max: 0,
      marks: {},
      scale: linear().domain([0, 0]).range([0, 500]),
      step: 0,
      variablesHighlight: [],
      statementsHighlight: [],
      options: [],
      linesShowUp: [],
      variableShowUp: [],
    };
    slot('changeStep', (step: number) => {
      this.setState({ step: step });
    });
    slot('statementHighlight', (lineNumber: number) => {
      const { statementsHighlight, linesShowUp } = this.state;
      const statement = linesShowUp[lineNumber];
      statement['color'] = colors[statementsHighlight.length];
      statementsHighlight.push(statement);
      this.setState({
        statementsHighlight: statementsHighlight,
      });
      d3.selectAll(`.highlight${lineNumber}`).style(
        'background-color',
        colors[statementsHighlight.length - 1]
      );
    });
    slot('cancelStatementHighlight', (lineNumber: number) => {
      const { statementsHighlight } = this.state;
      for (let i = 0; i < statementsHighlight.length; i++) {
        if (statementsHighlight[i]['lineNumber'] == lineNumber + 1) {
          statementsHighlight.splice(i, 1);
          break;
        }
      }
      d3.selectAll(`.highlight${lineNumber}`).style('background-color', '#fff');
      this.setState({ statementsHighlight: statementsHighlight });
    });
    slot(
      'init',
      (
        stepCount: number,
        linesShowUp: any,
        allVariables: any,
        variableShowUp: any
      ) => {
        const options = [];
        Object.keys(allVariables).forEach((funcName) => {
          const temp = {
            value: funcName,
            label: funcName,
            children: [],
          };
          Object.keys(allVariables[funcName]).forEach((varName) => {
            temp.children.push({
              value: varName,
              label: varName,
            });
          });
          options.push(temp);
        });

        this.setState({
          max: stepCount,
          scale: linear().domain([0, stepCount]).range([0, 500]),
          variablesHighlight: [],
          statementsHighlight: [],
          options: options,
          linesShowUp: linesShowUp,
          variableShowUp: variableShowUp,
        });
      }
    );
  }

  changeStatementColor = (lineNumber: number, color: string) => {
    const { statementsHighlight } = this.state;
    for (let i = 0; i < statementsHighlight.length; i++) {
      if (statementsHighlight[i]['lineNumber'] == lineNumber) {
        statementsHighlight[i]['color'] = color;
        break;
      }
    }
    d3.selectAll(`.highlight${lineNumber - 1}`).style(
      'background-color',
      color
    );
    this.setState({ statementsHighlight: statementsHighlight });
  };

  addVariableHighlight = (funcName: string, varName: string) => {
    const { variablesHighlight, variableShowUp } = this.state;
    let temp = null;
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i]['function'] === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        temp = variableShowUp[i];
        break;
      }
    }
    if (inArray(temp, variablesHighlight) < 0) {
      variablesHighlight.push(temp);
      this.setState({
        variablesHighlight: variablesHighlight,
      });
    }
  };

  changeVariableColor = (funcName: string, varName: string, color: string) => {
    const { variablesHighlight, variableShowUp } = this.state;
    let i = 0;
    for (; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i]['function'] === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        break;
      }
    }
    variablesHighlight[inArray(variableShowUp[i], variablesHighlight)][
      'color'
    ] = color;
    variableShowUp[i]['color'] = color;
    this.setState({
      variablesHighlight: variablesHighlight,
      variableShowUp: variableShowUp,
    });
  };

  render() {
    return (
      <MDBContainer>
        <MDBRow>
          <MDBCol size="8">
            <div style={{ padding: 30 }}>
              <Slider
                step={this.state.step}
                max={this.state.max}
                scale={this.state.scale}
                width={500}
                height={50}
                selectedColor="#0074D9"
                unselectedColor="#DDDDDD"
                variablesHighlight={this.state.variablesHighlight}
                statementsHighlight={this.state.statementsHighlight}
              />
            </div>
          </MDBCol>
          <MDBCol size="2">
            <StatementsHighlightContent
              changeStatementColor={this.changeStatementColor}
              statementsHighlight={this.state.statementsHighlight}
            />
          </MDBCol>
          <MDBCol size="2">
            <VariableHighlightContent
              variablesHighlight={this.state.variablesHighlight}
              options={this.state.options}
              addVariableHighlight={this.addVariableHighlight}
            />
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
}
