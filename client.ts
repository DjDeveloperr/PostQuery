import { Client, ConnectionOptions } from "./deps.ts";
import { QueryTable } from "./table.ts";
import { QueryCondition, QueryParams } from "./types.ts";
import { QueryWhere } from "./where.ts";

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
