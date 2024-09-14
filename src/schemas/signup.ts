import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
   username: Joi.string().min(4).max(12).required().messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Min 4 characters are required in username.',
    'string.max': 'Max 12 characters are required in username.',
    'string.empty': 'Username is a required field'
   }),
   password: Joi.string().min(4).max(12).required().messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Min 4 characters are required in password.',
    'string.max': 'Max 12 characters are required in password.',
    'string.empty': 'Password is a required field'
   }),
   country: Joi.string().required().messages({
    'string.base': 'Country must be of type string',
    'string.empty': 'Country is a required field'
   }),
   email: Joi.string().email().required().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Invalid Email',
    'string.empty': 'Email is a required field'
   }),
   profilePicture: Joi.string().required().messages({
    'string.base': 'ProfilePicture must be of type string',
    'string.empty': 'ProfilePicture is a required field'
   }), 
});

export { signupSchema };