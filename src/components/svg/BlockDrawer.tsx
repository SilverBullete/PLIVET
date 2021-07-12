import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import { Vector } from 'vector2d';

export type BlockCellContainer = BlockCell[];
export type BlockTable = BlockCellContainer[];

function getDepth(blockCellContainer: BlockCellContainer): number {
  let res = 0;
  blockCellContainer.forEach((blockCell) => {
    res = Math.max(res, blockCell.getDepth());
  });
  return res;
}

function getCellsByDepth(
  blockCellContainer: BlockCellContainer,
  depth: number
): BlockCellContainer {
  const res = [];
  blockCellContainer.forEach((blockCell) => {
    if (blockCell.getDepth() === depth) {
      res.push(blockCell);
    }
  });
  return res;
}

export class BlockDrawer {
  private blockStacks: BlockStack[] = [];
  private blockArrows: BlockArrow[] = [];
  private execState: ExecState | null = null;
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') return;
    this.execState = execState;
    this.update();
    this.calcPos();
  }

  private update() {
    if (this.execState === null) return;
    const stacks = this.execState.getStacks();
    stacks.forEach((stack) => {
      if (stack.name !== 'GLOBAL') {
        const blockStack = new BlockStack(stack);
        this.blockStacks.push(blockStack);
      }
    });
  }

  private calcPos() {
    const originX = 50;
    const originY = 50;
    const offsetX = 40;
    const offsetY = 40;
    let index = 0;
    this.blockStacks.forEach((blockStack) => {
      const x = originX + offsetX * index;
      const y = originY + offsetY * index;
      this.calcStackPos(x, y, blockStack);
      ++index;
    });
  }

  private calcStackPos(x: number, y: number, blockStack: BlockStack) {
    blockStack.setPos(x, y);
    const offsetX = 20;
    const offsetY = 40;
    const originX = x + offsetX;
    const originY = y + 20;
    let row = 1;
    let count = 0;
    const blockTable = blockStack.getBlockTable();
    blockTable.forEach((blockCellContainer) => {
      // const len = Math.max(getCellsByDepth(blockCellContainer, 1).length, 1);
      const len = 1;
      if (count + len > 3) {
        row++;
        count = 0;
      }
      const _x = originX + (offsetX + BlockCell.WIDTH) * count + offsetX;
      const _y =
        originY + (offsetY + BlockCell.HEIGHT) * row - BlockCell.HEIGHT;
      this.calcVariablePos(_x, _y, blockCellContainer);
      count += len;
    });
    blockStack.setHeight((BlockCell.HEIGHT + offsetY) * row + offsetY * 3);
    blockStack.setWidth((BlockCell.WIDTH + offsetX) * 3 + offsetX * 2);
  }

  private calcVariablePos(
    x: number,
    y: number,
    blockCellContainer: BlockCellContainer
  ) {
    const offsetX = 20 + BlockCell.WIDTH;
    blockCellContainer[0].setPos(x, y);
  }

  // private calcVariablePos(
  //   x: number,
  //   y: number,
  //   blockCellContainer: BlockCellContainer
  // ) {
  //   const offsetX = 20 + BlockCell.WIDTH;
  //   if (blockCellContainer.length === 1) {
  //     blockCellContainer[0].setPos(x, y);
  //   } else {
  //     blockCellContainer[0].setPos(x - 10, y - 10);
  //     blockCellContainer[0].setWidth(
  //       offsetX * Math.min(getCellsByDepth(blockCellContainer, 1).length, 3)
  //     );
  //     blockCellContainer[0].setHeight(BlockCell.HEIGHT + 20);
  //     const depth = getDepth(blockCellContainer);
  //     for (let i = 1; i <= depth; i++) {
  //       const blockCells = getCellsByDepth(blockCellContainer, i);
  //       blockCells.forEach((blockCell) => {});
  //     }
  //   }
  // }

  public getBlockStacks() {
    return this.blockStacks;
  }
}

export class BlockStack {
  public readonly key: string;
  private pos: Vector = new Vector(0, 0);
  private blockTable: BlockTable;
  private stack: Stack;
  private width: number;
  private height: number;

  constructor(stack: Stack) {
    this.stack = stack;
    this.blockTable = this.makeBlockTable();
    this.key = stack.name;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public setWidth(width: number) {
    this.width = width;
  }

  public setHeight(height: number) {
    this.height = height;
  }

  private makeBlockTable(): BlockTable {
    const blockTable: BlockTable = [];
    const variables = this.stack.getVariables();
    const stackName = this.stack.name;
    variables.forEach((variable) => {
      const value = variable.getValue();
      const isArrayVariable = Array.isArray(value);
      const blockVariable = isArrayVariable
        ? new BlockArrayVariable(variable, stackName)
        : new BlockVariable(variable, stackName);
      const cellss = blockVariable.getBlockCellContainer();
      blockTable.push(cellss);
    });
    return blockTable;
  }

  public getBlockTable() {
    return this.blockTable;
  }

  public x() {
    return this.pos.getX();
  }

  public y() {
    return this.pos.getY();
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }
}

export class BlockArrow {
  constructor(parameters) {}
}

export class BlockVariable {
  public readonly key: string;
  protected blockCellContainer: BlockCellContainer = [];
  protected readonly variable: Variable;
  protected readonly stackName: string;
  constructor(variable: Variable, stackName: string) {
    this.variable = variable;
    this.stackName = stackName;
    this.key = `${stackName}-${variable.name}`;
    this.key = this.key.replace(/[&\|\\\*:^%$@()\[\]]/g, '_');
    this.init();
  }

  protected init() {
    const { type, name, address } = this.variable;
    const cell = this.pushCell(name, this.variable.getValue());
    cell.setType(type);
    cell.setAddress(address);
  }

  protected pushCell(name: string, value: any): BlockCell {
    const cell = new BlockCell(name, this.key, value);
    this.blockCellContainer.push(cell);
    return cell;
  }

  public getBlockCellContainer(): BlockCellContainer {
    return this.blockCellContainer;
  }
}

export class BlockArrayVariable extends BlockVariable {
  constructor(variable: Variable, stackName: string) {
    super(variable, stackName);
  }

  public getBlockCellContainer(): BlockCellContainer {
    const children: BlockCellContainer = [];
    const value: Variable[] = this.variable.getValue();
    for (const v of value) {
      const blockVariable = Array.isArray(v.getValue())
        ? new BlockArrayVariable(v, this.stackName)
        : new BlockVariable(v, this.stackName);
      const table = blockVariable.getBlockCellContainer();
      children.push(...table);
    }
    return this.blockCellContainer.concat(children);
  }
}

export class BlockCell {
  public static readonly FONT_SIZE: number = 20;
  public static readonly HEIGHT: number = 50;
  public static readonly WIDTH: number = 150;
  private address: number;
  public readonly key: string;
  private type: string;
  private name: string;
  private pos: Vector = new Vector(-1, -1);
  private value: any;
  private depth: number = 0;
  private width: number = BlockCell.WIDTH;
  private height: number = BlockCell.HEIGHT;
  constructor(name: string, parentKey: string, value: any) {
    this.name = name;
    this.key = parentKey;
    this.key = this.key.replace(/[&\|\\\*:^%$@()\[\]]/g, '_');
    this.value = value;
    this.depth = this.name.split('[').length - 1;
  }

  public setAddress(address: number) {
    this.address = address;
  }

  public setType(type: string) {
    this.type = type;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public setWidth(width: number) {
    this.width = width;
  }

  public setHeight(height: number) {
    this.height = height;
  }

  public getAddress() {
    return this.address;
  }

  public getType() {
    return this.type;
  }

  public getName() {
    return this.name;
  }

  public x() {
    return this.pos.getX();
  }

  public y() {
    return this.pos.getY();
  }

  public getValue() {
    if (this.type.split('[').length > 1) return '';
    return this.value;
  }

  public getDepth() {
    return this.depth;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }
}
