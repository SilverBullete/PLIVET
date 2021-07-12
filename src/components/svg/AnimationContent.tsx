import * as React from 'react';
import { AnimationDrawer } from './AnimationDrawer';
import * as d3 from 'd3';

interface Props {
  animationDrawer: AnimationDrawer;
}

interface State {}

function getRectPerimeterById(id: string) {
  const ele = d3.select('#' + id).select('rect')['_groups'][0][0];
  if (ele === null) return 0;
  const width = Number(ele.attributes.width.value);
  const height = Number(ele.attributes.height.value);
  return (width + height) * 2 + 10;
}

export default class AnimationContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  componentDidUpdate() {
    const { animationDrawer } = this.props;
    switch (animationDrawer.getState()) {
      case 'programInit':
        this.programInit();
        break;
      case 'variableInit':
        this.variableInit(animationDrawer.getVariableKey());
    }
  }

  programInit() {
    const perimeter = getRectPerimeterById('main');
    d3.select('#main').style('stroke-dasharray', perimeter);
    d3.select('#main')
      .transition()
      .duration(3000)
      .styleTween('stroke-dashoffset', function () {
        return d3.interpolateNumber(perimeter, 0);
      });
  }

  variableInit(key: string) {
    const perimeter = getRectPerimeterById('main');
    d3.select('#' + key)
      .select('rect')
      .style('stroke-dasharray', perimeter);
    d3.select('#' + key)
      .select('rect')
      .transition()
      .duration(3000)
      .styleTween('stroke-dashoffset', function () {
        return d3.interpolateNumber(perimeter, 0);
      });
  }

  render() {
    return <React.Fragment></React.Fragment>;
  }
}
