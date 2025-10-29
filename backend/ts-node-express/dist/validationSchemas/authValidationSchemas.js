import { object, string } from 'yup';
const registerUserSchema = object({
    name: string().required(),
    email: string().required().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    password: string().required()
});
const loginUserSchema = object({
    email: string().required(),
    password: string().required()
});
export { registerUserSchema, loginUserSchema };
