/** Built in Data Types in Postgres */
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
  ByteArray = "BYTEA",
  HStore = "HSTORE",
  Box = "BOX",
  Line = "LINE",
  Point = "POINT",
  LineSegment = "LSEG",
  Polygon = "POLYGON",
  INet = "INET",
  MacAddr = "MACADDR",
}

/** Column Constraints */
export enum Constraint {
  NotNull = "NOT NULL",
  Unique = "UNIQUE",
  PrimaryKey = "PRIMARY KEY",
  Check = "CHECK",
  ForeignKey = "FOREIGN KEY",
}

/** Represents a Table Column when CREATing table */
export interface TableColumn {
  type: DataType;
  array?: boolean;
  length?: number;
  constraint?: Constraint;
  nullable?: boolean;
}

/** Represents all Columns when CREATing table */
export interface TableOptions {
  [name: string]: DataType | TableColumn;
}

/** Different Modes that can be used when creating table */
export enum CreateTableMode {
  /** Create table if not exists */
  IfNotExists,
  /** Drop the existing table and create new one if exists */
  DropIfExists,
}

/** Represents JS Types which can be used for Column Values */
export type QueryParams = Array<string | number | string[] | number[] | null>;

/** Whether to ORDER BY Ascending or Descending */
export enum OrderByType {
  Ascending = "ASC",
  Descending = "DESC",
}

/** ORDER BY option */
export enum OrderByOption {
  NullsFirst = "NULLS FIRST",
  NullsLast = "NULLS LAST",
}

/** Represents ORDER BY options */
export interface OrderBy {
  column: string;
  type?: OrderByType;
  option?: OrderByOption;
}

/** JS Types that can be used in Condition's Value */
export type ConditionValue = string | number | string[] | number[] | null;

/** Type of comparision to use in Condition */
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

/** Optional Configuration for WHERE claus to change comparison */
export interface ConditionExtended {
  value: ConditionValue;
  type?: ConditionType;
}

/** Represents the WHERE claus in JS Types */
export interface QueryCondition {
  [field: string]: ConditionValue | ConditionExtended;
}
