import { Worker } from 'bullmq';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantClient } from "@qdrant/js-client-rest";
import { ChatOpenAI } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const key = "AIzaSyB2BqN_HUBqew-c3ACUKx9hhflH4-aE1T0";

const worker = new Worker('file-upload', async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const data = JSON.parse(job.data);

    //Load the PDF file
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    

    // Split the documents into chunks
    // const textSplitter = new CharacterTextSplitter({
    // chunkSize: 300,
    // chunkOverlap: 0,
    // });
    // const texts = await textSplitter.splitText(docs);
    // console.log(texts);
    
    // Create Vector embeddings from chunked documents


    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "text-embedding-004", // 768 dimensions
        apiKey: key,
    });

    console.log(embeddings);
    

    console.log(`Creating vector embeddings for documents...`);
    

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: 'http://localhost:6333',
        collectionName: "pdf-docs",
    });

    await vectorStore.addDocuments(docs);

    console.log(`Document vector store embeddings processed successfully.`);


}, { concurrency: 100, connection: { host: 'localhost', port: 6379 } });