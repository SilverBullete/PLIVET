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

export function str_pad(hex) {
  let zero = '0000';
  let tmp = 4 - hex.length;
  return '0x' + zero.substr(0, tmp) + hex;
}

export class MemoryDrawer {
  private svgStackTable: any = {};
  private svgHeapTable: any = { heap: [], global: [] };
  private physicalTable: any = { data: [] };
  private arrowList: any = [];
  private variableDic: any = {};
  private execState: ExecState | null = null;
  private width: number = 120;
  private originX = 15;
  private originY = 20;
  private offsetX = 60;
  private offsetY = 25;

  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') {
      return;
    }
    this.execState = execState;
    this.update();
    this.calc();
    this.makePhysicalTable();
    this.makeArrowList();
  }

  private update() {
    if (this.execState === null) {
      return;
    }
    const stacks = this.execState.getStacks();
    stacks.forEach((stack) => {
      if (stack.name !== 'GLOBAL') {
        const svgMemory = new SvgMemory(stack);
        this.svgStackTable[
          stack.name.replace('.', '_')
        ] = svgMemory.getSvgMemoryTable();
      } else {
        const variables = stack.getVariables();
        variables.forEach((variable) => {
          if (variable.address >= 50000) {
            const value = variable.getValue();
            const isArrayVariable = Array.isArray(value);
            const svgMemoryVariable = isArrayVariable
              ? new SvgMemoryArrayVariable(variable, 'global')
              : new SvgMemoryVariable(variable, 'global');
            const cellss = svgMemoryVariable.getSvgMemoryTable();
            this.svgHeapTable['global'].push(...cellss);
          } else if (variable.address >= 20000) {
            const value = variable.getValue();
            const isArrayVariable = Array.isArray(value);
            const svgMemoryVariable = isArrayVariable
              ? new SvgMemoryArrayVariable(variable, 'heap')
              : new SvgMemoryVariable(variable, 'heap');
            const cellss = svgMemoryVariable.getSvgMemoryTable();
            this.svgHeapTable['heap'].push(...cellss);
          }
        });
      }
    });
  }

  private calc() {
    let y = this.originY;
    Object.keys(this.svgStackTable).forEach((key) => {
      y += this.offsetY;
      this.svgStackTable[key].forEach((cell) => {
        cell.setPos(this.originX + this.offsetX, y);
        y += cell.getHeight();
      });
    });
    y = this.originY;
    Object.keys(this.svgHeapTable).forEach((key) => {
      y += this.offsetY;
      this.svgHeapTable[key].forEach((cell) => {
        cell.setPos((this.originX + this.offsetX) * 2 + this.width, y);
        y += cell.getHeight();
      });
      y += this.offsetY;
    });
  }

  private makePhysicalTable() {
    let data = [];
    let point = 0;
    this.svgHeapTable['heap'].forEach((cell) => {
      if (cell.getAddress() - point > 3) {
        data.push('...');
      }
      data.push(cell);
      this.variableDic[cell.getAddress()] =
        'heap-' + cell.getName().replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
      point = cell.getAddress() + typeToHeight(cell.getType()) - 1;
    });
    this.svgHeapTable['global'].forEach((cell) => {
      if (cell.getAddress() - point > 3) {
        data.push('...');
      }
      data.push(cell);
      this.variableDic[cell.getAddress()] =
        'global-' + cell.getName().replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
      point = cell.getAddress() + typeToHeight(cell.getType()) - 1;
    });
    Object.keys(this.svgStackTable).forEach((key) => {
      this.svgStackTable[key].forEach((cell) => {
        if (cell.getAddress() - point > 3) {
          data.push('...');
        }
        data.push(cell);
        this.variableDic[cell.getAddress()] = (
          cell.getStackName() +
          '-' +
          cell.getName()
        ).replace(/[&\|\\\*:^%$@()\[\].]/g, '_');
        point = cell.getAddress() + typeToHeight(cell.getType()) - 1;
      });
    });
    data.push('...');
    this.physicalTable['data'] = data;
  }

  private makeArrowList() {
    const arrowList = [];
    const data = this.physicalTable['data'];
    data.forEach((cell) => {
      if (cell !== '...') {
        if (
          cell.getType().split('[').length > 1 ||
          cell.getType().split('*').length > 1
        ) {
          arrowList.push({
            from: (cell.getStackName() + '-' + cell.getName()).replace(
              /[&\|\\\*:^%$@()\[\].]/g,
              '_'
            ),
            to: this.variableDic[Number(cell.getValue())],
          });
        }
      }
    });
    this.arrowList = arrowList;
  }

  public getWidth() {
    return this.width;
  }

  public getSvgStackTable() {
    return this.svgStackTable;
  }

  public getSvgHeapTable() {
    return this.svgHeapTable;
  }

  public getPhysicalTable() {
    return this.physicalTable;
  }

  public getArrowList() {
    return this.arrowList;
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

  constructor(private readonly stack: Stack) {
    this.svgMemoryTable = this.makeSvgMemoryTable();
  }

  private makeSvgMemoryTable(): any {
    const svgMemoryTable: any = [];
    const variables = this.stack.getVariables();
    const stackName = this.stack.name;
    for (const variable of variables) {
      const value = variable.getValue();
      const isArrayVariable = Array.isArray(value);
      const svgMemoryVariable = isArrayVariable
        ? new SvgMemoryArrayVariable(variable, stackName)
        : new SvgMemoryVariable(variable, stackName);
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
    protected readonly stackName: string
  ) {
    this.key = `${this.stackName}-${variable.name}`;
    this.key = this.key.replace(/[&\|\\\*:^%$@()\[\]]/g, '');
    this.init(variable);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const cell = this.pushCell(name);
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
  constructor(variable: Variable, stackName: string) {
    super(variable, stackName);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const cell = this.pushCell(name);
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
        ? new SvgMemoryArrayVariable(v, this.stackName)
        : new SvgMemoryVariable(v, this.stackName);
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

  public setName(name: string) {
    this.name = name;
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
    // if (this.name.split('[').length > 1) {
    //   this.height = 20;
    // } else {
    this.height = 40;
    // }
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
