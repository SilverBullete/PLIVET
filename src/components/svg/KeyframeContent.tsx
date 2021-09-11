import * as React from 'react';
import ControlPanel from './ControlPanel';
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
import { DEBUG_STATE } from '../../server';

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
  debugStatus: string;
  debugState: DEBUG_STATE;
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
      debugStatus: '',
      debugState: 'Stop',
    };
    slot('changeStep', (step: number) => {
      this.setState({ step: step });
    });
    slot('statementHighlight', (lineNumber: number) => {
      const { statementsHighlight, linesShowUp } = this.state;
      const statement = linesShowUp[lineNumber];
      const color = colors[Math.floor(Math.random() * colors.length)];
      statement['color'] = color;
      statementsHighlight.push(statement);
      this.setState({
        statementsHighlight: statementsHighlight,
      });
      d3.selectAll(`.highlight${lineNumber}`).style('background-color', color);
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
        console.log(variableShowUp);

        this.setState({
          max: stepCount,
          scale: linear().domain([0, stepCount]).range([0, 600]),
          variablesHighlight: [],
          statementsHighlight: [],
          options: options,
          linesShowUp: linesShowUp,
          variableShowUp: variableShowUp,
        });
      }
    );
    slot('changeState', (debugState: DEBUG_STATE, step: number) => {
      let debugStatus = '';
      if (debugState === 'Debugging') {
        debugStatus = `Step ${step}`;
      } else {
        debugStatus = debugState;
      }
      this.setState({ debugStatus, debugState });
    });
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

  changeStatementVisible = (lineNumber: number) => {
    const { statementsHighlight } = this.state;
    for (let i = 0; i < statementsHighlight.length; i++) {
      if (statementsHighlight[i]['lineNumber'] === lineNumber) {
        statementsHighlight[i]['visible'] = !statementsHighlight[i]['visible'];
        break;
      }
    }
    this.setState({ statementsHighlight: statementsHighlight });
  };

  addVariableHighlight = (funcName: string, varName: string) => {
    const { variablesHighlight, variableShowUp } = this.state;
    const color = colors[Math.floor(Math.random() * colors.length)];
    let temp = null;
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i]['function'] === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        variableShowUp[i].color = color;
        temp = variableShowUp[i];
        break;
      }
    }
    if (inArray(temp, variablesHighlight) < 0) {
      variablesHighlight.push(temp);
      this.setState({
        variablesHighlight: variablesHighlight,
        variableShowUp: variableShowUp,
      });
    }
    const memoryCells = d3
      .select('#memory')
      .selectAll(`.memory-${funcName}-${varName}`);
    memoryCells.select('rect').style('stroke', color);
    memoryCells.selectAll('text').attr('fill', color);
    const blockCells = d3
      .select('#svg')
      .selectAll(`.block-${funcName}-${varName}`);
    blockCells.select('rect').style('stroke', color);
    blockCells.selectAll('text').attr('fill', color);
  };

  removeVariableHighlight = (funcName: string, varName: string) => {
    const { variablesHighlight, variableShowUp } = this.state;
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i]['function'] === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        variableShowUp[i]['visible'] = true;
        break;
      }
    }
    for (let i = 0; i < variablesHighlight.length; i++) {
      for (let j = 0; j < variablesHighlight.length; j++) {
        if (
          variablesHighlight[j]['function'] === funcName &&
          variablesHighlight[j]['name'] === varName
        ) {
          variablesHighlight.splice(i, 1);
          break;
        }
      }
    }
    const memoryCells = d3
      .select('#memory')
      .selectAll(`.memory-${funcName}-${varName}`);
    memoryCells.select('rect').style('stroke', 'black');
    memoryCells.selectAll('text').attr('fill', 'black');
    const blockCells = d3
      .select('#svg')
      .selectAll(`.block-${funcName}-${varName}`);
    blockCells.select('rect').style('stroke', 'black');
    blockCells.selectAll('text').attr('fill', 'black');
    this.setState({
      variablesHighlight: variablesHighlight,
      variableShowUp: variableShowUp,
    });
  };

  changeVariableColor = (funcName: string, varName: string, color: string) => {
    const { variablesHighlight, variableShowUp } = this.state;
    let i = 0;
    for (; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i]['function'] === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        variableShowUp[i]['color'] = color;
        break;
      }
    }
    for (let j = 0; j < variablesHighlight.length; j++) {
      if (
        variablesHighlight[j]['function'] === funcName &&
        variablesHighlight[j]['name'] === varName
      ) {
        variablesHighlight[j]['color'] = color;
        break;
      }
    }
    const memoryCells = d3
      .select('#memory')
      .selectAll(`.memory-${funcName}-${varName}`);
    memoryCells.select('rect').style('stroke', color);
    memoryCells.selectAll('text').attr('fill', color);
    const blockCells = d3
      .select('#svg')
      .selectAll(`.block-${funcName}-${varName}`);
    blockCells.select('rect').style('stroke', color);
    blockCells.selectAll('text').attr('fill', color);
    this.setState({
      variablesHighlight: variablesHighlight,
      variableShowUp: variableShowUp,
    });
  };

  changeVariableVisible = (funcName: string, varName: string) => {
    const { variablesHighlight, variableShowUp } = this.state;
    for (let i = 0; i < variableShowUp.length; i++) {
      if (
        variableShowUp[i]['function'] === funcName &&
        variableShowUp[i]['name'] === varName
      ) {
        if (variableShowUp[i]['visible']) {
          const memoryCells = d3
            .select('#memory')
            .selectAll(`.memory-${funcName}-${varName}`);
          memoryCells.select('rect').style('stroke', 'black');
          memoryCells.selectAll('text').attr('fill', 'black');
          const blockCells = d3
            .select('#svg')
            .selectAll(`.block-${funcName}-${varName}`);
          blockCells.select('rect').style('stroke', 'black');
          blockCells.selectAll('text').attr('fill', 'black');
        } else {
          const memoryCells = d3
            .select('#memory')
            .selectAll(`.memory-${funcName}-${varName}`);
          memoryCells
            .select('rect')
            .style('stroke', variableShowUp[i]['color']);
          memoryCells
            .selectAll('text')
            .attr('fill', variableShowUp[i]['color']);
          const blockCells = d3
            .select('#svg')
            .selectAll(`.block-${funcName}-${varName}`);
          blockCells.select('rect').style('stroke', variableShowUp[i]['color']);
          blockCells.selectAll('text').attr('fill', variableShowUp[i]['color']);
        }
        variableShowUp[i]['visible'] = !variableShowUp[i]['visible'];
        break;
      }
    }
    this.setState({
      variablesHighlight: variablesHighlight,
      variableShowUp: variableShowUp,
    });
  };

  render() {
    return (
      <>
        <MDBRow>
          <MDBCol size="1">
            <ControlPanel debugState={this.state.debugState}></ControlPanel>
          </MDBCol>
          <MDBCol size="7">
            <div style={{ padding: 30, height: 160 }}>
              <Slider
                step={this.state.step}
                max={this.state.max}
                scale={this.state.scale}
                width={600}
                height={100}
                selectedColor="#DDDDDD"
                unselectedColor="#0074D9"
                variablesHighlight={this.state.variablesHighlight}
                statementsHighlight={this.state.statementsHighlight}
              />
            </div>
          </MDBCol>
          <MDBCol size="2">
            <StatementsHighlightContent
              changeStatementColor={this.changeStatementColor}
              statementsHighlight={this.state.statementsHighlight}
              changeStatementVisible={this.changeStatementVisible}
            />
          </MDBCol>
          <MDBCol size="2">
            <VariableHighlightContent
              variablesHighlight={this.state.variablesHighlight}
              options={this.state.options}
              addVariableHighlight={this.addVariableHighlight}
              changeVariableColor={this.changeVariableColor}
              changeVariableVisible={this.changeVariableVisible}
              removeVariableHighlight={this.removeVariableHighlight}
            />
          </MDBCol>
        </MDBRow>
      </>
    );
  }
}
