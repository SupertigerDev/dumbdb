import { createDatabase, FieldType, QueryAction } from "./database"

const db = createDatabase()

const result = db.query({
  action: QueryAction.CreateTable,
  table: {
    name: "users",
    fields: {
      username: {
        type: FieldType.string
      },
      id: {
        type: FieldType.string
      }
    }
  }
});
console.log(result)


const res = db.query({
  action: QueryAction.InsertTable,
  tableName: "users",
  data: {
    username: "lol",
    id: "1"
  }
});
console.log(res);