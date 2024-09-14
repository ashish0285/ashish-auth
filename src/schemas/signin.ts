import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
    username: Joi.alternatives().conditional(Joi.string().email(),{
        then: Joi.string().email().required().messages({
            'string.base': 'Email must be of type string',
            'string.email': 'Invalid Email',
            'string.empty': 'Email is a required field'
        }),
        otherwise: Joi.string().min(4).max(12).required().messages({
            'string.base': 'Username must be of type string',
            'string.min': 'Min 4 characters are required in username.',
            'string.max': 'Max 12 characters are required in username.',
            'string.empty': 'Username is a required field'
        })
    }),
    password: Joi.string().min(4).max(12).required().messages({
        'string.base': 'Password must be of type string',
        'string.min': 'Min 4 characters are required in password.',
        'string.max': 'Max 12 characters are required in password.',
        'string.empty': 'Password is a required field'
       })
});

export { loginSchema };