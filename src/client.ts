import { Client, ConnectionOptions } from "../deps.ts";
import { QueryTable } from "./table.ts";
import { QueryCondition, QueryParams } from "./types.ts";
import { QueryWhere } from "./where.ts";

/** Easy to use Query Client for Deno Postgres */
export class QueryClient {
  client: Client;
  ready: Promise<void>;

  constructor(options: ConnectionOptions | string | Client) {
    this.client = options instanceof Client ? options : new Client(options);
    this.ready =
      options instanceof Client ? Promise.resolve() : this.client.connect();
  }

  // deno-lint-disable-line no-explicit-any
  /** Execute Raw Query */
  async query<T extends Record<string, unknown> = { [name: string]: unknown }>(
    sql: string,
    params: QueryParams = []
  ) {
    await this.ready;
    return this.client.queryObject<T>(sql, ...params).then((e) => e.rows);
  }

  /** Start building a WHERE query for SELECT, UPDATE, DELETE, etc. */
  where<T extends Record<string, unknown> = QueryCondition>(
    table: string,
    condition: Partial<T> = {}
  ) {
    return new QueryWhere<T>(this, table, condition);
  }

  /** Get Table interfacing for Query Builder */
  table<T extends Record<string, unknown> = QueryCondition>(name: string) {
    return new QueryTable<T>(this, name);
  }

  /** Disconnect from Postgres Database */
  async disconnect() {
    await this.client.end();
    return this;
  }
}
