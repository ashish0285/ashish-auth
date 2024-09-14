import { IAuthDocument, IAuthPayload } from '@ashish0285/ashish-job-shared';
import { Response } from 'express';

export const authMockRequest = (session: IJWT, body: IAuthMock, currentUser?: IAuthPayload | null, params?: unknown) => ({
    session,
    body,
    params,
    currentUser
});

export const authMockResponse = (): Response => {
    const res: Response = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

export interface IJWT {
    jwt?: string;
}

export interface IAuthMock {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    createdAt?: Date | string;
}

export const AuthUserPayload: IAuthPayload  = {
    id: 1,
    username: 'Ashish',
    email: 'ashish@test.com',
    iat: 1234567
};

export const authMock = {
    id: 1,
    profilePublicId: '123456789012',
    username: 'Ashish',
    email: 'ashish@test.com',
    country: 'India',
    profilePicture: '',
    emailVerified: 1,
    createdAt: '2023-12-05T07:42:24:431Z',
    comparePassword: () => {},
    hashPassword: () => false
} as unknown as IAuthDocument;