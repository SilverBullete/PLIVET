import * as React from 'react';
import { AnimationDrawer } from './AnimationDrawer';
import * as d3 from 'd3';
import { inArray } from 'jquery';
import { BlockCell } from './BlockDrawer';
import { selection } from 'd3-selection';
import selection_appendClone from 'd3-clone/src/clone/append';

selection.prototype.appendClone = selection_appendClone;

interface Props {
  animationDrawer: AnimationDrawer;
}

interface State {}

export default class AnimationContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentWillUpdate(newProps) {
    const { destroyList, addList } = this.compareProps(this.props, newProps);
    destroyList.forEach((item) => {
      d3.select('#' + item)
        .style('fill-opacity', 1)
        .style('stroke-opacity', 1)
        .style('display', 'inline')
        .transition()
        .duration(2000)
        .style('fill-opacity', 1e-6)
        .style('stroke-opacity', 1e-6);
      d3.select('#' + item)
        .transition()
        .delay(2000)
        .style('display', 'none');
    });
  }

  componentDidUpdate(prevProps) {
    const { destroyList, addList } = this.compareProps(prevProps, this.props);
    console.log(addList);

    addList.forEach((item) => {
      // d3.select('#' + item)
      //   .attr('transform', 'matrix(1,0,0,1,0,400)')
      //   .style('fill-opacity', 1)
      //   .style('stroke-opacity', 1)
      //   .style('display', 'inline');
      // d3.select('#' + item)
      //   .select('rect')
      //   .style('stroke-dasharray', '10,15')
      //   .transition()
      //   .delay(2000)
      //   .duration(2000)
      //   .tween('number', function () {
      //     let i = d3.interpolateArray([10, 25], [25, 0]);
      //     return function (t) {
      //       d3.select('#' + item)
      //         .select('rect')
      //         .style('stroke-dasharray', i(t)[0] + ',' + i(t)[1]);
      //     };
      //   });
      // d3.select('#' + item)
      //   .transition()
      //   .delay(2000)
      //   .duration(2000)
      //   .tween('number', function () {
      //     let i = d3.interpolateRound(400, 0);
      //     return function (t) {
      //       d3.select('#' + item).attr(
      //         'transform',
      //         'matrix(1,0,0,1,0,' + i(t) + ')'
      //       );
      //     };
      //   });
      d3.select('#' + item)
        .style('display', 'inline')
        .style('fill-opacity', 1)
        .style('stroke-opacity', 1);
    });
    const { animationDrawer } = this.props;
    const exeState = animationDrawer.getState();
    console.log(exeState);

    switch (exeState) {
      case 'programInit':
        this.programInit();
        break;
      case 'uniReturn':
        this.uniReturn();
        break;
      case 'methodCall':
        this.methodCall();
        break;
      default:
        this.variablesInit();
      // case 'variablesInit':
      //   this.variablesInit();
      //   break;
    }
  }

  programInit() {
    d3.select('#main')
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1)
      .style('display', 'inline');
    d3.select('#main').select('rect').style('stroke-dasharray', '0,25');
    d3.select('#main')
      .select('rect')
      .transition()
      .duration(2000)
      .styleTween('stroke-dasharray', function () {
        return d3.interpolateArray([0, 25], [25, 0]);
      });
  }

  variablesInit() {
    const { animationDrawer } = this.props;
    const keys = animationDrawer.getVariableKeys();
    const types = animationDrawer.getVariableTypes();
    const values = animationDrawer.getVariableValues();
    if (keys === undefined) {
      return;
    }
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      d3.select('#' + key)
        .select('rect')
        .style('stroke-dasharray', '0,25');
      d3.select('#' + key)
        .select('rect')
        .transition()
        .duration(2000)
        .styleTween('stroke-dasharray', function () {
          return d3.interpolateArray([0, 25], [25, 0]);
        });
      this.variableChange(key, types[i], values[i], 0, 0);
    }
  }

  methodCall() {
    const { animationDrawer } = this.props;
    const stackName = animationDrawer.getStackName();
    const postArgs = animationDrawer.getPostArgs();
    const keys = animationDrawer.getVariableKeys();
    const types = animationDrawer.getVariableTypes();
    const values = animationDrawer.getVariableValues();

    d3.select('#' + stackName).attr('transform', 'matrix(1,0,0,1,0,400)');
    d3.select('#' + stackName)
      .select('rect')
      .style('stroke-dasharray', '10,15')
      .transition()
      .delay(2000)
      .duration(2000)
      .tween('number', function () {
        let i = d3.interpolateArray([10, 25], [25, 0]);
        return function (t) {
          d3.select('#' + stackName)
            .select('rect')
            .style('stroke-dasharray', i(t)[0] + ',' + i(t)[1]);
        };
      });
    postArgs.forEach((arg, idx) => {
      let source = 0;
      if (arg === undefined) {
        d3.select('#' + keys[idx])
          .select('rect')
          .style('stroke-dasharray', '0,25');
        d3.select('#' + keys[idx])
          .select('rect')
          .transition()
          .duration(2000)
          .styleTween('stroke-dasharray', function () {
            return d3.interpolateArray([0, 25], [25, 0]);
          });
      } else {
        const cloned = d3
          .select('#svg')
          .appendClone(d3.select('#' + postArgs[idx]));
        cloned.select('text').remove();
        const target = d3.select('#' + keys[idx]);
        target
          .select('rect')
          .style('display', 'none')
          .transition()
          .delay(1000)
          .style('display', 'inline');
        target
          .selectAll('.value')
          .style('display', 'none')
          .transition()
          .delay(1000)
          .style('display', 'inline');
        cloned
          .select('rect')
          .transition()
          .duration(1000)
          .attr('x', target.select('rect').attr('x'))
          .attr('y', Number(target.select('rect').attr('y')) + 400);
        cloned
          .selectAll('.value')
          .transition()
          .duration(1000)
          .attr('x', target.selectAll('.value').attr('x'))
          .attr('y', Number(target.selectAll('.value').attr('y')) + 400);
        cloned.transition().delay(1000).remove();
        source = cloned.select('.value').text();
      }
      this.variableChange(keys[idx], types[idx], values[idx], source, 1000);
    });

    d3.select('#' + stackName)
      .transition()
      .delay(2000)
      .duration(2000)
      .tween('number', function () {
        let i = d3.interpolateRound(400, 0);
        return function (t) {
          d3.select('#' + stackName).attr(
            'transform',
            'matrix(1,0,0,1,0,' + i(t) + ')'
          );
        };
      });
  }

  variableChange(key, type, value, source, delay) {
    if (
      !type.startsWith('char') &&
      !type.startsWith('unsignedchar') &&
      type.split('[').length == 1
    ) {
      const number = value;
      d3.select('#' + key)
        .selectAll('.value')
        .transition()
        .duration(2000)
        .delay(delay)
        .tween('number', function () {
          let i = d3.interpolateRound(Number(source), number);
          return function (t) {
            this.textContent = i(t);
          };
        });
    } else {
      const y = Number(
        d3
          .select('#' + key)
          .select('.value')
          .attr('y')
      );
      const str = d3
        .select('#' + key)
        .select('.value')
        .text();
      d3.select('#' + key)
        .selectAll('.value')
        .attr('y', y - 30)
        .style('fill-opacity', 1e-6)
        .transition()
        .delay(delay)
        .duration(2000)
        .text(str)
        .attr('y', y)
        .style('fill-opacity', 1);
    }
  }

  uniReturn() {
    const { animationDrawer } = this.props;
    const postArgs = animationDrawer.getPostArgs();
    if (postArgs.length < 1) return;
    const len = animationDrawer.getVariableKeys().length;
    if (len == 0) return;
    const key = animationDrawer.getVariableKeys()[len - 1];
    const type = animationDrawer.getVariableTypes()[len - 1];
    const value = animationDrawer.getVariableValues()[len - 1];
    console.log(key, type, value);

    const target = d3.select('#' + key);
    target
      .select('rect')
      .style('display', 'none')
      .transition()
      .delay(1000)
      .style('display', 'inline');
    target
      .selectAll('.value')
      .style('display', 'none')
      .transition()
      .delay(1000)
      .style('display', 'inline');
    const cloned = d3.select('#svg').appendClone(d3.select('#' + postArgs[0]));
    cloned.select('rect').style('fill-opacity', 1).style('stroke-opacity', 1);
    cloned
      .selectAll('.value')
      .style('fill-opacity', 1)
      .style('stroke-opacity', 1);
    cloned.select('text').remove();
    cloned
      .select('rect')
      .transition()
      .duration(1000)
      .attr('x', target.select('rect').attr('x'))
      .attr('y', target.select('rect').attr('y'));
    cloned
      .selectAll('.value')
      .transition()
      .duration(1000)
      .attr('x', target.selectAll('.value').attr('x'))
      .attr('y', target.selectAll('.value').attr('y'));

    cloned.transition().delay(1000).remove();
    this.variableChange(key, type, value, cloned.select('.value').text(), 1000);
  }

  compareProps(prevProps: Props, newProps: Props) {
    const stacks = prevProps.animationDrawer.getStacks();
    const newStacks = newProps.animationDrawer.getStacks();
    const destroyList = [];
    const addList = [];
    const stacksLen = stacks.length;
    const newStacksLen = newStacks.length;
    if (stacksLen > newStacksLen) {
      for (let i = newStacksLen; i < stacksLen; i++) {
        const stack = stacks[i];
        const stackName = stack.name.replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
        destroyList.push(stackName);
      }
    } else if (stacksLen != 0 && stacksLen < newStacksLen) {
      for (let i = stacksLen; i < newStacksLen; i++) {
        const stack = newStacks[i];
        const stackName = stack.name.replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
        addList.push(stackName);
      }
    }
    return { destroyList, addList };
  }

  render() {
    return <React.Fragment></React.Fragment>;
  }
}
