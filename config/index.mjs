import * as dotenv from 'dotenv'
dotenv.config()

if (
    !process.env.PINECONE_INDEX_NAME
    || !process.env.OPENAI_API_KEY) {
    throw new Error('Missing env variables');
}