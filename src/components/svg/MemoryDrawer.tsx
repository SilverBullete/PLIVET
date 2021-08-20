import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { Vector } from 'vector2d';
import typeToHeight from './MemoryHeight';
import * as d3 from 'd3';
import colors from '../Color';

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

function str_pad(hex) {
  let zero = '0000';
  let tmp = 4 - hex.length;
  return '0x' + zero.substr(0, tmp) + hex;
}

export class MemoryDrawer {
  private svgStackTable: any = {};
  private execState: ExecState | null = null;
  private width: number = 120;
  private getTypedef: (type: string) => string;
  private originX = 20;
  private originY = 20;
  private offsetX = 60;
  private offsetY = 25;

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
        this.svgStackTable[stack.name] = svgMemory.getSvgMemoryTable();
      }
    });
  }

  private calc() {
    let y = this.originY;
    Object.keys(this.svgStackTable).forEach((key, idx) => {
      y += this.offsetY;
      this.svgStackTable[key].forEach((cell, i) => {
        cell.setPos(this.originX + this.offsetX, y);
        y += cell.getHeight();
      });
    });
  }

  public getWidth() {
    return this.width;
  }

  public getSvgStackTable() {
    return this.svgStackTable;
  }

  public x() {
    return this.originX;
  }

  public y() {
    return this.originY;
  }

  public getOffsetX() {
    return this.offsetX;
  }

  public getOffsetY() {
    return this.offsetY;
  }
}

export class SvgMemory {
  private svgMemoryTable: any;

  constructor(
    private readonly stack: Stack,
    private readonly getTypedef: (type: string) => string,
    private readonly color: string
  ) {
    this.svgMemoryTable = this.makeSvgMemoryTable();
  }

  private makeSvgMemoryTable(): any {
    const svgMemoryTable: any = [];
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
  protected svgMemoryTable: any = [];
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
    cell.setValue(variable.getValue());
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
    cell.setValue(variable.getValue());
    cell.setHeight(typeToHeight(type));
  }

  public getSvgMemoryTable(): any {
    const children: any = [];
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
  private value: any;

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

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
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
    if (this.name.split('[').length > 1) {
      this.height = 20;
    } else {
      this.height = 40;
    }
  }

  public getValue() {
    if (this.type.split('[').length > 1) {
      return str_pad(this.address.toString(16));
    }
    if (this.type.split('*').length > 1) {
      return str_pad(this.value.toString(16));
    }
    return this.value.toString();
  }

  public setValue(value: any) {
    this.value = value;
  }

  public getColor() {
    return this.color;
  }

  public setColor(color: string) {
    this.color = color;
  }
}
