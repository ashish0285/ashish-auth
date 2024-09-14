import * as crypto from 'crypto';

import { BadRequestError, firstLetterUppercase, IAuthDocument, IEmailMessageDetails, lowerCase, uploads } from '@ashish0285/ashish-job-shared';
import { signupSchema } from '@auth/schemas/signup';
import { createAuthUser, getAuthUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { v4 as uuidV4} from 'uuid';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';

export const create = async(req: Request, res: Response): Promise<void> => {
    const { error } = await Promise.resolve(signupSchema.validate(req.body));
   if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'SignUp create() method');
   }
   const { username, email, password, country, profilePicture } = req.body;
   const userExists: IAuthDocument = await getAuthUserByUsernameOrEmail(username, email);
   if (userExists){
    throw new BadRequestError('Invalid Credentials - Email or Username', 'SignUp create() method');
   }
   const profilePublicId = uuidV4();
   const uploadResult: UploadApiResponse = await uploads(profilePicture, profilePublicId, true, true) as UploadApiResponse;
   if(!uploadResult.public_id){
    throw new BadRequestError('File Upload Error. Try Again', 'SignUp create() method');
   }
   const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
   const randomCharacters: string = randomBytes.toString('hex');
   const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password,
    country,
    profilePicture: uploadResult?.secure_url,
    emailVerificationToken: randomCharacters
   } as IAuthDocument;
   const result: IAuthDocument = await createAuthUser(authData);
   const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;
   const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
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
   const userJWT = signToken(result.id!, result.email!, result.username!);
   res.status(StatusCodes.CREATED).json({message: 'User Created Successfully', user: result, token: userJWT});
};