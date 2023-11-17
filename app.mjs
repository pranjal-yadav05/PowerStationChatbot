import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fileUpload from 'express-fileupload';
import pdfParse from 'pdf-parse';
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from '@huggingface/inference'
import { userInfo } from 'os';
import axios from 'axios';

const hf = new HfInference(); //'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'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

const pinecone = new Pinecone({
  apiKey: "ce69a670-17ad-4b42-9c28-daf11aed9d99",
  environment: "gcp-starter",
});
const index = pinecone.Index("powerai");
const model = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

function splitTextIntoChunks(text, chunkSize, overlapSize) {
  const chunks = [];
  const textLength = text.length;

  for (let i = 0; i < textLength; i += chunkSize - overlapSize) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
}

app.post('/process-input', async (req, res) => {
  const userInput = req.body.userInput;
  let array = []
  // res.send(`You entered: ${userInput}`);
  const queryVector = await model.embedQuery(userInput);
  const queryResults = await index.query({
    vector: queryVector,
    topK: 5, // Number of top results to return
  });
  // for(let i=0;i<queryResults.matches.length;i++){
  //   array[i] = chunks[queryResults.matches[i].id[1]];
  //   console.log( chunks[queryResults.matches[i].id[1]]);
  // }
  console.log(queryResults);
  var context = chunks[queryResults.matches[0].id]
  if(queryResults.matches[0].score < 0.55){
    context += chunks[queryResults.matches[1].id];
  }

  const output = await hf.questionAnswering({
    model: 'deepset/roberta-large-squad2',
    inputs: {
      question: userInput,
      context: context
    }
  })
  
  res.send("user input: "+userInput+"------------------------ context "+ context +"--------------------- result: " +output.answer);
  // res.send(answer);
});

var chunks = []

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const pdfFile = req.files.pdf;
    const pdfData = await pdfParse(pdfFile.data);

    // You can now access the text content of the PDF in pdfData.text

    // res.json({ text: pdfData.text });
    chunks = splitTextIntoChunks(pdfData.text,1000,200);
    // res.send("done chunking");
    // await uploadtodb(chunks);
    console.log("\n done uploading\n");
    // res.send("uploaded");
    // res.json({ text : chunks.length + "\n ------------ \n" + chunks[6] + "\n ------------ \n" + chunks[7]});
    res.sendFile(__dirname + '/user-input-form.html');
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
