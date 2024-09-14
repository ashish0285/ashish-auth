import crypto from 'crypto';

import { BadRequestError, IAuthDocument, IEmailMessageDetails } from '@ashish0285/ashish-job-shared';
import { changePasswordSchema, emailSchema, passwordSchema } from '@auth/schemas/password';
import { getAuthUserByEmail, getAuthUserByPasswordToken, getAuthUserByUsername, updatePassword, updatePasswordToken } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { AuthModel } from '@auth/models/auth.model';

export const forgotPassword = async( req: Request, res: Response): Promise<void> => {
    const { error } = await Promise.resolve(emailSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'Password createForgotPassword() method');
    }
    const { email } = req.body;
    const loggedUser: IAuthDocument = await getAuthUserByEmail(email);

    if (!loggedUser) {
        throw new BadRequestError('Invalid Email', 'Password crcreateForgotPasswordeate() method');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const date: Date = new Date();
    date.setHours(date.getHours() + 1);
    await updatePasswordToken(loggedUser.id!, randomCharacters, date);
    const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomCharacters}`;
    const messageDetails: IEmailMessageDetails = {
        receiverEmail: loggedUser.email,
        resetLink,
        username: loggedUser.username,
        template: 'forgot-password'
    };
    await publishDirectMessage(
        authChannel,
        'ashish-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Forgot Password Message Sent to Notification Service'
    );
    
    res.status(StatusCodes.OK).json({message: 'Password reset email sent successfully.'});
};

export const resetPassword = async( req: Request, res: Response): Promise<void> => {
    const { error } = await Promise.resolve(passwordSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'Password resetPassword() method');
    }
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (password !==  confirmPassword) {
        throw new BadRequestError('Passwords do not match', 'Password resetPassword() method');
    }
    
    const loggedUser: IAuthDocument = await getAuthUserByPasswordToken(token);

    if (!loggedUser) {
        throw new BadRequestError('Reset token is expired', 'Password resetPassword() method');
    }

    const hashedPassword: string = await AuthModel.prototype.hashPassword(password);
    await updatePassword(loggedUser.id!, hashedPassword);

    const messageDetails: IEmailMessageDetails = {
        username: loggedUser.username,
        template: 'resetPasswordSuccess'
    };
    await publishDirectMessage(
        authChannel,
        'ashish-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Reset Password SuccessMessage Sent to Notification Service'
    );
    
    res.status(StatusCodes.OK).json({message: 'Password successfully updated'});
};

export const changePassword = async( req: Request, res: Response): Promise<void> => {
    const { error } = await Promise.resolve(changePasswordSchema.validate(req.body));
    if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'Password changePassword() method');
    }
    const { currentPassword, newPassword } = req.body;

    if (currentPassword ===  newPassword) {
        throw new BadRequestError('Cannot use the same password', 'Password changePassword() method');
    }
    
    const loggedUser: IAuthDocument = await getAuthUserByUsername(req.currentUser!.username);

    if (!loggedUser) {
        throw new BadRequestError('Invalid Password', 'Password changePassword() method');
    }

    const hashedPassword: string = await AuthModel.prototype.hashPassword(newPassword);
    await updatePassword(loggedUser.id!, hashedPassword);

    const messageDetails: IEmailMessageDetails = {
        username: loggedUser.username,
        template: 'resetPasswordSuccess'
    };
    await publishDirectMessage(
        authChannel,
        'ashish-email-notification',
        'auth-email',
        JSON.stringify(messageDetails),
        'Password Change SuccessMessage Sent to Notification Service'
    );
    
    res.status(StatusCodes.OK).json({message: 'Password changed successfully'});
};