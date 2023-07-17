
import { PineconeClient } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from "openai";
import './config/index.mjs';
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
import questions from './data/questions.json' assert {type: 'json'};


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


try {

    const pinecone = new PineconeClient();
    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT,
        apiKey: process.env.PINECONE_API_KEY,
    });


    // // will always be created form pine cone dashboard, 
    // // it takes so much time like hours to initialize, 
    // //maybe because of free version

    // console.log(
    //     await pinecone.createIndex({
    //         createRequest: {
    //             name: process.env.PINECONE_INDEX_NAME,
    //             dimension: 1536,
    //         },
    //     })
    // )


    const insertSingleDocumentIntoPinecone = async () => {
        // since pine cone can only store data in vector form (numeric representation of text)
        // we will have to convert text data into vector of a certain dimension (1536 in case of openai)
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: "The food was delicious and the waiter...",
        });
        const vector = response?.data?.data[0]?.embedding
        console.log("vector: ", vector);
        // [ 0.0023063174, -0.009358601, 0.01578391, ... , 0.01678391, ]


        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        const upsertRequest = {
            vectors: [
                {
                    id: "vec1", // unique id
                    values: vector,
                    metadata: {
                        genre: "drama",
                    },
                },
                // {
                //     id: "vec2",
                //     values: [0.2, 0.3, 0.4, 0.5],
                //     metadata: {
                //         genre: "action",
                //     },
                // },
            ],
            namespace: process.env.PINECONE_NAME_SPACE,
        };
        const upsertResponse = await index.upsert({ upsertRequest });
        console.log("upsertResponse: ", upsertResponse);
    }
    // insertSingleDocumentIntoPinecone()



    const insertMultipleDocumentIntoPinecone = async () => {

        const allQuestionEmbeddingRequests = questions.map((eachQuestion, index) => {
            return openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: `!!! question: ${eachQuestion.question} ### answer:${eachQuestion.answer} $$$`.trim().replaceAll('\n', ' ') // removing all line breaks
            });
        })
        console.log("converting all questions into vector with openai embedding... please wait");
        const allQuestionsVector = await Promise.all(allQuestionEmbeddingRequests)

        const upsertRequest = {
            vectors: [
                // {
                //     id: nanoid(), // unique id
                //     values: vector,
                //     metadata: {
                //         genre: "drama",
                //     },
                // }
            ],
            namespace: process.env.PINECONE_NAME_SPACE,
        };

        allQuestionsVector.map(eachVectorResponse => {

            const originalText = JSON.parse(eachVectorResponse.config.data).input
            const vectorRepresentation = eachVectorResponse?.data?.data[0]?.embedding

            console.log("originalText: ", originalText);
            console.log("vectorRepresentation: ", vectorRepresentation);

            upsertRequest.vectors.push({
                id: "vec1", // unique id
                values: vectorRepresentation,
                metadata: {
                    originalText: originalText,
                },
            },)

        })

        console.log("inserting all vectors into pinecone vector database... please wait");

        const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
        const upsertResponse = await index.upsert({ upsertRequest });
        console.log("upsertResponse: ", upsertResponse);

    }
    insertMultipleDocumentIntoPinecone();





} catch (error) {
    console.log("error: ", error);
}