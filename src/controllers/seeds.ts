import * as crypto from 'crypto';

import { BadRequestError, firstLetterUppercase, IAuthDocument, lowerCase } from '@ashish0285/ashish-job-shared';
import { createAuthUser, getAuthUserByUsernameOrEmail } from '@auth/services/auth.service';
import { faker } from '@faker-js/faker';
import { Request, Response } from 'express';
import { v4 as uuidV4} from 'uuid';
import { generateUsername } from 'unique-username-generator';
import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';


export const create = async(req: Request, res: Response): Promise<void> => {
    const { count } = req.params;
    const usernames: string[] = [];
    for(let i=0; i< parseInt(count, 10); i++) {
        const username: string = generateUsername('', 0, 12);
        usernames.push(firstLetterUppercase(username));
    }
    for( const user_name of usernames) {
        const email = faker.internet.email();
        const password = 'qwerty';
        const country = faker.location.country();
        const profilePicture = faker.image.urlPicsumPhotos();
        const userExists: IAuthDocument = await getAuthUserByUsernameOrEmail(user_name, email);
        if (userExists){
            throw new BadRequestError('Invalid Credentials - Email or Username', 'SignUp create() method');
        }
        const profilePublicId = uuidV4();
        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacters: string = randomBytes.toString('hex');
        const authData: IAuthDocument = {
            username: firstLetterUppercase(user_name),
            email: lowerCase(email),
            profilePublicId,
            password,
            country,
            profilePicture,
            emailVerificationToken: randomCharacters,
            emailVerified: _.sample([0, 1])
           } as IAuthDocument;
        await createAuthUser(authData);
    }
    res.status(StatusCodes.OK).json({ message: 'Seed users created successfully'});

};