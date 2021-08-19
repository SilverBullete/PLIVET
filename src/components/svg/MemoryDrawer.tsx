import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { Vector } from 'vector2d';
import typeToHeight from './MemoryHeight';
import * as d3 from 'd3';
import colors from '../Color';

export type SvgMemoryTable = SvgMemoryCell[];

function getWidth(str: string, fontSize: number) {
  if (str.length === 0) return 0;
  let text = d3
    .select('#svg')
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('font-size', fontSize)
    .text(str);
  let res = text['_groups'][0][0].getEndPositionOfChar(str.length - 1).x + 20;
  text.remove();
  return res;
}

export class MemoryDrawer {
  private svgMemoryTable: SvgMemoryTable = [];
  private execState: ExecState | null = null;
  private minAddress: number;
  private maxAddress: number;
  private width: number;
  private x: number;
  private y: number;
  private getTypedef: (type: string) => string;
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') {
      this.getTypedef = (type: string) => type;
      return;
    }
    this.execState = execState;
    this.update();
    this.calc();
  }

  private update() {
    if (this.execState === null) {
      return;
    }
    const stacks = this.execState.getStacks();
    stacks.forEach((stack, i) => {
      if (stack.name !== 'GLOBAL') {
        const svgMemory = new SvgMemory(stack, this.getTypedef, colors[i - 1]);
        this.svgMemoryTable.push(...svgMemory.getSvgMemoryTable());
      }
    });
  }

  private calc() {
    const minAddresses = [];
    const maxAddresses = [];
    const widths = [];
    this.svgMemoryTable.forEach((cell) => {
      if (cell.getAddress() > 50000) {
        minAddresses.push(cell.getAddress());
        maxAddresses.push(cell.getAddress() + cell.getHeight() - 1);
        widths.push(cell.getWidth());
      }
    });
    let min = 99999999;
    let max = 0;
    let maxw = 0;
    minAddresses.forEach((addr) => {
      min = Math.min(min, addr);
    });
    maxAddresses.forEach((addr) => {
      max = Math.max(max, addr);
    });
    widths.forEach((w) => {
      maxw = Math.max(maxw, w);
    });
    this.minAddress = min;
    this.maxAddress = max;
    this.width = maxw;
  }

  public getMinAddress() {
    return this.minAddress;
  }

  public getMaxAddress() {
    return this.maxAddress;
  }

  public getWidth() {
    return this.width;
  }

  public getSvgMemoryTable() {
    return this.svgMemoryTable;
  }
}

export class SvgMemory {
  private svgMemoryTable: SvgMemoryTable;

  constructor(
    private readonly stack: Stack,
    private readonly getTypedef: (type: string) => string,
    private readonly color: string
  ) {
    this.svgMemoryTable = this.makeSvgMemoryTable();
  }

  private makeSvgMemoryTable(): SvgMemoryTable {
    const svgMemoryTable: SvgMemoryTable = [];
    const variables = this.stack.getVariables();
    const stackName = this.stack.name;
    const color = this.color;
    for (const variable of variables) {
      const value = variable.getValue();
      const isArrayVariable = Array.isArray(value);
      const svgMemoryVariable = isArrayVariable
        ? new SvgMemoryArrayVariable(variable, stackName, color)
        : new SvgMemoryVariable(variable, stackName, color);
      const cellss = svgMemoryVariable.getSvgMemoryTable();
      svgMemoryTable.push(...cellss);
    }
    return svgMemoryTable;
  }

  public getSvgMemoryTable() {
    return this.svgMemoryTable;
  }
}

export class SvgMemoryVariable {
  public readonly key: string;
  protected svgMemoryTable: SvgMemoryTable = [];
  constructor(
    protected readonly variable: Variable,
    protected readonly stackName: string,
    protected readonly color: string
  ) {
    this.key = `${this.stackName}-${variable.name}`;
    this.key = this.key.replace(/[&\|\\\*:^%$@()\[\]]/g, '');
    this.init(variable);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const cell = this.pushCell(name);
    cell.setColor(this.color);
    cell.setAddress(address);
    cell.setType(type);
    cell.setHeight(typeToHeight(type));
  }

  public getSvgMemoryTable(): SvgMemoryCell[] {
    return this.svgMemoryTable;
  }

  protected pushCell(name: string) {
    const cell = new SvgMemoryCell(name, this.key, this.stackName);
    this.svgMemoryTable.push(cell);
    return cell;
  }
}

export class SvgMemoryArrayVariable extends SvgMemoryVariable {
  constructor(variable: Variable, stackName: string, color: string) {
    super(variable, stackName, color);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const cell = this.pushCell(name);
    cell.setColor(this.color);
    cell.setAddress(address);
    cell.setType(type);
    cell.setHeight(typeToHeight(type));
  }

  public getSvgMemoryTable(): SvgMemoryTable {
    const children: SvgMemoryTable = [];
    const value: Variable[] = this.variable.getValue();
    for (const v of value) {
      const svgMemoryVariable = Array.isArray(v.getValue())
        ? new SvgMemoryArrayVariable(v, this.stackName, this.color)
        : new SvgMemoryVariable(v, this.stackName, this.color);
      const table = svgMemoryVariable.getSvgMemoryTable();
      children.push(...table);
    }
    return this.svgMemoryTable.concat(children);
  }
}

export class SvgMemoryCell {
  public static readonly HEIGHT: number = 20;
  private address: number;
  private readonly key: string;
  private type: string;
  private name: string;
  private stackName: string;
  private pos: Vector = new Vector(-1, -1);
  private width: number;
  private height: number;
  private color: string;

  constructor(private text: string, key: string, stackName: string) {
    this.key = key;
    this.key = this.key.replace(/[&\|\\\*:^%$@()\[\]]/g, '');
    this.name = text;
    this.stackName = stackName;
    this.width = getWidth(stackName + '_' + text, 15);
  }

  public getAddress() {
    return this.address;
  }

  public setAddress(address: number) {
    this.address = address;
  }

  public getKey() {
    return this.key;
  }

  public x() {
    return this.pos.getX();
  }

  public y() {
    return this.pos.getY();
  }

  public getName() {
    return this.name;
  }

  public getType() {
    return this.type;
  }

  public setType(type: string) {
    this.type = type;
  }

  public getWidth() {
    return this.width;
  }

  public getStackName() {
    return this.stackName;
  }

  public setStackName(stackName: string) {
    this.stackName = stackName;
  }

  public getHeight() {
    return this.height;
  }

  public setHeight(height: number) {
    this.height = height;
  }

  public getColor() {
    return this.color;
  }

  public setColor(color: string) {
    this.color = color;
  }
}
