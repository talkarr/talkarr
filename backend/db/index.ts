import {DataSource, DataSourceOptions} from "typeorm";

const toBool = (value: string | undefined): boolean => {
    return value === 'true';
};

export const pgConfigDev: DataSourceOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? "talkarr",
    synchronize: false,
    migrationsRun: false,
    logging: toBool(process.env.POSTGRES_LOGGING),
    entities: ["backend/entity/**/*.ts"],
    migrations: ["backend/migration/postgres/**/*.ts"],
    subscribers: ["backend/subscriber/**/*.ts"],
};


export const pgConfigProd: DataSourceOptions = {
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT ?? "5432"),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? "talkarr",
    synchronize: false,
    migrationsRun: true,
    logging: toBool(process.env.POSTGRES_LOGGING),
    entities: ["backend/entity/**/*.ts"],
    migrations: ["backend/migration/postgres/**/*.ts"],
    subscribers: ["backend/subscriber/**/*.ts"],
};

const getConfig = () => {
    return process.env.NODE_ENV === 'production' ? pgConfigProd : pgConfigDev;
};

const dataSource = new DataSource(getConfig());

export default dataSource;
