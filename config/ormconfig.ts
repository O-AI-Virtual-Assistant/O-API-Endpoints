import { DataSource } from "typeorm";
import { __prod__ } from "../src/constants";

const connectDB = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1234",
  database: "O",
  synchronize: !__prod__,
  logging: !__prod__,
  entities: ["./src/entities/**/*.ts"],
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

connectDB
  .initialize()
  .then(() => {
    console.log(`Data Source has been initialized`);
  })
  .catch((err) => {
    console.error(`Data Source initialization error`, err);
  });

export default connectDB;
