import { winstonLogger } from '@ashish0285/ashish-job-shared';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Sequelize } from 'sequelize';


const log: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, 'authDatabaseServer', 'debug');

export const sequelize = new Sequelize(config.MYSQL_DB!,{
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        multipleStatements: true
    }
});

export const databaseConnection = async(): Promise<void> => {
    try {
        await sequelize.authenticate();
        log.info('Auth Service Mysql database connection has been established successfully.');
    } catch (error) {
        log.error('Auth Service - Unable to connect to Database.');
        log.log('error', 'Auth Service databaseConnection() method:', error);
    }
};