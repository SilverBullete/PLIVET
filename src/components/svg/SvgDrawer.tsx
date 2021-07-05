import { Variable } from 'unicoen.ts/dist/interpreter/Engine/Variable';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Engine/Stack';
import { Vector } from 'vector2d';
import { signal } from '../emitter';
import Hashids from 'hashids/cjs';
import stringHash from 'string-hash';
import * as d3 from 'd3';

export type SvgRow = SvgCell[];
export type SvgTable = SvgRow[];

function sum(arr, len) {
  let s = 0;
  for (let i = 0; i < len; i++) {
    s += arr[i];
  }
  return s;
}

const hashids = new Hashids('', 6, '1234567890abcdef'); // all lowercase
class Connection {
  public readonly color: string;
  public isDrawn: boolean = false;
  constructor(public readonly fromKey: string, public readonly toKey: string) {
    const hashFrom = stringHash(fromKey);
    const hashTo = stringHash(toKey);
    const hashNumber = hashids.encode(hashFrom, hashTo);
    this.color = `#${hashNumber.substr(0, 6)}`;
  }
}

export class SvgArrow {
  public readonly key: string;
  public readonly from: Vector;
  public readonly to: Vector;
  public readonly mid: Vector;
  constructor(from: Vector, to: Vector, public readonly color: string) {
    const halfHeight = SvgCell.HEIGHT / 2;
    this.from = this.clone(from).add(new Vector(-5, halfHeight));
    this.to = this.clone(to).add(new Vector(5, halfHeight));
    this.mid = this.calcMidPos(this.clone(from), this.clone(to));
    this.key = [this.from, this.to, this.mid].toString();
  }

  private calcMidPos(from: Vector, to: Vector): Vector {
    const isDownArrow = from.y < to.y;
    const mid = from.add(to).divS(2);
    const dir = to.subtract(from);
    const length = dir.length();
    dir.normalise().rotate(isDownArrow ? 90 : -90);
    const midPos = mid.add(dir.mulS(length / 4));
    return midPos;
  }
  private clone = (v: Vector) => new Vector(v.x, v.y);
}

class PointerConnectionManager {
  constructor() {
    this.reset();
  }
  public reset() {
    this.allAddressList.clear();
    this.ptrAddressList.clear();
    this.resetPosList();
  }

  public resetPosList() {
    this.connetionList = [];
    this.fromCellPosList.clear();
    this.toCellPosList.clear();
  }

  public addVariableAddr(address: number, id: string) {
    this.allAddressList.set(address, id);
  }

  public addPtrVariable(address: number, id: string) {
    if (!this.ptrAddressList.has(address)) {
      this.ptrAddressList.set(address, []);
    }
    const pair = this.ptrAddressList.get(address);
    if (pair !== undefined) {
      pair.push(id);
    }
  }

  public makeConnection() {
    for (const [ptrAddress, fromKeys] of this.ptrAddressList.entries()) {
      for (const [address, toKey] of this.allAddressList) {
        if (ptrAddress === address) {
          for (const fromKey of fromKeys) {
            this.connetionList.push(new Connection(fromKey, toKey));
          }
        }
      }
    }
  }

  public addPos(key: string, svgCell: SvgCell) {
    for (const connection of this.connetionList) {
      if (key === connection.fromKey) {
        this.fromCellPosList.set(key, svgCell);
      }
      if (key === connection.toKey) {
        this.toCellPosList.set(key, svgCell);
      }
    }
  }

  public makeSvgArrows(): SvgArrow[] {
    const list: SvgArrow[] = [];
    for (const connection of this.connetionList) {
      const { fromKey, toKey, color } = connection;
      const fromCell = this.fromCellPosList.get(fromKey);
      if (fromCell === undefined) {
        continue;
      }
      const toCell = this.toCellPosList.get(toKey);
      if (toCell === undefined) {
        continue;
      }
      const fromPos = new Vector(fromCell.x() + fromCell.width, fromCell.y());
      const svgArrow = new SvgArrow(fromPos, toCell.getPos(), color);
      list.push(svgArrow);

      fromCell.setColor(color);
      toCell.setColor(color);
    }
    return list;
  }

  // 全ての変数のアドレスとそのセルのUUIDのリスト
  private allAddressList = new Map<number, string>();
  // ポインタ変数(fromになる変数)のアドレスとそのセルのUUIDのリスト
  private ptrAddressList = new Map<number, string[]>();
  // { fromのUUID, toのUUID, 色, 描画済みか}のリスト
  private connetionList: Connection[] = [];
  // fromの座標リスト
  private fromCellPosList = new Map<string, SvgCell>();
  // toの座標リスト
  private toCellPosList = new Map<string, SvgCell>();
}

const pointerConnectionManager = new PointerConnectionManager();

export class SvgDrawer {
  private svgStacks: SvgStack[] = [];
  private svgArrows: SvgArrow[] = [];
  private execState: ExecState | null = null;
  private getTypedef: (type: string) => string;
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') {
      this.getTypedef = (type: string) => type;
      return;
    }
    this.execState = execState;
    this.getTypedef = execState.getTypedef.bind(execState);
    pointerConnectionManager.reset();
    this.updateStack();
    this.updateConnection();
  }

  private updateStack() {
    // Stacksの作成
    if (this.execState === null) {
      return;
    }
    const stacks = this.execState.getStacks();
    for (const stack of stacks) {
      const svgStack = new SvgStack(stack, this.getTypedef);
      if (!svgStack.isEmpty()) {
        this.svgStacks.push(svgStack);
      }
    }
  }

  private updateConnection() {
    // ポインタの接続の作成
    pointerConnectionManager.makeConnection();

    // 各Cellの具体的な座標の計算と設定,
    // 同時にConnectionに含まれるuuidなら座標の登録
    this.calcPos();

    // Connectionリストと座標リストを用いてArrowsの作成
    this.svgArrows = pointerConnectionManager.makeSvgArrows();
  }

  public updatePos() {
    pointerConnectionManager.resetPosList();
    this.updateConnection();
  }

  public getSvgStacks(): SvgStack[] {
    return this.svgStacks;
  }

  public getSvgArrows(): SvgArrow[] {
    return this.svgArrows;
  }

  private calcPos() {
    const originX = 50;
    const originY = 50;
    const offsetX = 10;
    const offsetY = 10;
    let index = 0;
    let sumOfHeight = 0;
    for (const svgStack of this.svgStacks) {
      const height = svgStack.height();
      const x = originX + offsetX * index;
      const y = originY + sumOfHeight;
      this.calcStackPos(x, y, svgStack);
      sumOfHeight += height + offsetY;
      ++index;
    }
  }

  private calcStackPos(x: number, y: number, svgStack: SvgStack) {
    svgStack.setPos(x, y);
    const offsetY = SvgCell.HEIGHT;
    // stack名のヘッダ部分の高さを考慮する
    y += offsetY;
    let index = 0;
    const svgTable = svgStack.getSvgTable();
    for (const svgRow of svgTable) {
      if (!svgRow[0].isVisible) {
        continue;
      }
      const offset = offsetY * index;
      this.calcVariablePos(x, y + offset, svgRow);
      ++index;
    }
  }

  private calcVariablePos(x: number, y: number, svgRow: SvgRow) {
    let left = 0;
    for (const cell of svgRow) {
      const { width, key } = cell;
      cell.setPos(x + left, y);
      cell.clearColor();
      if (cell.isVisible) {
        left += width;
        pointerConnectionManager.addPos(key, cell);
      }
    }
  }
}

export class SvgStack {
  public readonly key: string;
  private numOfCol: number = 0;
  private pos: Vector = new Vector(-1, -1);
  private svgTable: SvgTable;
  private widths: number[];
  private margin: number;
  private hasArry: boolean;
  constructor(
    private readonly stack: Stack,
    private readonly getTypedef: (type: string) => string
  ) {
    this.svgTable = this.makeSvgTable();
    if (2 <= this.svgTable.length) {
      this.pushbackEmptyCell(this.svgTable);
      this.alignToMaximumWidth(this.svgTable);
    }
    if (1 <= this.svgTable.length) {
      this.rescaleWidthForLongFuncName();
    }
    this.key = stack.name;
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

  public isEmpty() {
    return this.svgTable.length <= 0;
  }

  public getSvgTable() {
    return this.svgTable;
  }

  public getWidths() {
    return this.widths;
  }

  public name() {
    return this.stack.name;
  }

  public height() {
    if (this.svgTable.length <= 0) {
      return 0;
    }
    // Stack名など表示するheader1行分の高さ
    const numOfVisible = this.svgTable.reduce(
      (h: number, row: SvgRow) => (h += row[0].isVisible ? 1 : 0),
      0
    );
    const height = (numOfVisible + 1) * SvgCell.HEIGHT;
    return height;
  }

  public width() {
    if (this.svgTable.length <= 0) {
      return 0;
    }
    let titleWidth = this.getTitleWidth();
    let widths = this.getWidths();
    const width =
      Math.max(titleWidth, sum(widths, widths.length)) +
      this.margin * widths.length;
    return width;
  }

  public getTitleWidth() {
    let title = this.name();
    let text = d3
      .select('#svg')
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', 20)
      .text(title);
    let res =
      text['_groups'][0][0].getEndPositionOfChar(title.length - 1).x + 20;
    text.remove();
    return res;
  }

  private makeSvgTable(): SvgTable {
    const temp_svgTable: SvgTable = [];
    const svgTable: SvgTable = [];
    const variables = this.stack.getVariables();
    const stackName = this.stack.name;
    for (const variable of variables) {
      const value = variable.getValue();
      const isArrayVariable = Array.isArray(value);
      if (isArrayVariable) this.hasArry = true;
      const svgVariable = isArrayVariable
        ? new SvgArrayVariable(variable, stackName, this.getTypedef)
        : new SvgVariable(variable, stackName, this.getTypedef);
      const cellss = svgVariable.getSvgTable();
      temp_svgTable.push(...cellss);
    }
    if (temp_svgTable.length == 0) {
      return temp_svgTable;
    }
    let len = this.hasArry ? 5 : 4;
    let res = [...Array(len).fill(0)];
    console.log(temp_svgTable);

    temp_svgTable.forEach((row) => {
      row.forEach((cell, index) => {
        if (cell.getText().length > 0) {
          let text = d3
            .select('body')
            .append('svg')
            .append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('font-size', 20)
            .text(cell.getText());
          res[index] = Math.max(
            text['_groups'][0][0].getEndPositionOfChar(
              cell.getText().length - 1
            ).x + 20,
            res[index]
          );
          text.remove();
        }
      });
    });
    this.widths = res;
    let widthSum = sum(res, res.length);
    this.margin =
      widthSum < this.getTitleWidth()
        ? (this.getTitleWidth() - widthSum) / res.length + 5
        : 5;
    temp_svgTable.forEach((row) => {
      row.forEach((cell, index) => {
        cell.setWidth(res[index] + this.margin);
        cell.setMargin(this.margin, 5 + SvgCell.FONT_SIZE);
      });
    });
    temp_svgTable.forEach((row) => {
      svgTable.push(row);
    });
    return svgTable;
  }
  private pushbackEmptyCell(svgTable: SvgTable) {
    this.numOfCol = Math.max(...svgTable.map((row: SvgRow) => row.length));
    for (const row of svgTable) {
      const emptyCells = new Array(this.numOfCol - row.length);
      for (let i = 0; i < emptyCells.length; ++i) {
        emptyCells[i] = new SvgCell('', `${this.key}-empty-${i}`);
      }
      row.push(...emptyCells);
    }
  }
  private alignToMaximumWidth(svgTable: SvgTable) {
    const widths: number[] = new Array(this.numOfCol);
    widths.fill(0);
    for (const row of svgTable) {
      for (let i = 0; i < row.length; ++i) {
        if (widths[i] < row[i].width) {
          widths[i] = row[i].width;
        }
      }
    }
    for (const row of svgTable) {
      for (let i = 0; i < row.length; ++i) {
        row[i].width = widths[i];
      }
    }
  }
  private rescaleWidthForLongFuncName() {
    const nameWidth = ((this.stack.name.length + 3) * SvgCell.FONT_SIZE) / 2;
    while (this.width() < nameWidth) {
      const scale = nameWidth / this.width();
      for (const row of this.svgTable) {
        for (let i = 0; i < row.length; ++i) {
          row[i].width *= scale;
        }
      }
    }
  }
}

export class SvgVariable {
  public readonly key: string;
  public static readonly NUM_OF_COL = 4;
  protected svgCells: SvgCell[] = [];
  constructor(
    protected readonly variable: Variable,
    private readonly parentName: string,
    protected readonly getTypedef: (type: string) => string
  ) {
    this.key = `${this.parentName}-${variable.name}`;
    this.init(variable);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const value = variable.getValue();
    let valueStr = value.toString();

    const rawType = this.getTypedef(type);
    if (rawType.indexOf('*') !== -1 && value != null) {
      valueStr = '0x' + value.toString(16).toUpperCase();
    }
    if (rawType === 'char' && value != null) {
      valueStr += ` '${String.fromCharCode(valueStr)}'`;
    }

    const addressStr = `&${name}(0x${address.toString(16).toUpperCase()}) `;
    this.pushCell(type);
    this.pushCell(name);
    const valueCell = this.pushCell(valueStr);
    const addrCell = this.pushCell(addressStr.replace(/(\s*$)/g, ''));
    if (this.isTypePtr()) {
      // valueはアドレス値
      pointerConnectionManager.addPtrVariable(value, valueCell.key);
    }
    pointerConnectionManager.addVariableAddr(address, addrCell.key);
  }

  protected isTypePtr(): boolean {
    const type = this.variable.type;
    const rawType = this.getTypedef(type);
    const isTypePtr = rawType.indexOf('*') !== -1;
    return isTypePtr;
  }

  public getSvgTable(): SvgTable {
    return [this.svgCells];
  }

  protected pushCell(text: string) {
    const cell = new SvgCell(text, this.key);
    this.svgCells.push(cell);
    return cell;
  }
}

export class SvgArrayVariable extends SvgVariable {
  constructor(
    variable: Variable,
    parentName: string,
    getTypedef: (type: string) => string
  ) {
    super(variable, parentName, getTypedef);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const valueStr = '0x' + address.toString(16).toUpperCase();
    const addressStr = `&${name}(SYSTEM)`;
    this.pushCell(type);
    this.pushCell(name);
    const valueCell = this.pushCell(valueStr);
    this.pushCell(addressStr);
    pointerConnectionManager.addPtrVariable(address, valueCell.key);
  }

  public getSvgTable(): SvgTable {
    let children: SvgTable = [];
    const value: Variable[] = this.variable.getValue();
    for (const v of value) {
      const svgVariable = Array.isArray(v.getValue())
        ? new SvgArrayVariable(v, this.key, this.getTypedef)
        : new SvgVariable(v, this.key, this.getTypedef);
      const table = svgVariable.getSvgTable();
      const shiftedTable = table.map((row, index) =>
        [new SvgCell('', `${this.key}-empty-${index}`)].concat(row)
      );
      children.push(...shiftedTable);
    }
    this.addToFoldCell(children);
    return [this.svgCells].concat(children);
  }

  private addToFoldCell(children: SvgTable) {
    const cellToFold = new SvgCell('▼', '');
    this.svgCells.push(cellToFold);
    cellToFold.setChildren(children);
  }
}

export class SvgCell {
  public width: number;

  public static readonly FONT_SIZE: number = 20;
  public static readonly HEIGHT: number = 33;
  public readonly key: string;
  public isVisible: boolean = true;

  private margin: Vector = new Vector(10, 25);
  private pos: Vector = new Vector(-1, -1);
  private colors: string[] = [];
  private children: SvgTable | null = null;
  constructor(private text: string, parentKey: string) {
    this.key = `${parentKey}-${text}`;
  }

  public setWidth(width: number) {
    this.width = width;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public setMargin(x: number, y: number) {
    this.margin.setAxes(x, y);
  }

  public getPos() {
    return this.pos;
  }

  public x() {
    return this.pos.getX();
  }
  public y() {
    return this.pos.getY();
  }

  public marginX() {
    return this.margin.getX();
  }

  public marginY() {
    return this.margin.getY();
  }

  public clearColor() {
    this.colors = [];
  }

  public setColor(color: string) {
    this.colors.push(color);
  }

  public hasColor() {
    return 0 < this.colors.length;
  }

  public getColors() {
    return this.colors;
  }

  public getText() {
    return `${this.text}`;
  }

  public setChildren(children: SvgTable) {
    this.children = children;
  }

  public canToggleFold() {
    return this.children !== null && 0 < this.children.length;
  }
  public toggleFold() {
    if (this.children !== null) {
      for (const child of this.children) {
        for (const cell of child) {
          cell.isVisible = !cell.isVisible;
        }
      }
    }
    this.text = this.text === '▼' ? '▲' : '▼';
    signal('redraw');
  }
}
