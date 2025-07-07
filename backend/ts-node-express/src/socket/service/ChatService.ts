/**
 * TODO:
 * 1. pass the existing jwt to from front-end to the socket.io when sending message
 * 2. verify the jwt if its okay let it pass if not throw error
 * 3. when sending message do db query to find the chat that the message belongs to by looking for chats witht he userId
 * 4. create new message and attach it to the chat that you found
 * 5. if the message body is a question activate the RAG feature and do cosine similarity search on the body then return relavent details
 * 6. if not a question after the message is sent pass the body to llm and generate the response
 */