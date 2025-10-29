import { object, string } from "yup";
const findUserByUidValidationSchema = object({
    uuid: string().required()
});
export { findUserByUidValidationSchema };
