// deno-lint-ignore-file no-explicit-any
import { Client, ConnectionOptions } from "./deps.ts";

export type ConditionValue = string | number | string[] | number[] | null;

export enum ConditionType {
  Equals = "=",
  GreaterThan = ">",
  LesserThan = "<",
  GreaterThanOrEquals = ">=",
  LesserThanOrEquals = "<=",
  NotEquals = "!=",
  Like = "LIKE",
  In = "IN",
}

export interface ConditionExtended {
  value: ConditionValue;
  type?: ConditionType;
}

export interface QueryCondition {
  [field: string]: ConditionValue | ConditionExtended;
}

export function unsketchify(res: string) {
  if (!res.startsWith('"') && !res.endsWith('"')) res = '"' + res + '"';
  res = '"' + res.substr(1, res.length - 2).replaceAll('"', '""') + '"';
  return res;
}

export enum OrderByType {
  Ascending = "ASC",
  Descending = "DESC",
}

export enum OrderByOption {
  NullsFirst = "NULLS FIRST",
  NullsLast = "NULLS LAST",
}

export interface OrderBy {
  column: string;
  type?: OrderByType;
  option?: OrderByOption;
}

export class QueryWhere<T extends Record<string, unknown> = QueryCondition> {
  selectLimit?: number;
  selectOffset?: number;
  aliases: [string, string][] = [];
  #with?: string;
  orderBy?: OrderBy | string;

  constructor(
    public client: QueryClient,
    public table: string,
    public condition: Partial<T> = {}
  ) {}

  limit(num: number) {
    this.selectLimit = num;
    return this;
  }

  offset(num: number) {
    this.selectOffset = num;
    return this;
  }

  with(what: string) {
    if (this.#with !== undefined) throw new Error("as() not used yet");
    this.#with = what;
    return this;
  }

  order(by: OrderBy | string) {
    this.orderBy = by;
    return this;
  }

  as(alias: string) {
    if (this.#with === undefined)
      throw new Error("with() not used before as()");
    this.aliases.push([this.#with, alias]);
    this.#with = undefined;
    return this;
  }

  make() {
    return {
      sql:
        Object.keys(this.condition).length == 0
          ? ""
          : `WHERE ${Object.entries(this.condition)
              .map(
                (e, i) =>
                  `${unsketchify(e[0])} ${
                    typeof e[1] === "object" && e[1].type ? e[1].type : "="
                  } $${i + 1}`
              )
              .join(" AND ")}`,
      params: Object.values(this.condition),
    };
  }

  async select<T2 extends Record<string, unknown> = T>(
    ...what: Array<string>
  ): Promise<T2[]> {
    const make = this.make();
    return await this.client.query<T2>(
      `SELECT ${
        what.length === 0
          ? this.aliases.length === 0
            ? "*"
            : this.aliases.map(
                (e) => `${unsketchify(e[0])} AS ${unsketchify(e[1])}`
              )
          : what.map((e) => unsketchify(e)).join(", ") +
            (this.aliases.length === 0
              ? ""
              : ` ${this.aliases.map(
                  (e) => `${unsketchify(e[0])} AS ${unsketchify(e[1])}`
                )}`)
      } FROM ${unsketchify(this.table)} ${make.sql}${
        this.orderBy === undefined
          ? ""
          : ` ORDER BY ${
              typeof this.orderBy === "string"
                ? unsketchify(this.orderBy)
                : `${unsketchify(this.orderBy.column)}${
                    this.orderBy.type ? ` ${this.orderBy.type}` : ""
                  }${this.orderBy.option ? ` ${this.orderBy.option}` : ""}`
            }`
      }${this.selectLimit !== undefined ? ` LIMIT ${this.selectLimit}` : ""}${
        this.selectOffset !== undefined ? ` OFFSET ${this.selectOffset}` : ""
      }`,
      make.params
    );
  }

  async update<T2 extends Record<string, unknown> = T>(what: Partial<T2>) {
    const make = this.make();
    await this.client.query<T2>(
      `UPDATE ${unsketchify(this.table)} SET ${Object.keys(what).map(
        (e, i) => `${unsketchify(e)} = $${make.params.length + i + 1}`
      )} ${make.sql}`,
      [...make.params, ...Object.values(what)]
    );
    return this;
  }

  async delete() {
    const make = this.make();
    await this.client.query<T>(
      `DELETE FROM ${unsketchify(this.table)} ${this.make()}`,
      make.params
    );
    return this;
  }
}

export enum DataType {
  Text = "TEXT",
  Integer = "INTEGER",
  Name = "NAME",
  VarChar = "VARCHAR",
  JSON = "JSON",
  JSONB = "JSONB",
  Serial = "SERIAL",
  Date = "DATE",
  Timestamp = "TIMESTAMP",
  TimestampTZ = "TIMESTAMPTZ",
  Char = "CHAR",
  Boolean = "BOOLEAN",
  Interval = "INTERVAL",
  Time = "TIME",
  UUID = "UUID",
  HStore = "HSTORE",
  Box = "BOX",
  Line = "LINE",
  Point = "POINT",
  LineSegment = "LSEG",
  Polygon = "POLYGON",
  INet = "INET",
  MacAddr = "MACADDR",
}

export enum Constraint {
  NotNull = "NOT NULL",
  Unique = "UNIQUE",
  PrimaryKey = "PRIMARY KEY",
  Check = "CHECK",
  ForeignKey = "FOREIGN KEY",
}

export interface TableColumn {
  type: DataType;
  array?: boolean;
  length?: number;
  constrait?: Constraint;
  nullable?: boolean;
}

export interface TableOptions {
  [name: string]: DataType | TableColumn;
}

export enum CreateTableMode {
  IfNotExists,
  DropIfExists,
}

export type QueryParams = Array<string | number | string[] | number[]>;

export class QueryTable<T extends Record<string, unknown> = QueryCondition> {
  constructor(public client: QueryClient, public name: string) {}

  where(condition: Partial<T> = {}) {
    return new QueryWhere<T>(this.client, this.name, condition);
  }

  async create(options: TableOptions, mode?: CreateTableMode) {
    if (mode === CreateTableMode.DropIfExists)
      await this.client.query(`DROP TABLE IF EXISTS ${unsketchify(this.name)}`);
    const sql = `CREATE TABLE${
      mode === CreateTableMode.IfNotExists ? " IF NOT EXISTS" : ""
    } ${unsketchify(this.name)}(${Object.entries(options)
      .map(
        (e) =>
          `${unsketchify(e[0])} ${
            typeof e[1] === "string"
              ? e[1]
              : `${e[1].type}${e[1].array ? "[]" : ""}${
                  e[1].length ? `(${e[1].length})` : ""
                }${e[1].nullable === false ? ` NOT NULL` : ""}${
                  e[1].constrait ? ` ${e[1].constrait}` : ""
                }`
          }`
      )
      .join(", ")})`;
    await this.client.query(sql);
    return this;
  }

  async drop(ifExists?: boolean) {
    await this.client.query(
      `DROP TABLE${ifExists ? " IF EXISTS" : ""} ${unsketchify(this.name)}`
    );
    return this;
  }

  async insert<T2 extends Record<string, unknown> = T>(...data: T2[]) {
    if (!data.length) return this;
    const cols: string[] = [];
    data.forEach((e) => {
      Object.keys(e).forEach((k) =>
        cols.includes(k) ? undefined : cols.push(k)
      );
    });
    const params: QueryParams = [];
    await this.client.query(
      `INSERT INTO ${unsketchify(this.name)}(${cols
        .map((e) => unsketchify(e))
        .join(", ")}) VALUES${data
        .map(
          (d) =>
            `(${cols
              .map((e) => {
                const val = d[e];
                if (val === undefined) return "null";
                else {
                  params.push(val as any);
                  return `$` + params.length;
                }
              })
              .join(", ")})`
        )
        .join(", ")}`,
      params
    );
    return this;
  }

  async select<T2 extends Record<string, unknown> = T>(
    ...what: Array<string>
  ): Promise<T2[]> {
    return await this.where({}).select<T2>(...what);
  }

  async delete() {
    await this.where({}).delete();
    return this;
  }

  async update<T2 extends Record<string, unknown> = T>(what: Partial<T2>) {
    await this.where({}).update(what);
    return this;
  }
}

export class QueryClient {
  client: Client;
  ready: Promise<void>;

  constructor(options: ConnectionOptions | string) {
    this.client = new Client(options);
    this.ready = this.client.connect();
  }

  // deno-lint-disable-line no-explicit-any
  async query<T extends Record<string, unknown> = { [name: string]: unknown }>(
    sql: string,
    params: QueryParams = []
  ) {
    await this.ready;
    return this.client.queryObject<T>(sql, ...params).then((e) => e.rows);
  }

  where<T extends Record<string, unknown> = QueryCondition>(
    table: string,
    condition: Partial<T> = {}
  ) {
    return new QueryWhere<T>(this, table, condition);
  }

  table<T extends Record<string, unknown> = QueryCondition>(name: string) {
    return new QueryTable<T>(this, name);
  }

  from<T extends Record<string, unknown> = QueryCondition>(table: string) {
    return this.table<T>(table);
  }
}
