import "dotenv/config.js";

console.log("env: ", process.env.OPENAI_API_KEY)

if (
    !process.env.PINECONE_INDEX_NAME
    || !process.env.OPENAI_API_KEY) {
    throw new Error('Missing env variables');
}
console.log("configuration completed");