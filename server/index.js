import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import OpenAI from "openai";

const queue = new Queue("file-upload");

// hitting the gemini API using OpenAI client
const client = new OpenAI({
  apiKey: "AIzaSyB2BqN_HUBqew-c3ACUKx9hhflH4-aE1T0",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Welcome to the API PDF CHAT!");
});

app.post("/upload/pdf", upload.single("pdf"), (req, res) => {
  queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );

  res.json({
    message: "PDF uploaded successfully",
  });
});

app.get("/chat", async (req, res) => {
  const userQuery = "What is react in detail?";

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // 768 dimensions
    apiKey: "AIzaSyB2BqN_HUBqew-c3ACUKx9hhflH4-aE1T0",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "pdf-docs",
    }
  );

  const ret = vectorStore.asRetriever({ k: 2 });
  const result = await ret.invoke(userQuery);

  const SYSTEM_PROMPT = `You are a helpful assistant. You will be provided with context from a PDF document. Use this context to answer the user's question. ${JSON.stringify(
    result
  )}`;

  const chatResponse = await client.chat.completions.create({
    model: "gemini-2.5-flash-preview-05-20",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
  });

  return res.json({
    message: chatResponse.choices[0].message.content,
    docs: result,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
