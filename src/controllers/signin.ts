import { Request, Response } from 'express';
import { loginSchema } from '@auth/schemas/signin';
import { BadRequestError, IAuthDocument, isEmail } from '@ashish0285/ashish-job-shared';
import { getAuthUserByEmail, getAuthUserByUsername, signToken } from '@auth/services/auth.service';
import { AuthModel } from '@auth/models/auth.model';
import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

export const read = async(req: Request, res: Response): Promise<void> => {
    const { error } = await Promise.resolve(loginSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'SignUp read() method');
    }
    const { username, password } = req.body;
    const isValidEmail: boolean = isEmail(username);
    const existingUser: IAuthDocument = isValidEmail ? await getAuthUserByEmail(username) : await getAuthUserByUsername(username);
    if (!existingUser) {
        throw new BadRequestError('Invalid Credentials', 'SignUp read() method');
    }
    const passwordMatch: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);
    if (!passwordMatch) {
        throw new BadRequestError('Invalid Credentials', 'SignUp read() method');
    }
    const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);
    const userData: IAuthDocument = _.omit(existingUser, ['password']);
    res.status(StatusCodes.OK).json({message: 'User Login Successfully', user: userData, token: userJWT});
    };