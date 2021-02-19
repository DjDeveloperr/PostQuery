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
