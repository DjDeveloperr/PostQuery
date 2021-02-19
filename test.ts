import { Constraint, CreateTableMode, DataType, QueryClient } from "./mod.ts";

const client = new QueryClient("postgres://postgres@localhost/postgres");
await client.ready;

const table = client.table<{
  id: string;
  name: string;
}>("test");

await table.create(
  {
    id: {
      type: DataType.Text,
      constrait: Constraint.PrimaryKey,
    },
    name: {
      type: DataType.VarChar,
      length: 16,
    },
  },
  CreateTableMode.DropIfExists
);
console.log("Created table!");

await table.insert(
  {
    id: "1",
    name: "DjDeveloperr",
  },
  {
    id: "2",
    name: "Helloyunho",
  },
  {
    id: "3",
    name: "TheForgottenOne",
  }
);
console.log("Inserted!");
console.log("Select by id = 1", await table.where({ id: "1" }).select());
console.log("Select by id = 2", await table.where({ id: "2" }).select());
console.log(
  "Select by name",
  await table.where({ name: "TheForgottenOne" }).select()
);
await table.where({ id: "1" }).update({ name: "DjDeveloper" });
console.log("Update with ID 1");
console.log("Select All", await table.select());
