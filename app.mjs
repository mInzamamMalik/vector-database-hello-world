
import { PineconeClient } from "@pinecone-database/pinecone";


try {



    const pinecone = new PineconeClient();
    await pinecone.init({
        environment: "us-west4-gcp-free",
        apiKey: "93599b12-5af6-4bfa-954d-3ddca1d73aa4",
    });


    // // can also be created form pine cone dashboard
    // console.log(
    //     await pinecone.createIndex({
    //         createRequest: {
    //             name: "example-index",
    //             dimension: 1024,
    //         },
    //     })
    // )


    const index = pinecone.Index("example-index");
    const upsertRequest = {
        vectors: [
            {
                id: "vec1",
                values: [0.1, 0.2, 0.3, 0.4],
                metadata: {
                    genre: "drama",
                },
            },
            {
                id: "vec2",
                values: [0.2, 0.3, 0.4, 0.5],
                metadata: {
                    genre: "action",
                },
            },
        ],
        namespace: "example-namespace",
    };
    const upsertResponse = await index.upsert({ upsertRequest });
    console.log("upsertResponse: ", upsertResponse);



} catch (error) {
    console.log("error: ", error);
}