# PostQuery

An easy to use Query Client for Deno Postgres.

## Docs

Docs are available [here](https://doc.deno.land/https/deno.land/x/postquery/mod.ts).

## Usage

```ts
import { QueryClient, DataType, CreateTableMode, Constraint } from "https://deno.land/x/postquery/mod.ts";

const client = new QueryClient(/* Connection URI or Connection Object */);
const users = client.table<{
  id: number,
  name: string,
}>("users");

await users.create({
  id: {
    type: DataType.Integer,
    constraint: Constraint.PrimaryKey,
  },
  name: {
    type: DataType.VarChar,
    length: 20,
  }
}, CreateTableMode.DropIfExists);

await users.insert({
  id: 1,
  name: "User 1",
}, {
  id: 2,
  name: "User 2",
}, {
  id: 3,
  name: "User 3",
});

await users.where({
  id: 2
}).select("name"); // { name: "User 2" }

await users.where().limit(2).select(); 
// [ { id: 1, name: "User 1" }, { id: 2, name: "User 2" } ]

await users.where({ id: 1 }).delete();

await users.where({
  id: 1
}).select(); // []
```

## Contributing

You're always welcome to contribute!

- We use `deno fmt` for our code style.
- We use `deno lint` for linting code.

## License

Check [LICENSE](LICENSE) for more info.

Copyright 2021 @ DjDeveloperr