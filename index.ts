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




// for (let i = 0; i < 1; i++) {
//   const res = db.query({
//     action: QueryAction.InsertTable,
//     tableName: "users",
//     data: {
//       username: "Hello",
//       id: i
//     }
//   });

//   if (i % 100 === 1) {

//     console.log(i)
//   }
// }



const t1 = performance.now()
const [res] = db.query({
  action: QueryAction.FindOneTable,
  tableName: "users",
  data: {
    id: 1
  }
});
console.log(performance.now() - t1)
console.log(res);