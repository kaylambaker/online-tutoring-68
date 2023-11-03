import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: './.env' })

const app = express()
app.use(express.json())
app.use(cors())

// to save images to server
const PROFILE_PHOTOS_DIR = __dirname + '/images'
const storage = multer.diskStorage({
  destination: (req, flile, cb) => {
    cb(null, PROFILE_PHOTOS_DIR)
  },
  filename: (req, file, cb) => {
    // name file UserID.ext
    cb(null, req.params.id + path.extname(file.originalname))
  },
})
const upload = multer({ storage: storage })

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE || 'online_tutoring',
})

// modify tutor, everything but ID, Email, and IsTutor
// query parameters: ID
// body parameters: tutor colums except ID, Email, and IsTutor
app.put('/tutors/:id', (req, res) => {
  const q =
    'update Tutors natural join Users set bio=?,Subject=?,AvailableHoursStart=?,AvailableHoursEnd=?,FirstName=?, LastName=?,HashedPassword=?, HoursCompleted=?,ProfilePictureID=? where ID=?;'
  const values = [
    req.body.Bio,
    req.body.Subject,
    req.body.AvailableHoursStart,
    req.body.AvailableHoursEnd,
    req.body.FirstName,
    req.body.LastName,
    req.body.HashedPassword,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.params.id,
  ]
  db.query(q, values, (err, data) => {
    if (err) return res.status(400).send(err)
    return res.json(data)
  })
})

// query parameters: ID
// body parameters: all student attributes except ID, Email, and IsTutor
app.put('/students/:id', (req, res) => {
  const q =
    'update Students natural join Users set FirstName=?,LastName=?,HashedPassword=?,HoursCompleted=?,ProfilePictureID=? where ID=?;'
  const values = [
    req.body.FirstName,
    req.body.LastName,
    req.body.HashedPassword,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.params.id,
  ]
  db.query(q, values, (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err)
    }
    return res.status(200).send(data)
  })
})

// create new tutor
// query parameters: none
// body parameters: all attributes associated with tutors
// async is needed to allow await for bcrypt to hash.
app.post('/tutors', async (req, res) => {
  const createUserQuery =
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (?);'
  const createTutorQuery =
    'insert into Tutors (ID,Bio,Subject,AvailableHoursStart,AvailableHoursEnd) values (?);'
  const hashedPassword = await bcrypt.hash(req.body.Password, 10)
  const createUserValues = [
    req.body.Email,
    req.body.FirstName,
    req.body.LastName,
    hashedPassword,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.body.IsTutor,
  ]
  db.query(createUserQuery, [createUserValues], (err, data) => {
    if (err) return res.status(400).send(err)
    const createTutorValues = [
      data.insertId,
      req.body.Bio,
      req.body.Subject,
      req.body.AvailableHoursStart,
      req.body.AvailableHoursEnd,
    ]
    db.query(createTutorQuery, [createTutorValues], (err, data2) => {
      if (err) return res.status(400).send(err)
      return res.status(200).send(data2)
    })
  })
})

// create new student
// body: Email, FirstName, LastName, HashedPassword, HoursCompleted, ProfilePictureID, IsTutor
//       IsTutor is 1 or 0; 1 if IsTutor=true, 0 if IsTutor=false
// returns: on success - the data returned by mysql with status code 201
//          on error - the error is sent with status code 400
// async is needed to allow await for bcrypt to hash.
app.post('/students', async (req, res) => {
  const createUserQuery =
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (?);'
  const createStudentQuery = 'insert into Students (ID) values (?);'
  const hashedPassword = await bcrypt.hash(req.body.Password, 10)
  const createUserValues = [
    req.body.Email,
    req.body.FirstName,
    req.body.LastName,
    hashedPassword,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.body.IsTutor,
  ]
  db.query(createUserQuery, [createUserValues], (err, data) => {
    if (err) return res.status(400).send(err)
    const createStudentValues = [data.insertId]
    db.query(createStudentQuery, [createStudentValues], (err, data2) => {
      if (err) return res.status(400).send(err)
      res.status(201).send(data2)
    })
  })
})

// retrieve user
// parameters: Email and HashedPassword
// returns: all Users attributes from database
//          returns 1 user
app.get('/users/:Email/:HashedPassword', (req, res) => {
  console.log(req.params.Email)
  console.log(req.params.HashedPassword)
  const q =
    'select ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor from Users where Email=? and HashedPassword=cast(? as binary(16));'
  const values = [req.params.Email, req.params.HashedPassword]
  db.query(q, values, (err, data) => {
    if (err) return res.status(500).send(err)
    // if no tuples in result
    if (data.length == 0) return res.status(404).send('user not found')
    else if (data.length != 1)
      return res.status(404).send('error, multiple users with same email')
    else return res.status(200).send(data[0])
  })
})

// retrieve student by ID
// parameters: ID
// returns: Users natural join Students attributes
//          returns 1 user
app.get('/students/:id', (req, res) => {
  const q = 'select ID,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor from Users natural join Students where ID=?;'
  db.query(q, req.params.id, (err, data) => {
    if (err) return res.status(500).send(err)
    if (data.length == 0) return res.status(404).send('user not found')
    else if (data.length != 1)
      // if you get this something is wrong with the schema
      return res.status(404).send('error, multiple users with same ID')
    return res.status(200).send(data[0])
  })
})

// retrieve tutor by ID
// parameters: ID
// returns: Users natural join Tutors attributes
//          returns 1 user
app.get('/tutors/:id', (req, res) => {
  const q = 'select ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,Bio,Subject,AvailableHoursStart,AvailableHoursEnd from Users natural join Tutors where ID=?;'
  db.query(q, req.params.id, (err, data) => {
    if (err) return res.status(500).send(err)
    if (data.length == 0) return res.status(404).send('user not found')
    else if (data.length != 1)
      // if you get this something is wrong with the schema
      return res.status(404).send('error, multiple users with same ID')
    return res.status(200).send(data[0])
  })
})

// retrieve a student's favorites list
// parameters: StudentID
// returns: StudentID, TutorID, tutor Bio, tutor Subject, tutor available hours
app.get('/students/favorites_list/:StudentID', (req, res) => {
  const q =
    'select StudentID,TutorID,Bio,Subject,AvailableHoursStart,AvailableHoursEnd from FavoritesList join Tutors on TutorID=ID where StudentID=?;'
  db.query(q, req.params.StudentID, (err, data) => {
    if (err) return res.status(500).send(err)
    return res.status(200).send(data)
  })
})

// insert item into favorites list
// parameters: StudentID, TutorID
// returns: sql message, status code 200 on success, 500 on failure
app.post('/students/favorites_list/:StudentID/:TutorID', (req, res) => {
  const q = 'insert into FavoritesList values (?);'
  db.query(q, [[req.params.StudentID, req.params.TutorID]], (err, data) => {
    if (err) return res.status(500).send(err)
    return res.status(200).send(data)
  })
})

// delete entry from favorites list
// parameters: StudentID, TutorID
// returns: sql message, status code 200 on success, 500 on failure
app.delete('/students/favorites_list/:StudentID/:TutorID', (req, res) => {
  const q = 'delete from FavoritesList where StudentID=? and TutorID=?;'
  db.query(q, [req.params.StudentID, req.params.TutorID], (err, data) => {
    if (err) return res.status(500).send(err)
    return res.status(200).send(data)
  })
})

// upload/modify user profile photo
// parameters: user ID
// returns: sql message, status code 200 on success, 500 on failure
app.put('/users/profile_picture/:id', upload.single('image'), (req, res) => {
  const updatePicture = 'update Users set ProfilePictureID=? where ID=?'
  const getProfilePicture = 'select ProfilePictureID from Users where ID=?'
  db.query(getProfilePicture, [req.params.id], (err, data) => {
    if (err) return res.status(500).send(err)
    const currentPicture = data[0].ProfilePictureID
    // if there is a photo, delete it
    if (currentPicture && currentPicture !== req.file.filename) {
      let e = null
      fs.unlink('./images/' + currentPicture, (err) => {
        if (err) e = err
      })
      if (e) return res.status(500).send(e)
    }
    db.query(
      updatePicture,
      [req.file.filename, req.params.id],
      (err2, data2) => {
        if (err2) return res.status(500).send(err2)
        return res.status(200).send(data2)
      },
    )
  })
})

// delete profile photo
// parameters: user ID
// returns: sql message, status code 200 on success, 500 on failure
app.delete('/users/profile_picture/:id', (req, res) => {
  const deletePicture = 'update Users set ProfilePictureID=null where ID=?'
  const getProfilePicture = 'select ProfilePictureID from Users where ID=?'
  db.query(getProfilePicture, [req.params.id], (err, data) => {
    if (err) return res.status(500).send(err)
    const currentPicture = data[0].ProfilePictureID
    if (!currentPicture) return res.status(404).send('no profile picture')
    let e = null
    fs.unlink(PROFILE_PHOTOS_DIR.toString() + currentPicture, (err) => {
      if (err) e = err
    })
    if (e) return res.status(500).send(e)
    db.query(deletePicture, [req.params.id], (err2, data2) => {
      if (err) return res.status(500).send(err2)
      return res.status(200).send(data2)
    })
  })
})

app.get('/images/:path', (req, res) => {
  return res.sendFile(PROFILE_PHOTOS_DIR + '/' + req.params.path)
})

/**********************************************************************************************************************************************************/
//tutor endpoint start

app.get('/tutors/:id', (req, res) => {
    const tutorID = req.params.id;
    const q = `
      SELECT
        users.ID,
        users.FirstName,
        users.LastName,
        users.Email,
        users.HoursCompleted,
        tutors.Bio,
        tutors.Subject,
        tutors.AvailableHoursStart,
        tutors.AvailableHoursEnd
      FROM users
      INNER JOIN tutors ON users.ID = tutors.ID
      WHERE users.ID = ?;`;

app.post("/tutors", (req, res)=>{
    const q = "INSERT INTO tutors (`Bio`, `Subject`, `AvailableHoursStart`, `AvailableHoursEnd`) VALUES(?)";
    const values = [
        req.body.Bio,
        req.body.Subject,
        req.body.AvailableHoursStart,
        req.body.AvailableHoursEnd
    ];

    db.query(q, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.json("tutors has been created succeffully.");
    });
});


//end point for update operation
app.put("/tutors/:ID", (req, res)=>{
    const tutorsID = req.params.ID;
    const q = "UPDATE tutors SET `Bio` = ?, `Subject`= ?, `AvailableHoursStart` = ?, `AvailableHoursEnd` = ? WHERE ID = ?";

    const values = [
        req.body.Bio,
        req.body.Subject,
        req.body.AvailableHoursStart,
        req.body.AvailableHoursEnd
    ]




    db.query(q, [... values, tutorsID], (err, data)=>{
        if(err) return res.json(err);
        return res.json("tutors profile has been updated succeffully.");

    })
})
/*****************************************************************************************************************************
app.get("/tutors", (req, res) =>{
    const q = "SELECT 
      users.FirstName,
      users.LastName,
      users.Email,
      users.HoursCompleted,
      tutors.Bio,
      tutors.Subject,
      tutors.AvailableHoursStart,
      tutors.AvailableHoursEnd 
      FROM users NATURAL JOIN tutors;   //removed the where isTutors = True
    db.query(q, (err, data) =>{
        if(err) return res.json(err)
        return res.json(data)
    })
})
//end point for delete operation
app.delete("/tutors/:ID", (req, res)=>{
    const tutorsID = req.params.ID;
    const q = "DELETE FROM tutors WHERE ID = ?"

    db.query(q, [tutorsID], (err, data)=>{
        if(err) return res.json(err);
        return res.json("tutors profile has been deleted succeffully.");

    })
})
******************************************************************************************************************************/
//tutor endpoint end
/********************************************************************************************************************************************************/


app.listen(8800, () => {
  console.log('connected to backend')
})
