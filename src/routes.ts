import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth';
import { verifyGatewayRequest } from '@ashish0285/ashish-job-shared';
import { currentUserRoutes } from '@auth/routes/current-user';
import { healthRoutes } from '@auth/routes/health.routes';
import { searchRoutes } from '@auth/routes/search.routes';
import { seeedRoutes } from '@auth/routes/seeds.routes';

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application): void => {
    app.use('', healthRoutes.routes());
    app.use(BASE_PATH, searchRoutes());
    app.use(BASE_PATH, seeedRoutes());
    app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
    app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
};
