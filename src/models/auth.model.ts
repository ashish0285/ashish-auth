import { IAuthDocument } from '@ashish0285/ashish-job-shared';
import { sequelize } from '@auth/database';
import { compare, hash } from 'bcrypt';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';

const SALT_ROUND = 10; 

interface AuthModelInstanceMethod  extends Model{
    prototype: {
        comparePassword: (a: string, b: string) => Promise<boolean>,
        hashPassword: (a: string) => Promise<string>
    }
}

type AuthUserCreationAttrbutes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>;

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttrbutes> & AuthModelInstanceMethod = sequelize.define('auth', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePublicId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Date.now
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now
    }
},{
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['emailVerificationToken']
        },
        {
            unique: true,
            fields: ['passwordResetToken']
        }
    ]
}) as ModelDefined<IAuthDocument, AuthUserCreationAttrbutes> & AuthModelInstanceMethod;

AuthModel.addHook('beforeCreate', async(auth: Model) => {
    const hashedPassword: string = await hash(auth.dataValues.password, SALT_ROUND);
    auth.dataValues.password = hashedPassword;
});


AuthModel.prototype.comparePassword = async function(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
};

AuthModel.prototype.hashPassword = async function(password: string): Promise<string> {
    return await hash(password, SALT_ROUND);
};

// create table don't add force: true alway drops table and creates a new one when server starts
if (process.env.NODE_ENV !== 'test' ) {
    AuthModel.sync({});
}
export { AuthModel };