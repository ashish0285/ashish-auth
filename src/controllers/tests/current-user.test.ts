import { Request, Response } from 'express';
import * as auth from '@auth/services/auth.service';
import * as helper from '@ashish0285/ashish-job-shared';

import { read, resendEmail } from '../current-user';

import { authMock, authMockRequest, authMockResponse, AuthUserPayload } from './mocks/auth.mocks';

jest.mock('@auth/services/auth.service');
jest.mock('@ashish0285/ashish-job-shared');
jest.mock('@auth/queues/auth.producer');
jest.mock('@elastic/elasticsearch');

const USERNAME = 'ashish';
const PASSWORD = 'ashish1';

describe('current User', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    afterEach(()=>{
        jest.clearAllMocks();
    });

    describe('read meathod', () => {
        it('should return authenticated user', async() => {
            const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, AuthUserPayload) as unknown as Request;
            const res: Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserById').mockResolvedValue(authMock);
            await read(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect (res.json).toHaveBeenCalledWith({
                message: 'Authenticated User!!',
                user: authMock
            });
        });

        it('should return empty user', async() => {
            const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, AuthUserPayload) as unknown as Request;
            const res: Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserById').mockResolvedValue({} as helper.IAuthDocument);
            await read(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect (res.json).toHaveBeenCalledWith({
                message: 'Authenticated User!!',
                user: null
            });
        });
    });

    describe('resendEmail meathod', () => {
        it('should throw a BadRequest error for invalid email', async() => {
            const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, AuthUserPayload) as unknown as Request;
            const res: Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserByEmail').mockResolvedValue({} as helper.IAuthDocument);

            resendEmail(req, res).catch(()=>{
                expect(helper.BadRequestError).toHaveBeenCalledWith('Email is invalid', 'CurrentUser resendEmail() method');

            });
        });

        it('should call updateVerifyEmailField method', async() => {
            const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, AuthUserPayload) as unknown as Request;
            const res: Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserByEmail').mockResolvedValue(authMock);

            await resendEmail(req, res);

            expect(auth.updateVerifyEmailField).toHaveBeenCalled();
        });

        it('should call updateVerifyEmailField method', async() => {
            const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, AuthUserPayload) as unknown as Request;
            const res: Response = authMockResponse();
            jest.spyOn(auth,'getAuthUserByEmail').mockResolvedValue(authMock);
            jest.spyOn(auth,'getAuthUserById').mockResolvedValue(authMock);

            await resendEmail(req, res);

            expect(auth.updateVerifyEmailField).toHaveBeenCalled();
            expect(auth.getAuthUserById).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email verification sent',
                user: authMock
            });
        });

    });
});