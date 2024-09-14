import http from 'http';

import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@ashish0285/ashish-job-shared';
import { Logger } from 'winston';
import { config } from '@auth/config';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from '@auth/elasticsearch';
import { appRoutes } from '@auth/routes';
import { Channel } from 'amqplib';
import { createConnection } from '@auth/queues/connection';
 
 const SERVER_PORT = 4002;
 const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authenticationServer', 'debug');

export let authChannel: Channel;

export const start = (app: Application): void => {
    securityMiddleware(app);
    standardMiddleware(app);
    routesMiddleware(app);
    startQueues();
    startElasticSearch();
    authErrorHandler(app);
    startServer(app);
};

const securityMiddleware = (app: Application): void => {
    app.set('trust proxy', 1);
    app.use(hpp());
    app.use(helmet());
    app.use(cors({
        origin: config.API_GATEWAY_URL,
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS']
    }));
    // Bearer kaslcaknclan --- jwt Token
    app.use((req: Request, _res: Response, next: NextFunction) => {
        if( req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const payload = verify(token, config.JWT_TOKEN!) as IAuthPayload;
            req.currentUser = payload;
        }
        next();
    });
};

const standardMiddleware = (app: Application): void => {
    app.use(compression());
    app.use(
      json({
        limit: '200mb'
      })
    );
    app.use(
      urlencoded({
        extended: true,
        limit: '200mb'
      })
    );
};

const routesMiddleware = (app: Application): void => {
    appRoutes(app);
};

const startQueues = async():Promise<void> => {
    authChannel = await createConnection() as Channel;
};


const startElasticSearch = (): void => {
    checkConnection();
};

const authErrorHandler = (app: Application): void => {
    app.use((error: IErrorResponse, _req: Request, resp: Response, next: NextFunction): void => {
        log.log('error', `AuthService ${error.comingFrom}:`, error);
        if (error instanceof CustomError) {
          resp.status(error.statusCode).json(error.serializeError());
        }
        next();
      });
};

const startServer = (app: Application): void => {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(`Authentication server has started with process id ${process.pid}`);
        httpServer.listen(SERVER_PORT, ()=> {
            log.info(`Authentication server running on port: ${SERVER_PORT}`);
        });
    } catch (error) {
        log.log('error', 'AuthService startServer():', error);
    }
};