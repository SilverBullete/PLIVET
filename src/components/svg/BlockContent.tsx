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
    this.state = { blockStacks: null };
  }

  renderBlocks() {
    const { blockDrawer } = this.props;
    const blockStacks = blockDrawer.getBlockStacks();
    const list: JSX.Element[] = [];
    blockStacks.forEach((blockStack) => {
      list.push(<Block blockStack={blockStack} />);
    });
    return list;
  }

  render() {
    const blocks = this.renderBlocks();
    return <React.Fragment>{blocks}</React.Fragment>;
  }
}
