// routes/auth.js
import { Router } from 'express';
// import { compare } from 'bcrypt';
import mysql from 'mysql';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { secret, expiresIn } from '../jwtConfig.js';

const router = Router();

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

router.post('/login', (req, res) => {

  const inputUsername = req.body.userId;
  const password = req.body.password.trim();

  const query = `SELECT * FROM logininfo WHERE username = ?`;
  
    connection.query(query, [inputUsername], (error, results) => {
    if (error) {
      console.error('Error in database query:', error.stack);
      res.status(500).json({ message: 'Error in database query' });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const storedPassword = results[0].password;

    bcrypt.compare(password, storedPassword, (err, result) => {
        if (err) {
            console.error('Error comparing passwords:', err);
            res.status(500).json({ message: 'Error comparing passwords' });
        } else if (result) {
            const token = jwt.sign(
            { auth:true, username: results[0].username, accesstype: results[0].accesstype },
            secret,
            { expiresIn }
            );
            const query2 = `UPDATE relation SET status = ? WHERE belongs = ?`
            console.log('updating status')
            connection.query(query2, ['Online',inputUsername], (queryError, results) => {
            if(queryError){
                console.log('error in status query')
                res.status(500).send('Error putting status of user');
                return;
            }
            res.json({token});
            })
       
        } else {
            res.status(401).json({ message: 'Invalid credentials', auth:false });
        }
    });
  });
});

export default router;
