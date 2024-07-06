import { DataSource } from "typeorm";
import { __prod__ } from "../src/constants";

const connectDB = new DataSource({
  type: process.env.DATABASE_TYPE as any,
  host: process.env.HOST,
  port: process.env.PORT as any,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.DATABASE,
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
