1. setup vector db - kind of done with this need to research about indexes

2. use docker to dockerize this application

3. workout the pdf upload embedding flow

user upload pdf ----> pdf is uploaded to queue and taskConsumers handle upload to s3 ----> on success of this task the pdf is then converted into a db entry ------> chunk the pdf file ------> map over every chunk to get the openaiembeddings and store these embeddings as entry in the document chunk table. We then get the id of the document db entry and link the chunks with the docuement