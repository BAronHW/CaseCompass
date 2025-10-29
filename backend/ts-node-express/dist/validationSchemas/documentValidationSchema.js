import { number, object, string } from "yup";
const getAllDocumentsValidationSchema = object({
    name: string().required(),
    size: number().required(),
    file: string().required()
});
const getDocumentByIdValidationSchema = object({
    documentId: number().required()
});
