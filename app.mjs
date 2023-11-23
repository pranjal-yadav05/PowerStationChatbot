  import express from 'express';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { dirname } from 'path';
import fileUpload from 'express-fileupload';
import pdfParse from 'pdf-parse';
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from '@huggingface/inference'
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import OpenAI from 'openai';
import path from 'path';
import { ChatOpenAI } from "langchain/chat_models/openai";
// import { HumanMessage, SystemMessage } from "langchain/schema";

const hf = new HfInference(); //'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'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var username;
const app = express();
const port = 3000;

const pinecone = new Pinecone({
  // apiKey: "ce69a670-17ad-4b42-9c28-daf11aed9d99",
  apiKey: '0f629be8-9909-4c3c-8b0f-20d4e5322ced',
  environment: "gcp-starter",
});
const index = pinecone.Index("sample");

const model = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('public', { 'extensions': ['html'] }));
app.use('/public/**/*.css', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
});

app.get('/', (req, res) => {
  res.send("Server Running........");
});


function splitTextIntoChunks(text, chunkSize, overlapSize) {
  const chunks = [];
  const textLength = text.length;

  for (let i = 0; i < textLength; i += chunkSize - overlapSize) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}

app.post("/process-input", async (req, res) => {
  username = (await axios.get("http://localhost:3001/session")).data;
  username = username.data;
  console.log(username)

  // const userInput = req.body.userInput;
  // const queryVector = await model.embedQuery(userInput);
  // const queryResults = await index.query({
  //   vector: queryVector,
  //   topK: 5, // Number of top results to return
  // });
  // console.log(queryResults);
  // var context = chunks[queryResults.matches[0].id];
  // if (queryResults.matches[0].score < 0.55) {
  //   context += chunks[queryResults.matches[1].id];
  // }

  // const llm = OpenAI(OPENAI_API_KEY = "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",temperature = 0.7)
  // const memory = ConversationBufferMemory()
  // const chain = ConversationChain(
  //   prompt =
  //   llm = llm,
  //   verbose = true,
  //   memory = memory
  // )
  
  // const chat = new ChatOpenAI({
  //   openAIApiKey: "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",
  // });

  // const response = await chat.call([
  //   new SystemMessage(
  //     `Your task is to generate response only from the given context:${context}`
  //   ),
  //   new HumanMessage(userInput),
  // ]);
  // res.send(response.content);
  // console.log(response);
  // res.send(response.conte);
});
var chunks = []

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const pdfFile = req.files.pdf;
    const pdfData = await pdfParse(pdfFile.data);
    console.log("before splitting");
    // res.json({ text: pdfData.text });
    
    
    chunks = splitTextIntoChunks(pdfData.text, 1000, 0);
    console.log("created chunks", chunks);
    
    // axios.post("http://localhost:3001/insert-chunks", {
    //   chunks : chunks
    // })
    // .then((response) => {
    //   console.log(response);
    // });
    await uploadtodb(chunks);
    res.send({message:'uploaded the file to database.'});
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// const arr = ['The quick brown fox jumps over the lazy dog','The lazy dog lies in the sun','The quick brown fox is a furry animal','I love to eat pizza','Pizza is my favorite food','I hate pizza','The sky is blue','The grass is green','The sun is yellow'];
async function uploadtodb(chunks){
  const embed = [];
  const arr = chunks;
  var i = 0;
  console.log(chunks.length)
  // await pinecone.index('powerai').deleteAll();
  for(i=0;i<chunks.length;i++){
    embed[i] = {id:i+"",values: await model.embedQuery(arr[i])};    
  }
  index.upsert(embed);
}
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



