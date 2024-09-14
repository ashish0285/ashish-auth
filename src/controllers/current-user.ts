import crypto from 'crypto';

import { BadRequestError, IAuthDocument, IEmailMessageDetails, lowerCase } from '@ashish0285/ashish-job-shared';
import { getAuthUserByEmail, getAuthUserById, updateVerifyEmailField } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@auth/config';
import { authChannel } from '@auth/server';
import { publishDirectMessage } from '@auth/queues/auth.producer';

export const read = async( req: Request, res: Response): Promise<void> => {

    let user = null;
    const loggedUser: IAuthDocument = await getAuthUserById(req.currentUser!.id);

    if (Object.keys(loggedUser).length) {
        user = loggedUser;
    }
    
    res.status(StatusCodes.OK).json({message: 'Authenticated User!!', user});
};

export const resendEmail = async( req: Request, res: Response): Promise<void> => {

    const { email, userId } = req.body;
    const loggedUser: IAuthDocument = await getAuthUserByEmail(lowerCase(email));

    if (!loggedUser) {
        throw new BadRequestError('Email is invalid', 'CurrentUser resendEmail() method');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
    await updateVerifyEmailField(parseInt(userId),0, randomCharacters);
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: lowerCase(email),
        verifyLink: verificationLink,
        template: 'verifyEmail'
       };
       await publishDirectMessage(
        authChannel,
        'ashish-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'verify email message has been sent to notification service'
       );
       const updatedUser = await getAuthUserById(parseInt(userId));
       res.status(StatusCodes.OK).json({message: 'Email verification sent', user: updatedUser});
};