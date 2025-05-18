export interface UserWithPassword {
  id: number;
  name: string | null;
  email: string;
  password: string;
  uid: string;
}
export interface UserWithoutPassword {
  id: number;
  name: string | null;
  email: string;
  uid: string;
}
export interface Document {
  id: number
  key: String
  size: number
  name: String
  user: UserWithPassword
  uid: String
}
export interface PDF {
  id: number
  pdfBuffer: Buffer
  metaData: string
}