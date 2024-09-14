import { BadRequestError, IAuthDocument } from '@ashish0285/ashish-job-shared';
import { getAuthUserById, getAuthUserByVerificationToken, updateVerifyEmailField } from '@auth/services/auth.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const update = async( req: Request, res: Response): Promise<void> => {
    const { token } = req.body;
    const loggedUser: IAuthDocument = await getAuthUserByVerificationToken(token);

    if (!loggedUser) {
        throw new BadRequestError('Verification User is either Invalid or already used', 'VerifyEmail update() method');
    }

    await updateVerifyEmailField(loggedUser.id!, 1, '');
    const updatedUser = await getAuthUserById(loggedUser.id!);
    res.status(StatusCodes.OK).json({message: 'Email verified successfully.', user: updatedUser});
};