import * as React from 'react';
import { BlockDrawer, BlockStack } from './BlockDrawer';
import Block from './Block';
import * as d3 from 'd3';
import { inArray } from 'jquery';
import { selection } from 'd3-selection';
import selection_appendClone from 'd3-clone/src/clone/append';

selection.prototype.appendClone = selection_appendClone;

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
  renderArrow(stackName, stackName);
}

export function renderArrow(sourceStackName, targetStackName) {
  d3.select('#svg').select(`#arrow_${sourceStackName}`).remove();
  let source = d3
    .select('#svg')
    .select(`#stack_${sourceStackName}`)
    .select('rect');
  let target = d3.select('#svg').select(`#block_${targetStackName}`);
  let sourceX = Number(source.attr('x')) + 0.8 * Number(source.attr('width'));
  let sourceY = Number(source.attr('y')) + 0.2 * Number(source.attr('height'));
  let transform = target.attr('transform').replace(')', '').split(',');
  target = target.select('rect');
  let targetX = Number(target.attr('x')) + Number(transform[4]) - 6;
  let targetY = Number(target.attr('y')) + Number(transform[5]) + 30;
  let temp = sourceX - targetX;
  temp = Math.max(temp, -temp);
  d3.select('#svg')
    .select('#path')
    .append('path')
    .attr('style', 'stroke:#858585; fill:none; stroke-width:2;')
    .attr('id', `arrow_${sourceStackName}`)
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
    )
    .attr('marker-end', 'url(#arrow)');
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
    d3.select('#stack__cloned').remove();
    d3.select('#block__cloned').remove();
    d3.select('#arrow__cloned').remove();
    const blockStacks = this.props.blockDrawer.getBlockStacks();
    const nextBlockStacks = nextProps.blockDrawer.getBlockStacks();

    if (sessionStorage.getItem('exec') !== 'step') {
      const blockStacksLen = blockStacks.length;
      const nextBlockStacksLen = nextBlockStacks.length;
      if (blockStacksLen > nextBlockStacksLen) {
        for (let i = nextBlockStacksLen; i < blockStacksLen; i++) {
          const clonedStack = d3
            .select('#svg')
            .appendClone(
              d3.select('#stack_' + blockStacks[i].key.replace('.', '_'))
            );
          clonedStack.attr('id', 'stack__cloned');
          const clonedBlock = d3
            .select('#svg')
            .appendClone(
              d3.select('#block_' + blockStacks[i].key.replace('.', '_'))
            );
          clonedBlock.select('rect').style('stroke', 'black');
          clonedBlock.select('text').style('fill', 'black');
          clonedBlock.selectAll('rect').attr('y', function () {
            return (
              Number(d3.select(this).attr('y')) +
              blockStacks[i].getHeight() +
              40
            );
          });
          clonedBlock.selectAll('text').attr('y', function () {
            return (
              Number(d3.select(this).attr('y')) +
              blockStacks[i].getHeight() +
              40
            );
          });
          clonedBlock.selectAll('tspan').attr('y', function () {
            return (
              Number(d3.select(this).attr('y')) +
              blockStacks[i].getHeight() +
              40
            );
          });
          const block = d3.select(
            '#block_' + blockStacks[i].key.replace('.', '_')
          );
          clonedBlock.attr('id', 'block__cloned');
          const list = [];
          block.selectAll('g').attr('copy', function () {
            list.push(d3.select(this).attr('id'));
          });
          clonedBlock.selectAll('g').attr('id', function (d, i) {
            return 'cloned-' + list[i];
          });
        }
      } else if (nextBlockStacksLen > blockStacksLen && blockStacksLen >= 2) {
        const clonedBlock = d3
          .select('#svg')
          .appendClone(
            d3.select(
              '#block_' + blockStacks[blockStacksLen - 2].key.replace('.', '_')
            )
          );
        clonedBlock.attr('id', 'block__cloned');
      }
    }
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
        renderArrow(stackName, stackName);
      }
    });
    const arrowListJson = sessionStorage.getItem('arrowList');
    let arrowList = JSON.parse(arrowListJson);
    if (!arrowList) {
      arrowList = {};
    }
    Object.keys(arrowList).forEach((stackName) => {
      if (!d3.select('#svg').select(`#block_${stackName}`).empty()) {
        renderArrow(stackName, stackName);
      }
    });
    const variablesMapJson = sessionStorage.getItem('variablesMap');
    let variablesMap = JSON.parse(variablesMapJson);
    if (!variablesMap) {
      variablesMap = {};
    }
    Object.keys(variablesMap).forEach((key) => {
      if (variablesMap[key]['visible']) {
        const stackName = key.split('_')[0];
        const name = key.split('_')[1];
        const cells = d3
          .select('#svg')
          .selectAll(`.block-${stackName}-${name}`);
        cells.select('rect').style('stroke', variablesMap[key]['color']);
        cells.selectAll('text').attr('fill', variablesMap[key]['color']);
      }
    });
    const activeStack = sessionStorage.getItem('activeStack');
    const blocks = d3.select('#svg').selectAll('.block');
    blocks.select('rect').style('stroke', 'black');
    blocks.select('text').style('fill', 'black');
    const block = d3.select('#svg').select('#block_' + activeStack);
    block.select('rect').style('stroke', '#0074D9');
    block.select('text').style('fill', '#0074D9');
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
          id={`stack_${blockStack.getName()}`}
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
    const { blockDrawer } = this.props;
    const blockArrows = blockDrawer.getBlockArrows();
    blockArrows.forEach((stackName) => {
      if (stackName) {
        sessionStorage.setItem('activeStack', stackName);
      }
    });
    return (
      <React.Fragment>
        {stacks}
        {blocks}
      </React.Fragment>
    );
  }
}
