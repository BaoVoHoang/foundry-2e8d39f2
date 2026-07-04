import { GridState } from '../types/grid';

const CELL_REF_RE = /^[A-J](10|[1-9])$/;

type TokenType = 'number' | 'ref' | 'op' | 'lparen' | 'rparen';

interface Token {
  type: TokenType;
  value: string;
}

class ParseError extends Error {}

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, '');

  while (i < s.length) {
    const ch = s[i];

    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < s.length && /[0-9.]/.test(s[i])) {
        num += s[i];
        i++;
      }
      if (!/^\d+(\.\d+)?$/.test(num)) {
        throw new ParseError('Invalid number');
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    if (/[A-J]/.test(ch)) {
      let ref = '';
      while (i < s.length && /[A-J0-9]/.test(s[i])) {
        ref += s[i];
        i++;
      }
      tokens.push({ type: 'ref', value: ref });
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen', value: ch });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ch });
      i++;
      continue;
    }

    throw new ParseError(`Unexpected character: ${ch}`);
  }

  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos: number;
  private grid: GridState;
  private visited: Set<string>;

  constructor(tokens: Token[], grid: GridState, visited: Set<string>) {
    this.tokens = tokens;
    this.pos = 0;
    this.grid = grid;
    this.visited = visited;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private next(): Token {
    const t = this.tokens[this.pos];
    if (!t) throw new ParseError('Unexpected end of expression');
    this.pos++;
    return t;
  }

  parse(): number {
    if (this.tokens.length === 0) {
      throw new ParseError('Empty expression');
    }
    const value = this.parseExpression();
    if (this.pos !== this.tokens.length) {
      throw new ParseError('Unexpected trailing tokens');
    }
    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek() && this.peek()!.type === 'op' && (this.peek()!.value === '+' || this.peek()!.value === '-')) {
      const op = this.next().value;
      const rhs = this.parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    while (this.peek() && this.peek()!.type === 'op' && (this.peek()!.value === '*' || this.peek()!.value === '/')) {
      const op = this.next().value;
      const rhs = this.parseFactor();
      if (op === '*') {
        value = value * rhs;
      } else {
        if (rhs === 0) throw new ParseError('Division by zero');
        value = value / rhs;
      }
    }
    return value;
  }

  private parseFactor(): number {
    const token = this.peek();
    if (!token) throw new ParseError('Unexpected end of expression');

    if (token.type === 'op' && (token.value === '-' || token.value === '+')) {
      this.next();
      const value = this.parseFactor();
      return token.value === '-' ? -value : value;
    }

    if (token.type === 'lparen') {
      this.next();
      const value = this.parseExpression();
      const closing = this.peek();
      if (!closing || closing.type !== 'rparen') {
        throw new ParseError('Missing closing parenthesis');
      }
      this.next();
      return value;
    }

    if (token.type === 'number') {
      this.next();
      return parseFloat(token.value);
    }

    if (token.type === 'ref') {
      this.next();
      return resolveCell(token.value, this.grid, this.visited);
    }

    throw new ParseError(`Unexpected token: ${token.value}`);
  }
}

export function resolveCell(id: string, grid: GridState, visited: Set<string>): number {
  if (!CELL_REF_RE.test(id)) {
    throw new ParseError(`Invalid cell reference: ${id}`);
  }
  if (visited.has(id)) {
    throw new ParseError(`Circular or repeated reference: ${id}`);
  }

  const rawValue = grid[id];
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    throw new ParseError(`Reference to non-existent cell: ${id}`);
  }

  const nextVisited = new Set(visited);
  nextVisited.add(id);

  const displayValue = evaluateToString(rawValue, grid, nextVisited);
  const num = Number(displayValue);
  if (displayValue === '' || Number.isNaN(num)) {
    throw new ParseError(`Non-numeric cell: ${id}`);
  }

  return num;
}

function evaluateToString(rawValue: string, grid: GridState, visited: Set<string>): string {
  if (!rawValue.startsWith('=')) {
    return rawValue;
  }

  const expr = rawValue.slice(1);

  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, grid, visited);
    const result = parser.parse();
    if (!Number.isFinite(result)) {
      return 'Error';
    }
    return String(result);
  } catch (e) {
    return 'Error';
  }
}

export function evaluateCell(rawValue: string, grid: GridState): string {
  if (rawValue === undefined || rawValue === null) {
    return '';
  }

  if (!rawValue.startsWith('=')) {
    return rawValue;
  }

  const expr = rawValue.slice(1);

  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, grid, new Set<string>());
    const result = parser.parse();
    if (!Number.isFinite(result)) {
      return 'Error';
    }
    return String(result);
  } catch (e) {
    return 'Error';
  }
}
