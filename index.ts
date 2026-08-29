import { createDatabase, FieldType, QueryAction } from "./database"

const db = createDatabase()

// const result = db.query({
//   action: QueryAction.CreateTable,
//   table: {
//     name: "users",
//     fields: {
//       username: {
//         type: FieldType.string
//       },
//       id: {
//         type: FieldType.number
//       }
//     }
//   }
// });
// console.log(result)




// for (let i = 0; i < 100_000; i++) {
//   const res = db.query({
//     action: QueryAction.InsertTable,
//     tableName: "users",
//     data: {
//       username: "Hello",
//       id: 0
//     }
//   });

//   if (i % 100 === 1) {

//     console.log(i)
//   }
// }



const t1 = performance.now()
const [res] = db.query({
  action: QueryAction.FindTable,
  tableName: "users",
  limit: 1,
  data: {
    username: "Hello"
  }
});
const t2 = performance.now();
console.log(t2 - t1)