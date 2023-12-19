import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import mysql from "mysql";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import nodemailer from "nodemailer";
import cors from "cors";
import { error } from "console";
import multer from "multer";
import authRoutes from "./routes/auth.js";
import { Pinecone } from "@pinecone-database/pinecone";
import protectedRoutes from "./routes/protected.js";
import jwt from "jsonwebtoken";
import { OpenAI } from "langchain/llms/openai";
import { secret, expiresIn } from "./jwtConfig.js";
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { BufferWindowMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
// import { PromptTemplate } from "langchain/prompts";
import {
  ChatPromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
  AIMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import { AIMessage, HumanMessage, SystemMessage } from "langchain/schema";
import {
  FewShotPromptTemplate,
  FewShotChatMessagePromptTemplate,
} from "langchain/prompts";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("public", { extensions: ["html"] }));

app.use("/auth", authRoutes);

// Include protected routes
app.use("/protected", protectedRoutes);

// const MySQLStoreInstance = new MySQLStore(session);

const pinecone = new Pinecone({
  apiKey: "YOUR_API_KEY", // b85bf359-ca2e-4d0a-b78e-25a41b9af846
  // apiKey: '0f629be8-9909-4c3c-8b0f-20d4e5322ced',
  environment: "gcp-starter",
});

const index = pinecone.Index("powerai");

const model = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2",
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "yadavpranjal2105@gmail.com",
    pass: "czdc yria vnxq oqbu",
  },
});

const connection = mysql.createConnection({
  // host: 'sql12.freesqldatabase.com',
  // user: 'sql12662951',
  // password: 'Nf7RPVbCWD',
  // database: 'sql12662951'
  host: "localhost",
  user: "root",
  password: "",
  database: "powerai",
});

const db = connection;

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + connection.threadId);
});

app.get("/", (req, res) => {
  res.send("database is running....");
});

app.get("/login", (req, res) => {
  const message = req.query.message || "";
  res.sendFile(__dirname + "/login.html");
});

app.get("/session-status", (req, res) => {
  if (req.session.username) {
    console.log("User is logged in:", req.session.username);
    res.send({
      username: req.session.username,
      accesstype: req.session.accesstype,
      authenticated: true,
    });
  } else {
    console.log("User is not logged in");
    res.send({
      username: undefined,
      accesstype: undefined,
      authenticated: false,
    });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Signup route
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/forgot-password", (req, res) => {
  const username = req.body.username;
  const otp = generateOTP();

  const checkUserQuery = `SELECT email FROM logininfo WHERE username = (?)`;
  connection.query(checkUserQuery, [username], (Error, result) => {
    if (Error) {
      res.status(500).send("Error in checking user");
      return;
    }

    if (result.length == 0) {
      res.send("No User found. Please Check the Username again.");
      return;
    }
    const email = result[0].email;
    console.log(result[0].email);
    const query = `INSERT INTO otp (username, otp) VALUES (?,?)`;
    connection.query(query, [username, otp], (error, results) => {
      if (error) {
        res.status(500).send("Error in query");
        return;
      }

      const mailOptions = {
        from: "yadavpranjal2105@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending OTP email:", error);
          return res.status(500).send("Error sending OTP email.");
        }

        res.status(200).send("OTP sent successfully.");
      });
    });
  });
});

app.post("/change-password", (req, res) => {
  const otp = req.body.otp;
  const email = req.body.email;
  const pass = req.body.newPassword;

  const query2 = `DELETE FROM otp WHERE otp = (?)`;
  connection.query(query2, [otp], (err, result) => {
    if (err) {
      res.status(500).send("error deleting otp");
      return;
    }

    const query = `UPDATE logininfo SET password = (?) WHERE email = (?) `;
    bcrypt.hash(pass, 10, (hashError, hash) => {
      if (hashError) {
        console.error("Error hashing password: " + hashError.stack);
        res.status(500).send("Error creating user");
        return;
      }
      connection.query(query, [hash, email], (error, results) => {
        if (error) {
          console.log("error in query to change pass : " + error);
          res.status(500).send("error in query");
          return;
        }
        res.send("success");
      });
    });
  });
});

app.get("/verify/:username", (req, res) => {
  const email = req.params.username;
  const query = "SELECT otp FROM otp WHERE username = ?";

  connection.query(query, [email], (error, results) => {
    if (error) {
      res.status(500).send("Error in query");
      return;
    }

    if (results.length === 0) {
      console.log("Send OTP first.");
      res.status(400).send("OTP not found for the provided username.");
      return;
    }

    const otpFromDatabase = results[0].otp;
    res.send({ otp: otpFromDatabase });
  });
});

var username;

app.get("/logout/:username", (req, res) => {
  const { username } = req.params;
  const query = `UPDATE relation SET status = ? WHERE belongs = ?`;
  connection.query(query, ["Offline", username], (error, results) => {
    if (error) {
      console.error("Error in database query: " + error.stack);
      res.send([{ belongs: "Error in database query" }]);
      return;
    }
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          res.status(500).send("Error destroying session");
        } else {
          console.log("Logout success");
          res.send([{ belongs: "Logout successful" }]);
        }
      });
    } else {
      // Handle the case where req.session is undefined
      console.error("Session not found");
      res.status(500).send("Session not found");
    }
  });
});

app.get("/employees/:adminUsername", (req, res) => {
  const { adminUsername } = req.params;

  const query = `SELECT belongs,status FROM relation WHERE authority = ?`;

  connection.query(query, [adminUsername], (error, results) => {
    if (error) {
      console.error("Error in database query: " + error.stack);
      res.send([{ belongs: "Error in database query" }]);
      return;
    }
    if (results.length === 0) {
      res.send([{ belongs: "no data to show" }]);
      return;
    }

    res.send(results);
  });
});

app.post("/login", (req, res) => {
  const inputUsername = req.body.userId;
  const password = req.body.password.trim();

  const query = `SELECT * FROM logininfo WHERE username = ?`;
  connection.query(query, [inputUsername], (error, results) => {
    if (error) {
      console.error("Error in database query: " + error.stack);
      res.send({ message: "Error in database query" });
      return;
    }

    if (results.length === 0) {
      res.send({ message: "User not found" });
      return;
    }

    const storedPassword = results[0].password;

    bcrypt.compare(password, storedPassword, (err, result) => {
      console.log("Input Password:", password);
      console.log("Stored Password:", storedPassword);
      console.log("Compare Result:", result);

      if (err) {
        console.error("Error comparing passwords:", err);
        res.send({ auth: false, message: "Error comparing passwords:" });
      } else if (result) {
        // req.session.username = results[0].username;
        // req.session.accesstype = results[0].accesstype;
        // console.log('After setting session variables:', req.session.username, req.session.accesstype);
        const token = jwt.sign(
          {
            auth: true,
            username: results[0].username,
            accesstype: results[0].accesstype,
          },
          secret,
          { expiresIn }
        );
        const query2 = `UPDATE relation SET status = ? WHERE belongs = ?`;
        connection.query(
          query2,
          ["Online", inputUsername],
          (queryError, results) => {
            if (queryError) {
              console.log("error in status query");
              res.status(500).send("Error putting status of user");
              return;
            }
            res.json({ token });
          }
        );
      } else {
        res.send({ auth: false, message: "invalid credentials." });
      }
    });
  });
});

app.post("/add-employee", async (req, res) => {
  const username = req.body.empUserName;
  const email = req.body.empEmail;
  const password = req.body.password;
  const admin = req.body.loggedInAdmin;
  console.log(" INFO : " + email + " " + password + " " + admin);
  const checkUserQuery = "SELECT * FROM logininfo WHERE username = ?";
  connection.query(checkUserQuery, [username], (checkError, results) => {
    if (checkError) {
      console.error("Error checking user existence: " + checkError.stack);
      res.status(500).send("Error checking user existence");
      return;
    }

    // If the username already exists, send a message to the client
    if (results.length > 0) {
      res.send({ message: "username already exists." });
      return;
    }

    const query2 = `SELECT * FROM logininfo WHERE email = ?`;
    connection.query(query2, [email], (error, result) => {
      if (error) {
        res.status(500).send("Error finding email query");
        return;
      }

      if (result.length > 0) {
        res.send({ message: "email already exists for a user." });
        return;
      }

      bcrypt.hash(password, 10, (hashError, hash) => {
        if (hashError) {
          console.error("Error hashing password: " + hashError.stack);
          res.status(500).send("Error creating user");
          return;
        }
        const query = `INSERT INTO logininfo (username, password, accesstype,email) VALUES(?,?,?,?)`;
        console.log("hashed : " + hash);
        connection.query(
          query,
          [username, hash, "emp", email],
          (insertError) => {
            if (insertError) {
              console.error(
                "Error inserting user into database: " + insertError.stack
              );
              res.status(500).send("Error creating user");
              return;
            }
          }
        );
        const adminQuery = `INSERT INTO relation (authority,belongs,status) VALUES(?,?,?)`;
        connection.query(
          adminQuery,
          [admin, username, "never used"],
          (insertError) => {
            if (insertError) {
              console.error(
                "Error inserting user into database: " + insertError.stack
              );
              res.status(500).send("Error creating user");
              return;
            }

            // Redirect to login page with a success message
            res.send({ message: "Employee Added", status: true });
          }
        );
      });
    });
  });
});

app.post("/delete-employee", (req, res) => {
  const username = req.body.empUserName;
  const loggedin = req.body.loggedin;

  // const query = `SELECT username FROM logininfo WHERE `

  const delQuery = `DELETE FROM logininfo WHERE username = (?)`;
  connection.query(delQuery, [username], (error, results) => {
    if (error) {
      console.error("Error in query: " + checkError.stack);
      res.send({ message: "Error in query" });
      return;
    }
    if (results.affectedRows === 0) {
      res.send({ message: "no user found with username : " + username });
      return;
    }
    const query = `DELETE FROM relation WHERE belongs = (?)`;
    connection.query(query, [username], (error, results) => {
      if (error) {
        console.error("Error in second query: " + checkError.stack);
        res.send({ message: "Error in second query" });
        return;
      }
      res.send({ message: " deletion done" });
    });
  });
});

app.post("/add-admin", async (req, res) => {
  const username = req.body.admUserName;
  const password = req.body.password;
  const gov = req.body.loggedInGov;
  const checkUserQuery = "SELECT * FROM logininfo WHERE username = ?";
  connection.query(checkUserQuery, [username], (checkError, results) => {
    if (checkError) {
      console.error("Error checking user existence: " + checkError.stack);
      res.status(500).send("Error checking user existence");
      return;
    }

    // If the username already exists, send a message to the client
    if (results.length > 0) {
      res.send({ message: "username already exists." });
      return;
    }
    bcrypt.hash(password, 10, (hashError, hash) => {
      if (hashError) {
        console.error("Error hashing password: " + hashError.stack);
        res.status(500).send("Error creating user");
        return;
      }
      const query = `INSERT INTO logininfo (username, password, accesstype) VALUES(?,?,?)`;
      console.log("hashed : " + hash);
      connection.query(query, [username, hash, "loc"], (insertError) => {
        if (insertError) {
          console.error(
            "Error inserting user into database: " + insertError.stack
          );
          res.status(500).send("Error creating user");
          return;
        }
        const adminQuery = `INSERT INTO relation (authority, belongs, status) VALUES(?,?,?)`;
        connection.query(
          adminQuery,
          [gov, username, "never used"],
          (insertError) => {
            if (insertError) {
              console.error(
                "Error inserting user into database: " + insertError.stack
              );
              res.status(500).send("Error creating user");
              return;
            }

            // Redirect to login page with a success message
            res.send({ message: "Admin Added", status: true });
            return;
          }
        );
      });
    });
  });
});

app.post("/answer", async (req, res) => {
  const inp = req.body.input;
  res.send({ aa: inp + " i am AI" });
});

// app.use((req, res, next) => {
//   req.session.username = username; // Set a session variable (replace with your logic)
//   next();
// });

app.post("/insert-chunks", (req, res) => {
  // console.log('Received request with body:', req.body);
  let chunks = req.body.chunks;
  if (chunks) {
    const insertQuery =
      "INSERT INTO chunks (adminid, chunkid, chunk) VALUES (?, ?, ?)";

    db.query("START TRANSACTION");
    chunks.forEach((chunk, index) => {
      db.query(insertQuery, [username, index, chunk], (err, result) => {
        if (err) {
          console.error("Error inserting chunk:", err);
          db.query("ROLLBACK");
          return res.status(500).json({ error: "Internal server error" });
        }
      });
    });

    db.query("COMMIT", () => {
      res.json({ message: "Chunks inserted successfully!" });
    });
  } else {
    res.status(400).json({ error: "Chunks not found in the request body." });
  }
});

app.post("/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the username already exists
  const checkUserQuery = "SELECT * FROM logininfo WHERE username = ?";
  connection.query(checkUserQuery, [username], (checkError, results) => {
    if (checkError) {
      console.error("Error checking user existence: " + checkError.stack);
      res.status(500).send("Error checking user existence");
      return;
    }

    // If the username already exists, send a message to the client
    if (results.length > 0) {
      res.send("Username already exists. Please choose another username.");
      return;
    }

    // If the username doesn't exist, proceed with inserting the new user
    bcrypt.hash(password, 10, (hashError, hash) => {
      if (hashError) {
        console.error("Error hashing password: " + hashError.stack);
        res.status(500).send("Error creating user");
        return;
      }

      const insertQuery =
        "INSERT INTO logininfo (username, password) VALUES (?, ?)";
      connection.query(insertQuery, [username, hash], (insertError) => {
        if (insertError) {
          console.error(
            "Error inserting user into database: " + insertError.stack
          );
          res.status(500).send("Error creating user");
          return;
        }

        // Redirect to login page with a success message
        const message = "Signup successful! You can now log in.";
        res.redirect(`/login?message=${encodeURIComponent(message)}`);
      });
    });
  });
});

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for handling file as Buffer
const upload = multer({ storage });

app.post("/uploadProfilePic", upload.single("profilePic"), (req, res) => {
  // Access the file via req.file.buffer
  const profilePicBuffer = req.file.buffer;

  // Access the username from req.body
  const username = req.body.username;

  // Save the profilePicBuffer to the 'profilepic' column in the 'logininfo' table
  const query = "UPDATE logininfo SET profilepic = ? WHERE username = ?";

  db.query(query, [profilePicBuffer, username], (err, results) => {
    if (err) {
      console.error("Error updating profile picture:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Respond with a success message
    res.status(200).json({ message: "Profile picture uploaded successfully!" });
  });
});

app.get("/profilePic/:username", (req, res) => {
  const username = req.params.username;
  // Retrieve the profile picture data from the 'profilepic' column in the 'logininfo' table
  const query = "SELECT profilepic FROM logininfo WHERE username = ?";

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error retrieving profile picture:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0 || !results[0].profilepic) {
      // If no profile picture found, you can send a default image or a placeholder
      return res.sendFile(path.join(__dirname, "default-profile-pic.png"));
    }

    // Send the profile picture data as a response
    res.setHeader("Content-Type", "image/jpeg"); // Adjust the content type based on your image format
    res.send(results[0].profilepic);
  });
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

var context = "global : ";
import { promisify } from "util";

const queryAsync = promisify(connection.query).bind(connection);

async function get_chunck(username, queryResults) {
  const chunks = [];
  for (let i = 0; i < 2; i++) {
    const query = `SELECT chunk FROM chunks WHERE chunkid = (?) AND adminid IN (SELECT authority FROM relation WHERE belongs = (?)) `;
    try {
      const results = await queryAsync(query, [
        queryResults.matches[i].id,
        username,
      ]);
      if (results.length > 0) {
        chunks.push(results[0].chunk);
      }
    } catch (err) {
      console.error("Error in query:", err);
      throw err;
    }
  }
  return chunks.join("");
}

const openai_model = new OpenAI({
  openAIApiKey: "YOUR_API_KEY",
  temperature: 0.7,
});

var CHAT_HISTORY = new BufferWindowMemory({
  k: 3,
});

var CHAIN = new ConversationChain({
  llm: openai_model,
  memory: CHAT_HISTORY,
});

const promptTemplate = PromptTemplate.fromTemplate(
  "You are a Lead Substation Maintenance Technician that only answers technical queries related to electrical engineering and power substation maintenance procedures in a sophisticated format by refering to the given context, context and query delimited by triple back ticks. Politely refuse to provide answer in humorous manner if the question is not related to the  given context:```{prompt_context}``` query:```{inp}```"
);

const troubleshootTemplate = PromptTemplate.fromTemplate(
  "If the query requires troubleshooting:\nFirstly identify the type of equipment(s) that require troubleshooting from the following query which is delimited by triple backticks.\nProvide the identified equipment(s) in one or two words.\nProvide a step-by-step guide for troubleshooting the issue in a substation.\nStart with the initial checks and proceed systematically.\nQuery: ```{userQuery}```"
);

// Prompt Templates ...

app.post("/process-input", async (req, res) => {
  const userInput = req.body.input;
  const username = req.body.username;
  const queryVector = await model.embedQuery(userInput);
  const queryResults = await index.query({
    vector: queryVector,
    topK: 5, // Number of top results to return
  });

  context = await get_chunck(username, queryResults);

  const final_prompt = await promptTemplate.format({
    prompt_context: context,
    inp: userInput,
  }) + await troubleshootTemplate.format({
    userQuery: userInput,
  });

  let llm_res = await CHAIN.call({
    input: final_prompt,
  });

  res.send(llm_res.response);
  return;
});
var chunks = [];+

app.post("/upload", async (req, res) => {
  try {
    // Access the file buffer
    const pdfBuffer = req.file.buffer;

    // Parse the PDF content
    const pdfData = await pdfParse(pdfBuffer);

    // Extract text from the parsed PDF data
    const pdfText = pdfData.text;

    chunks = splitTextIntoChunks(pdfText, 1000, 200);

    // await uploadtodb(chunks);  upload to pinecone

    // const response = await axios.post('http://localhost:3001/insert-chunks',{chunks:chunks})
    // console.log(response.data.message)

    res
      .status(200)
      .json({ success: true, message: "PDF successfully processed" });
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// const arr = ['The quick brown fox jumps over the lazy dog','The lazy dog lies in the sun','The quick brown fox is a furry animal','I love to eat pizza','Pizza is my favorite food','I hate pizza','The sky is blue','The grass is green','The sun is yellow'];
async function uploadtodb(chunks) {
  const embed = [];
  const arr = chunks;
  var i = 0;
  console.log(chunks.length);
  // await pinecone.index('powerai').deleteAll();
  for (i = 0; i < chunks.length; i++) {
    embed[i] = { id: i + "", values: await model.embedQuery(arr[i]) };
  }
  index.upsert(embed);
}

app.post('/addmessages',(req,res)=>{
  const username = req.body.username;
  const question = req.body.question;
  const answer = req.body.answer;

  const query = `INSERT INTO chats(username, question, answer) VALUES (?,?,?)`;
  connection.query(query,[username,question, answer], (err,result)=>{
    if(err) { res.send('error in query'); return;}
    res.send('Inserted into messages');
  })
})

app.get('/getmessages/:username',(req,res)=>{
  const username = req.params.username;
  // console.log(username)
  const query = `SELECT question, answer FROM chats WHERE username = (?) ORDER BY chatid DESC LIMIT 5`;
  connection.query(query,[username], (err,result)=>{
    if(err) { res.send('error in query'); return;}
    result.reverse();
    res.send(result);
  })
})

app.post('/testgen',(req,res)=>{
  const admin = req.body.adminid;
  const test = req.body.test;

  
  console.log(test);

  const query = `INSERT INTO tests(adminid, test) VALUES (?,?)`;
  connection.query(query,[admin,test],(err,result)=>{
    if(err){
      console.log(err)
      res.send('error in query');
      return;
    }
    console.log('test inserted');
    const query2 = `SELECT relation.belongs, logininfo.email
    FROM relation
    JOIN logininfo ON relation.belongs = logininfo.username
    WHERE relation.authority = (?);
    `;
    connection.query(query2, [admin], (err, result)=>{
      if(err){
        res.send('error in query');
        return;
      }

      const query2 = `` 
      connection.query(
      )

      result.map((result)=>{
        const mailOptions = {
          from: "yadavpranjal2105@gmail.com",
          to: result.email,
          subject: "Test Created for you on PowerAI app",
          text: `Hi ${result.belongs}, Test for you has been created! \n Please attempt as early as possible.`,
        };
    
        // transporter.sendMail(mailOptions, (error, info) => {
        //   if (error) {
        //     console.error("Error sending email:", error);
        //     return res.status(500).send("Error sending email.");
        //   }
    
        //   res.status(200).send("email sent successfully.");
        // });
      })
    })
  })
})

app.post('/addres',(req,res)=>{
  const username = req.body.username;
  const result = req.body.result;
  const testid = req.body.testid;

  const query = `INSERT INTO testres(testid, username, result) VALUES (?,?,?)`;
  connection.query(query,[testid,username,result],(err,result)=>{
    if(err){
      res.send('error in query')
      return;
    }
    res.send('Result Received');
  })
})

app.get('/gettests/:username', (req, res) => {
  const username = req.params.username;
  console.log('username')
  const query = `SELECT test, time, testname, testid FROM tests WHERE adminid IN (SELECT authority FROM relation WHERE belongs = (?))`
  console.log('inside gettest');
  connection.query(query,[username],(err,result)=>{
    if(err){
      res.send('error in query');
      return;
    }
    console.log(result)
    res.json(result);
  })
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});