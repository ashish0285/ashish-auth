import { firstLetterUppercase, IAuthBuyerMessageDetails, IAuthDocument, lowerCase } from '@ashish0285/ashish-job-shared';
import { config } from '@auth/config';
import { AuthModel } from '@auth/models/auth.model';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { sign } from 'jsonwebtoken';
import _ from 'lodash';
import { Model, Op } from 'sequelize';


export const createAuthUser = async (data: IAuthDocument): Promise<IAuthDocument> => {
    const result: Model = await AuthModel.create(data);
    //The created user should also be a buyer, so we need to publish it to buyer service
    const messageDetails: IAuthBuyerMessageDetails = {
        username: result.dataValues.username!,
        email: result.dataValues.email!,
        type: 'auth',
        country: result.dataValues.country!,
        profilePicture: result.dataValues.profilePicture!,
        createdAt: result.dataValues.createdAt!
    };
     await publishDirectMessage(
        authChannel,
        'ashish-buyer-update',
        'user-buyer',
        JSON.stringify(messageDetails),
        'Buyer details sent to buyer service' 
     );

     const userData: IAuthDocument = _.omit(result.dataValues, ['password']) as IAuthDocument;
     return userData;
};

export const getAuthUserById = async (authId: number): Promise<IAuthDocument> => {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where: {id: authId},
        attributes: {
            exclude: ['password']
        }
    }) as Model<IAuthDocument>;
    return user?.dataValues;
};

export const getAuthUserByUsernameOrEmail = async (username: string, email: string): Promise<IAuthDocument> => {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where: {
            [Op.or]: [{ username: firstLetterUppercase(username)}, {email: lowerCase(email)}]
        },
        attributes: {
            exclude: ['password']
        }
    }) as Model<IAuthDocument>;
    return user?.dataValues;
};

export const getAuthUserByUsername = async (username: string): Promise<IAuthDocument> => {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where: {
            username: firstLetterUppercase(username)
        }
    }) as Model<IAuthDocument>;
    return user?.dataValues;
};

export const getAuthUserByEmail = async (email: string): Promise<IAuthDocument> => {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where: {
            email: lowerCase(email)
        }
    }) as Model<IAuthDocument>;
    return user.dataValues;
};

export const getAuthUserByVerificationToken = async (token: string): Promise<IAuthDocument> => {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where: {
            emailVerificationToken: token
        },
        attributes: {
            exclude: ['password']
        }
    }) as Model<IAuthDocument>;
    return user.dataValues;
};

export const getAuthUserByPasswordToken = async (passwordtoken: string): Promise<IAuthDocument> => {
    const user: Model<IAuthDocument> = await AuthModel.findOne({
        where: {
            [Op.and]: [{passwordResetToken: passwordtoken}, {passwordResetExpires: {[Op.gt]: new Date()}}]
        }
    }) as Model<IAuthDocument>;
    return user.dataValues;
};

export const updateVerifyEmailField = async (authId: number, emailVerified: number, emailVerificationToken: string): Promise<void> => {
    await AuthModel.update(
        {
            emailVerified,
            emailVerificationToken
        },
        {where: { id: authId }},
        );
};

export const updatePasswordToken = async (authId: number, token: string, tokenExpiration: Date): Promise<void> => {
    await AuthModel.update(
        {
            passwordResetToken: token,
            passwordResetExpires: tokenExpiration
        },
        {where: { id: authId }},
        );
};

export const updatePassword = async (authId: number, password: string): Promise<void> => {
    await AuthModel.update(
        {
            password,
            passwordResetToken: '',
            passwordResetExpires: new Date()
        },
        {where: { id: authId }},
        );
};

export const signToken = (id: number, email: string, username: string): string => {
    return sign(
        {
        id,
        email,
        username
        },
        config.JWT_TOKEN!);
};