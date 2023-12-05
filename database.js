import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import mysql from 'mysql';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import axios from 'axios';
import nodemailer from 'nodemailer';
import cors from 'cors';
import { error } from 'console';
import multer from 'multer';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
export const secret = '12345';
export const expiresIn = '1h';
  
const app = express();
// import MySQLStore from 'express-mysql-session';

// const sessionStore = new MySQLStore({
//   /* your MySQL configuration options */
// }, session);


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json({ limit: '10mb' }));
app.use(
  cors()
  )
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('public', { 'extensions': ['html'] }));

app.use('/auth', authRoutes);

// Include protected routes
app.use('/protected', protectedRoutes);


// const MySQLStoreInstance = new MySQLStore(session);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// const otpStorage = {};

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      user: 'yadavpranjal2105@gmail.com',
      pass: 'czdc yria vnxq oqbu'
  }
});


const connection = mysql.createConnection({
  // host: 'sql12.freesqldatabase.com',
  // user: 'sql12662951',
  // password: 'Nf7RPVbCWD',
  // database: 'sql12662951'
  host: 'localhost',
  user: 'root',
  password: '',
  database:'powerai'
});

const db = connection

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});


// const sessionStore = new MySQLStoreInstance({} /* session store options */, connection);

// app.use(
//   session({
//     secret: '123', // Change this to a random, secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//     store: sessionStore, // Set secure to true in a production environment (HTTPS)
//   })
// );


app.get('/', (req, res) => {
    res.send("database is running....");
});

app.get('/login', (req, res) => {
    const message = req.query.message || '';
    res.sendFile(__dirname + '/login.html');
});

app.get('/session-status', (req, res) => {
  if (req.session.username) {
    console.log('User is logged in:', req.session.username);
    res.send({
      username: req.session.username,
      accesstype: req.session.accesstype,
      authenticated: true,
    });
  } else {
    console.log('User is not logged in');
    res.send({
      username: undefined,
      accesstype: undefined,
      authenticated: false,
    });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Signup route
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.post('/forgot-password', (req, res) => {
  const username = req.body.username;
  const otp = generateOTP();
  
  const checkUserQuery = `SELECT email FROM logininfo WHERE username = (?)`;
  connection.query(checkUserQuery,[username],(Error,result)=>{
  if(Error){
    res.status(500).send('Error in checking user');
    return;
  }

  if(result.length == 0){
    res.send('No User found. Please Check the Username again.');
    return;
  }
    const email = result[0].email;
    console.log(result[0].email);
    const query = `INSERT INTO otp (username, otp) VALUES (?,?)`;
    connection.query(query,[username,otp], (error, results) => {
      if(error){
        res.status(500).send('Error in query');
        return;
      }

      const mailOptions = {
        from: 'yadavpranjal2105@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending OTP email:', error);
          return res.status(500).send('Error sending OTP email.');
        }

        res.status(200).send('OTP sent successfully.');

      });
    }) 
  })  
});


app.post('/change-password',(req,res)=>{
  const otp = req.body.otp;
  const email = req.body.email;
  const pass = req.body.newPassword;

  const query2 = `DELETE FROM otp WHERE otp = (?)`
  connection.query(query2,[otp],(err,result)=>{
    if(err){
      res.status(500).send('error deleting otp')
      return;
    }
    
    const query = `UPDATE logininfo SET password = (?) WHERE email = (?) `;
    bcrypt.hash(pass, 10, (hashError, hash) => {
      if (hashError) {
        console.error('Error hashing password: ' + hashError.stack);
        res.status(500).send('Error creating user');
        return;
      }
      connection.query(query,[hash,email],(error, results)=>{
        if(error){
          console.log('error in query to change pass : '+ error);
          res.status(500).send('error in query');
          return;
        }
        res.send('success');
      })
    })
  }) 
})

app.get('/verify/:username', (req, res) => {
  const email = req.params.username;
  const query = 'SELECT otp FROM otp WHERE username = ?';
  
  connection.query(query, [email], (error, results) => {
    if (error) {
      res.status(500).send('Error in query');
      return;
    }

    if (results.length === 0) {
      console.log('Send OTP first.');
      res.status(400).send('OTP not found for the provided username.');
      return;
    }

    const otpFromDatabase = results[0].otp;
    res.send({ otp: otpFromDatabase });
  });
});
// app.post('/send-email', (req, res) => {
//   const mailOptions = {
//     from: 'yadavpranjal2105@gmail.com',
//     to: 'pranjalyadavpy212005@gmail.com',
//     subject: 'THIS IS A TEST MAIL',
//     text: 'THIS IS A TEST MAIL. IGNORE IF POSSIBLE',
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error('Error sending email:', error);
//       return res.status(500).send(error.toString());
//     }
//     res.status(200).send('Email sent: ' + info.response);
//   });
// });


var username;

app.get("/logout/:username",(req,res) => {
  const {username} = req.params;
  const query = `UPDATE relation SET status = ? WHERE belongs = ?`;
  connection.query(query, ['Offline',username], (error, results) => {
    if (error) {
      console.error('Error in database query: ' + error.stack);
      res.send([{belongs : 'Error in database query'}]);
      return;
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).send('Error destroying session');
      } else {
        console.log('logout success')
        res.send([{ belongs: 'Logout successful' }]);
      }
    });
  })
})

app.get('/employees/:adminUsername', (req,res) => {
  const { adminUsername } = req.params;
  
  const query = `SELECT belongs,status FROM relation WHERE authority = ?`;

  connection.query(query, [adminUsername] , (error, results) => {
    if (error) {
      console.error('Error in database query: ' + error.stack);
      res.send([{belongs : 'Error in database query'}]);
      return;
    }
    if (results.length === 0) {
      res.send([{belongs:'no data to show'}]);
      return;
    }

    res.send(results);

  })
})

app.post('/login', (req, res) => {
  const inputUsername = req.body.userId;
  const password = req.body.password.trim();

  const query = `SELECT * FROM logininfo WHERE username = ?`;
  connection.query(query, [inputUsername], (error, results) => {
    if (error) {
      console.error('Error in database query: ' + error.stack);
      res.send({message:'Error in database query'});
      return;
    }

    if (results.length === 0) {
      res.send({ message:'User not found'});
      return;
    }

    const storedPassword = results[0].password;

    bcrypt.compare(password, storedPassword, (err, result) => {
      console.log('Input Password:', password);
      console.log('Stored Password:', storedPassword);
      console.log('Compare Result:', result);

      if (err) {
        console.error('Error comparing passwords:', err);
        res.send({auth: false, message:'Error comparing passwords:'});
      } else if (result) {
        // req.session.username = results[0].username;
        // req.session.accesstype = results[0].accesstype;
        // console.log('After setting session variables:', req.session.username, req.session.accesstype);
        const token = jwt.sign(
          { auth:true, username: results[0].username, accesstype: results[0].accesstype },
          secret,
          { expiresIn }
          );
          const query2 = `UPDATE relation SET status = ? WHERE belongs = ?`
          connection.query(query2, ['Online',inputUsername], (queryError, results) => {
            if(queryError){
              console.log('error in status query')
              res.status(500).send('Error putting status of user');
              return;
            }
            res.json({token})
          })
        
        
      } else {
        res.send({auth: false, message: 'invalid credentials.'});
      }
    });
  });
});



app.post("/add-employee", async (req,res)=>{
  const username = req.body.empUserName;
  const email = req.body.empEmail;
  const password = req.body.password;
  const admin = req.body.loggedInAdmin;
  console.log(' INFO : ' +email +' '+ password +' '+ admin)
  const checkUserQuery = 'SELECT * FROM logininfo WHERE username = ?';
  connection.query(checkUserQuery, [username], (checkError, results) => {
    if (checkError) {
      console.error('Error checking user existence: ' + checkError.stack);
      res.status(500).send('Error checking user existence');
      return;
    }

    // If the username already exists, send a message to the client
    if (results.length > 0) {
      res.send({message:'username already exists.'});
      return;
    }

    const query2 = `SELECT * FROM logininfo WHERE email = ?`
    connection.query(query2, [email] , (error, result)=>{
      if(error){
        res.status(500).send('Error finding email query');
        return;
      }
      
      if(result.length > 0){
        res.send({message: 'email already exists for a user.'})
        return;
      }

      bcrypt.hash(password, 10, (hashError, hash) => {
        if (hashError) {
          console.error('Error hashing password: ' + hashError.stack);
          res.status(500).send('Error creating user');
          return;
        }
        const query = `INSERT INTO logininfo (username, password, accesstype,email) VALUES(?,?,?,?)`
        console.log("hashed : " + hash);
        connection.query(query, [username, hash, 'emp',email], (insertError) => {
          if (insertError) {
            console.error('Error inserting user into database: ' + insertError.stack);
            res.status(500).send('Error creating user');
            return;
          }
        })
        const adminQuery = `INSERT INTO relation (authority,belongs,status) VALUES(?,?,?)`
        connection.query(adminQuery,[admin,username,'never used'], (insertError) => {
          if (insertError) {
            console.error('Error inserting user into database: ' + insertError.stack);
            res.status(500).send('Error creating user');
            return;
          }

          // Redirect to login page with a success message
          res.send({message:'Employee Added', status: true})
        })
      })
    })
  });
})

app.post('/delete-employee', (req,res) => {
  const username = req.body.empUserName;
  const loggedin = req.body.loggedin;

  // const query = `SELECT username FROM logininfo WHERE `

    const delQuery = `DELETE FROM logininfo WHERE username = (?)`;
    connection.query(delQuery,[username],(error,results) =>{
      if(error){
        console.error('Error in query: ' + checkError.stack);
        res.send({message: 'Error in query'});
        return;
      }
      if(results.affectedRows === 0){
        res.send({message: 'no user found with username : '+username})
        return;
      }
      const query = `DELETE FROM relation WHERE belongs = (?)`
      connection.query(query,[username],(error,results) =>{
        if(error){
          console.error('Error in second query: ' + checkError.stack);
          res.send({message: 'Error in second query'});
          return;
        }
          res.send({message:' deletion done'});
      })
    })
})

app.post("/add-admin", async (req,res)=>{
  const username = req.body.admUserName;
  const password = req.body.password;
  const gov = req.body.loggedInGov;
  const checkUserQuery = 'SELECT * FROM logininfo WHERE username = ?';
  connection.query(checkUserQuery, [username], (checkError, results) => {
    if (checkError) {
      console.error('Error checking user existence: ' + checkError.stack);
      res.status(500).send('Error checking user existence');
      return;
    }

    // If the username already exists, send a message to the client
    if (results.length > 0) {
      res.send({message:'username already exists.'});
      return;
    }
    bcrypt.hash(password, 10, (hashError, hash) => {
        if (hashError) {
          console.error('Error hashing password: ' + hashError.stack);
          res.status(500).send('Error creating user');
          return;
        }
      const query = `INSERT INTO logininfo (username, password, accesstype) VALUES(?,?,?)`
      console.log("hashed : " + hash);
      connection.query(query, [username, hash, 'loc'], (insertError) => {
        if (insertError) {
          console.error('Error inserting user into database: ' + insertError.stack);
          res.status(500).send('Error creating user');
          return;
        }
        const adminQuery = `INSERT INTO relation (authority, belongs, status) VALUES(?,?,?)`
        connection.query(adminQuery,[gov,username,'never used'], (insertError) => {
          if (insertError) {
            console.error('Error inserting user into database: ' + insertError.stack);
            res.status(500).send('Error creating user');
            return;
          }

          // Redirect to login page with a success message
          res.send({message:'Admin Added', status: true})
          return; 
        })
      })
      
    })
  });
})


app.post("/answer", async (req, res) => {
  const inp = req.body.input;
  res.send({ aa: inp + " i am AI" });
});

// app.use((req, res, next) => {
//   req.session.username = username; // Set a session variable (replace with your logic)
//   next();
// });


app.post('/insert-chunks', (req, res) => {
  // console.log('Received request with body:', req.body);
  let chunks = req.body.chunks;
  if (chunks) {
    const insertQuery = 'INSERT INTO chunks (adminid, chunkid, chunk) VALUES (?, ?, ?)';

    db.query('START TRANSACTION');
    chunks.forEach((chunk, index) => {
      db.query(insertQuery, [username, index, chunk], (err, result) => {
        if (err) {
          console.error('Error inserting chunk:', err);
          db.query('ROLLBACK');
          return res.status(500).json({ error: 'Internal server error' });
        }
      });
    });

    db.query('COMMIT', () => {
      res.json({ message: 'Chunks inserted successfully!' });
    });
  }
  else{
    res.status(400).json({ error: 'Chunks not found in the request body.' })
  }
});



app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the username already exists
  const checkUserQuery = 'SELECT * FROM logininfo WHERE username = ?';
  connection.query(checkUserQuery, [username], (checkError, results) => {
    if (checkError) {
      console.error('Error checking user existence: ' + checkError.stack);
      res.status(500).send('Error checking user existence');
      return;
    }

    // If the username already exists, send a message to the client
    if (results.length > 0) {
      res.send('Username already exists. Please choose another username.');
      return;
    }

    // If the username doesn't exist, proceed with inserting the new user
    bcrypt.hash(password, 10, (hashError, hash) => {
      if (hashError) {
        console.error('Error hashing password: ' + hashError.stack);
        res.status(500).send('Error creating user');
        return;
      }

      const insertQuery = 'INSERT INTO logininfo (username, password) VALUES (?, ?)';
      connection.query(insertQuery, [username, hash], (insertError) => {
        if (insertError) {
          console.error('Error inserting user into database: ' + insertError.stack);
          res.status(500).send('Error creating user');
          return;
        }

        // Redirect to login page with a success message
        const message = 'Signup successful! You can now log in.';
        res.redirect(`/login?message=${encodeURIComponent(message)}`);
      });
    });
  });
});

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for handling file as Buffer
const upload = multer({ storage });

app.post('/uploadProfilePic', upload.single('profilePic'), (req, res) => {
  // Access the file via req.file.buffer
  const profilePicBuffer = req.file.buffer;

  // Access the username from req.body
  const username = req.body.username;

  // Save the profilePicBuffer to the 'profilepic' column in the 'logininfo' table
  const query = 'UPDATE logininfo SET profilepic = ? WHERE username = ?';

  db.query(query, [profilePicBuffer, username], (err, results) => {
    if (err) {
      console.error('Error updating profile picture:', err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Profile picture uploaded successfully!' });
  });
});



app.get('/profilePic/:username', (req, res) => {
  const username = req.params.username;
  // Retrieve the profile picture data from the 'profilepic' column in the 'logininfo' table
  const query = 'SELECT profilepic FROM logininfo WHERE username = ?';

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error retrieving profile picture:', err.message);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0 || !results[0].profilepic) {
      // If no profile picture found, you can send a default image or a placeholder
      return res.sendFile(path.join(__dirname, 'default-profile-pic.png'));
    }

    // Send the profile picture data as a response
    res.setHeader('Content-Type', 'image/jpeg'); // Adjust the content type based on your image format
    res.send(results[0].profilepic);
  });
});

app.get('/userData/:username',(req,res)=>{
  const username = req.params;
  const query = `SELECT accesstype`
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});