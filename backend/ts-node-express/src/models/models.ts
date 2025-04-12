export interface User {   
  name: String
  email: String 
  Document: Document[]
  uid: string,
  password: string
}

export interface Document {
  id: number
  key: String
  size: number
  name: String
  user: User
  uid: String
}