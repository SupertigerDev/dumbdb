import fs from 'fs';
import path from 'path';


const DatabaseError = {
  TableExists: (tableName: string) => ({ code: 1, message: `Table "${tableName}" already exists.` }),
  TableNotExist: (tableName: string) => ({ code: 2, message: `Table "${tableName}" does not exist.` }),
  FieldNotExist: (field: string, tableName: string) => ({ code: 3, message: `Field "${field}" does not exist in table "${tableName}".` }),
  FieldTypeMissmatch: (wanted: string, got: string, field: string, tableName: string) => ({ code: 4, message: `Field "${field}" type missmatch in table "${tableName}". Wanted: "${wanted}" Got: "${got}"` }),
  MissingFields: (missingFields: string[], tableName: string) => ({ code: 5, message: `There are one or more missing fields in table "${tableName}" Missing: ${missingFields.join(",")}` }),

} as const

export enum QueryAction {
  CreateTable = 0,
  InsertTable = 1,
  FindTable = 2
}

export enum FieldType {
  string = 0
}

const FieldTypeToTypeof = {
  [FieldType.string]: "string"
} as const


const TypeofToFieldTYpe = {
  string: FieldType.string
} as const


interface Field {
  type: FieldType.string
}

interface Table {
  name: string,
  fields: {
    [key: string]: Field
  }

}

type CreateTableQuery = {
  action: QueryAction.CreateTable,
  table: Table
}


type InsertTableQuery = {
  action: QueryAction.InsertTable,
  tableName: string,
  data: Record<string, any>
}

type FindTableQuery = {
  action: QueryAction.FindTable,
  tableName: string,
  data: Record<string, any>
}


export type Query = CreateTableQuery | InsertTableQuery | FindTableQuery

interface DatabaseOptions {
  rootDir?: string
}

export const createDatabase = (opts?: DatabaseOptions) => {

  const rootDir = opts?.rootDir ?? "./data";

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir)
  }


  const handleInsertTable = (query: InsertTableQuery) => {
    const tableName = query.tableName;
    const tablePath = path.join(rootDir, tableName)
    const metadataPath = path.join(tablePath, "metadata.json");
    const dataPath = path.join(tablePath, "data");

    if (!fs.existsSync(metadataPath)) {
      return [null, DatabaseError.TableNotExist(tableName)] as const;
    }
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8")) as Table;

    const metadataFieldNames = Object.keys(metadata.fields);
    const queryFieldNames = Object.keys(query.data);

    const missingFields = metadataFieldNames.filter(f => !queryFieldNames.includes(f));
    if (missingFields.length > 0) {
      return [null, DatabaseError.MissingFields(missingFields, tableName)] as const;
    }

    for (let userField in query.data) {
      const fieldMetadata = metadata.fields[userField];
      const userValue = query.data[userField];

      if (!fieldMetadata) {
        return [null, DatabaseError.FieldNotExist(userField, tableName)] as const;
      }
      if (typeof userValue !== FieldTypeToTypeof[fieldMetadata.type]) {
        return [null, DatabaseError.FieldTypeMissmatch(FieldTypeToTypeof[fieldMetadata.type], typeof userValue, userField, tableName)] as const;
      }
    }

    fs.appendFileSync(dataPath, JSON.stringify(metadataFieldNames.map(f => query.data[f])).slice(1, -1) + "\n")

    return [true, null] as const;
  }



  const handleCreateTable = (query: CreateTableQuery) => {
    const tableName = query.table.name;
    const tablePath = path.join(rootDir, tableName)
    if (fs.existsSync(tablePath)) {
      return [null, DatabaseError.TableExists(tableName)] as const;
    }

    const metadataPath = path.join(tablePath, "metadata.json")
    const dataPath = path.join(tablePath, "data")

    fs.mkdirSync(tablePath)
    fs.writeFileSync(metadataPath, JSON.stringify(query.table))
    fs.writeFileSync(dataPath, "")

    return [true, null] as const;
  }


  const query = (query: Query) => {
    switch (query.action) {
      case QueryAction.CreateTable:
        return handleCreateTable(query)
      case QueryAction.InsertTable:
        return handleInsertTable(query)
      default:
        break;
    }
    throw new Error("Invalid query " + query.action)
  }

  return { query }

}