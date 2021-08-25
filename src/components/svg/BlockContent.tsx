import * as React from 'react';
import { BlockDrawer, BlockStack } from './BlockDrawer';
import Block from './Block';
import * as d3 from 'd3';
import { inArray } from 'jquery';

interface Props {
  blockDrawer: BlockDrawer;
}

interface State {
  blockStacks: BlockStack[];
}

function dragged(d: any) {
  const temp = d3.select(this).attr('id').split('_');
  temp.shift();
  const stackName = temp.join('_');
  d3.select(this).attr('transform', function () {
    let source = this.attributes.transform.value.replace(')', '');
    source = source.split(',');
    let tx = d.dx + Number(source[4]);
    let ty = d.dy + Number(source[5]);
    return 'matrix(1,0,0,1,' + tx + ',' + ty + ')';
  });
  d3.select('#svg').select(`#arrow_${stackName}`).remove();
  renderArrow(stackName);
}

function renderArrow(stackName) {
  let source = d3.select('#svg').select(`#stack_${stackName}`);
  let target = d3.select('#svg').select(`#block_${stackName}`);
  let sourceX = Number(source.attr('x')) + 0.73 * Number(source.attr('width'));
  let sourceY = Number(source.attr('y')) + 0.5 * Number(source.attr('height'));
  let transform = target.attr('transform').replace(')', '').split(',');
  target = target.select('rect');
  let targetX = Number(target.attr('x')) + Number(transform[4]);
  let targetY = Number(target.attr('y')) + Number(transform[5]) + 30;
  let temp = sourceX - targetX;
  temp = Math.max(temp, -temp);
  d3.select('#svg')
    .append('path')
    .attr('style', 'stroke:#858585; fill:none; stroke-width:2;')
    .attr('id', `arrow_${stackName}`)
    .attr(
      'd',
      'M' +
        sourceX +
        ',' +
        sourceY +
        ' C' +
        (targetX - temp / 3) +
        ',' +
        sourceY +
        ' ' +
        (sourceX + temp / 3) +
        ',' +
        targetY +
        ' ' +
        targetX +
        ',' +
        targetY
    );
}

export default class BlockContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      blockStacks: props.blockDrawer.getBlockStacks(),
    };
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    props.blockDrawer.getBlockArrows().forEach((name) => {
      if (!arrowList) {
        arrowList = {};
      }
      if (name) {
        arrowList[name] = '';
      }
    });
    sessionStorage.setItem('arrowList', JSON.stringify(arrowList));
  }

  componentWillUpdate(nextProps) {
    // const blockStacks = this.props.blockDrawer.getBlockStacks();
    // const nextBlockStacks = nextProps.blockDrawer.getBlockStacks();
    // const blockStacksLen = blockStacks.length;
    // const nextBlockStacksLen = nextBlockStacks.length;
    // if (blockStacksLen > nextBlockStacksLen) {
    //   for (let i = nextBlockStacksLen; i < blockStacksLen; i++) {
    //     nextProps.blockDrawer.addBlockStack(blockStacks[i]);
    //   }
    // }
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    if (!arrowList) {
      arrowList = {};
    }
    nextProps.blockDrawer.getBlockArrows().forEach((name) => {
      if (inArray(name, Object.keys(arrowList)) >= 0) {
        delete arrowList[name];
        d3.select('#svg')
          .select(`#block_${name}`)
          .attr('transform', 'matrix(1,0,0,1,0,0)');
      }
    });
    sessionStorage.setItem('arrowList', JSON.stringify(arrowList));
  }

  componentDidUpdate(prevProps) {
    d3.select('#svg').selectAll('.block').call(d3.drag().on('drag', dragged));
    d3.select('#svg').selectAll('path').remove();

    const { blockDrawer } = this.props;
    const blockArrows = blockDrawer.getBlockArrows();
    blockArrows.forEach((stackName) => {
      if (!d3.select('#svg').select(`#block_${stackName}`).empty()) {
        renderArrow(stackName);
      }
    });
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    if (!arrowList) {
      arrowList = {};
    }
    Object.keys(arrowList).forEach((stackName) => {
      if (!d3.select('#svg').select(`#block_${stackName}`).empty()) {
        renderArrow(stackName);
      }
    });
  }

  renderBlocks() {
    const { blockDrawer } = this.props;
    const blockStacks = blockDrawer.getBlockStacks();
    const blockArrows = blockDrawer.getBlockArrows();
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    if (!arrowList) {
      arrowList = {};
    }
    const list: JSX.Element[] = [];
    blockStacks.forEach((blockStack) => {
      if (
        inArray(blockStack.getName(), blockArrows) >= 0 ||
        inArray(blockStack.getName(), Object.keys(arrowList)) >= 0
      ) {
        list.push(
          <g>
            <Block key={blockStack.key} blockStack={blockStack} />
          </g>
        );
      }
    });
    // list 顺序 main 为什么在第一个
    return list;
  }

  drawOrRemoveBlock(name) {
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    if (!arrowList) {
      arrowList = {};
    }
    if (inArray(name, Object.keys(arrowList)) < 0) {
      arrowList[name] = '';
    } else {
      delete arrowList[name];
    }
    sessionStorage.setItem('arrowList', JSON.stringify(arrowList));
    this.setState({});
    console.log(sessionStorage.getItem('arrowList'));
  }

  renderStackView() {
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    if (!arrowList) {
      arrowList = {};
    }
    const { blockDrawer } = this.props;
    const blockStacks = blockDrawer.getBlockStacks();
    const blockArrows = blockDrawer.getBlockArrows();
    const list: JSX.Element[] = [];
    let x = 60;
    let y = 50;
    let offsetY = 60;
    let width = 192;
    let height = 108;
    blockStacks.forEach((blockStack, i) => {
      let transformX = 0.36397 * i * offsetY;
      let transform = `matrix(1,0,-0.36397,1,${transformX},0)`;
      list.push(
        <g
          onClick={() => {
            const res = inArray(blockStack.getName(), blockArrows);
            if (res < 0) {
              this.drawOrRemoveBlock(blockStack.getName());
            }
          }}
        >
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            transform={transform}
            fill="white"
            stroke="black"
            strokeWidth={2}
            id={`stack_${blockStack.getName()}`}
          ></rect>
          <text x={x + 10} y={y + 20} fontSize="15">
            {blockStack.getName().split('_')[0]}
          </text>
        </g>
      );
      y = y + offsetY;
    });
    return list;
  }

  render() {
    const stacks = this.renderStackView();
    const blocks = this.renderBlocks();
    return (
      <React.Fragment>
        {stacks}
        {blocks}
      </React.Fragment>
    );
  }
}
