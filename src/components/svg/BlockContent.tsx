import * as React from 'react';
import { BlockDrawer, BlockStack } from './BlockDrawer';
import Block from './Block';

interface Props {
  blockDrawer: BlockDrawer;
}

interface State {
  blockStacks: BlockStack[];
}

export default class BlockContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { blockStacks: props.blockDrawer.getBlockStacks() };
  }

  componentWillUpdate(nextProps) {
    const blockStacks = this.props.blockDrawer.getBlockStacks();
    const nextBlockStacks = nextProps.blockDrawer.getBlockStacks();
    const blockStacksLen = blockStacks.length;
    const nextBlockStacksLen = nextBlockStacks.length;
    if (blockStacksLen > nextBlockStacksLen) {
      for (let i = nextBlockStacksLen; i < blockStacksLen; i++) {
        nextProps.blockDrawer.addBlockStack(blockStacks[i]);
      }
    }
  }

  componentDidUpdate(prevProps) {}

  renderBlocks() {
    const { blockDrawer } = this.props;
    const blockStacks = blockDrawer.getBlockStacks();
    const list: JSX.Element[] = [];
    blockStacks.forEach((blockStack) => {
      list.push(<Block key={blockStack.key} blockStack={blockStack} />);
    });
    return list;
  }

  render() {
    const blocks = this.renderBlocks();
    return <React.Fragment>{blocks}</React.Fragment>;
  }
}
