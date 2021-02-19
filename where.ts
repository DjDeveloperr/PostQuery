import type { QueryClient } from "./client.ts";
import { OrderBy, QueryCondition } from "./types.ts";
import { unsketchify } from "./utils.ts";

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
