import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'
import dotenv from 'dotenv'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import nodemailer from 'nodemailer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: './.env' })

const app = express()
app.use(express.json())
app.use(express.static('images'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  session({
    key: 'online_tutoring',
    secret:
      'this should be unique this is a bad secret we should use like a random hex string or something and store it in .env',
    resave: false,
    saveUninitialized: false,
    cookie: { expires: 60 * 60 * 24 }, // 24hrs
  }),
)
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
)

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
  host: 3306,
  user: 'root',
  password: '',
  database: 'script_test',
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'online.tutoring.68@gmail.com',
    pass: process.env.EMAIL_APP_PASS,
  },
})

const sendReminder = async (apptID) => {
  const q = `
  select Appointments.ID, tutor.FirstName as TutorFirstName, tutor.LastName as TutorLastName, 
  student.FirstName as StudentFirstName, student.LastName as StudentLastName, AppointmentDate, 
StartTime,EndTime,cast(aes_decrypt(student.Email,?) as char)  as StudentEmail,
cast(aes_decrypt(tutor.email,?) as char) as TutorEmail from Appointments join Users as tutor 
on TutorID=tutor.ID join Users as student on StudentID=student.ID where Appointments.ID=?;
`
  db.promise()
    .query(q, [process.env.AES_KEY, process.env.AES_KEY, apptID])
    .then(([tuples, _]) => {
      const appt = tuples[0]
      const emailToStudent = ` 
        <h1>Tutoring Appointment Reminder</h1>
        <p>You have an appointment with tutor ${appt.TutorFirstName} ${appt.TutorLastName
        } 
        on ${appt.AppointmentDate.getMonth()}/${appt.AppointmentDate.getDate()}/${appt.AppointmentDate.getFullYear()} 
        from ${appt.StartTime} to ${appt.EndTime}</p>
      `
      const emailToTutor = ` 
        <h1>Tutoring Appointment Reminder</h1>
        <p>You have an appointment with student ${appt.StudentFirstName} ${appt.StudentLastName
        } 
        on ${appt.AppointmentDate.getMonth()}/${appt.AppointmentDate.getDate()}/${appt.AppointmentDate.getFullYear()} 
        from ${appt.StartTime} to ${appt.EndTime}</p>
      `
      transporter
        .sendMail({
          from: 'online tutoring <online.tutoring.68@gmail.com>',
          to: appt.StudentEmail,
          subject: 'Tutoring Appointment Reminder',
          html: emailToStudent,
        })
        .then((info) => { })
        .catch(console.log)
      transporter
        .sendMail({
          from: 'online tutoring <online.tutoring.68@gmail.com>',
          to: appt.TutorEmail,
          subject: 'Tutoring Appointment Reminder',
          html: emailToTutor,
        })
        .then((info) => { })
        .catch(console.log)
    })
    .catch(console.log)
}

app.post('/appointments', async (req, res) => {
  const q =
    "insert into Appointments (StudentID,TutorID,AppointmentDate,StartTime,EndTime,Subject,AppointmentNotes,MeetingLink) values (?,?,str_to_date(?,'%m-%d-%Y'),str_to_date(?,'%T'),str_to_date(?,'%T'),?,?,null);"
  const values = [
    req.body.StudentID,
    req.body.TutorID,
    req.body.AppointmentDate,
    req.body.StartTime,
    req.body.EndTime,
    req.body.Subject,
    req.body.AppointmentNotes,
  ]
  await db
    .promise()
    .query(q, values)
    .then(([tuples, fields]) => {
      sendReminder(tuples.insertId)
      return res.status(200).send(tuples)
    })
    .catch((err) => {
      return res.status(500).send(err)
    })
})

// modify tutor, everything but ID, Email, and IsTutor
// query parameters: ID
// body parameters: tutor colums except ID, Email, IsTutor, and hashed passowrd
app.put('/tutors/:id', (req, res) => {
  const update =
    'update Tutors natural join Users set bio=?,Subject=?,AvailableHoursStart=?,AvailableHoursEnd=?,FirstName=?, LastName=?,HoursCompleted=?,ProfilePictureID=? where ID=?;'
  const getTutor =
    'select ID,cast(aes_decrypt(Email,?) as char) as Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,TOTPEnabled,Bio,AvailableHoursStart,AvailableHoursEnd,Subject from Users natural join Tutors where ID=?'
  const updateVals = [
    req.body.Bio,
    req.body.Subject,
    req.body.AvailableHoursStart,
    req.body.AvailableHoursEnd,
    req.body.FirstName,
    req.body.LastName,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.params.id,
  ]
  const getTutorVals = [process.env.AES_KEY, req.params.id]
  db.promise()
    .query(update, updateVals)
    .then(([tuples, fields]) => {
      db.promise()
        .query(getTutor, getTutorVals)
        .then(([tuples, fields]) => {
          req.session.user = { ...tuples[0], SessionTOTPVerified: true }
          return res.status(200).send(tuples)
        })
        .catch((err) => {
          return res.status(400).send(err)
        })
    })
    .catch((err) => {
      return res.status(400).send(err)
    })
})

// retrieve tutor by ID
// parameters: ID
// returns: Users natural join Tutors attributes
//          returns 1 user
app.get('/tutors/:id', (req, res) => {
  const q =
    'select ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,Bio,Subject,AvailableHoursStart,AvailableHoursEnd from Users natural join Tutors where ID=?;'
  db.query(q, req.params.id, (err, data) => {
    if (err) return res.status(500).send(err)
    if (data.length == 0) return res.status(404).send('user not found')
    else if (data.length != 1)
      // if you get this something is wrong with the schema
      return res.status(404).send('error, multiple users with same ID')
    return res.status(200).send(data[0])
  })
})

// query parameters: ID
// body parameters: all student attributes except ID, Email, IsTutor and hashed passowrd
app.put('/students/:id', (req, res) => {
  const update =
    'update Students natural join Users set FirstName=?,LastName=?,HoursCompleted=?,ProfilePictureID=? where ID=?;'
  const updateVals = [
    req.body.FirstName,
    req.body.LastName,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.params.id,
  ]
  const getStudent =
    'select ID,cast(aes_decrypt(Email,?) as char) as Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,TOTPEnabled from Users natural join Students where ID=?;'
  const getStudentVals = [process.env.AES_KEY, req.params.id]
  db.promise()
    .query(update, updateVals)
    .then(([tuples, fields]) => {
      db.promise()
        .query(getStudent, getStudentVals)
        .then(([tuples, fields]) => {
          req.session.user = { ...tuples[0], SessionTOTPVerified: true }
          return res.status(200).send(tuples)
        })
        .catch((err) => {
          return res.status(400).send(err)
        })
    })
    .catch((err) => {
      return res.status(400).send(err)
    })
  /* db.query(q, values, (err, data) => {
    if (err) {
      console.log(err)
      return res.status(500).send(err)
    }
    return res.status(200).send(data)
  }) */
})

//to show all the appointments
app.get('/Appointments', (req, res) => {
  const q = 'SELECT * FROM Appointments'
  db.query(q, (err, data) => {
    if (err) return res.json(err)
    return res.json(data)
  })
})

// Endpoint to delete an appointment by appointment Id
app.delete('/appointments/:id', (req, res) => {
  // check that the appointment time is at least 24 hours out
  const checkTime =
    'select * from Appointments where timestamp(AppointmentDate,StartTime)>now()+interval 1 day and ID=?;'
  // delete the appointment
  const deleteAppointment = 'DELETE FROM Appointments WHERE ID = ?'
  db.query(checkTime, req.params.id, (err, data) => {
    if (err) return res.status(500).send(err)
    if (data.length == 0)
      return res
        .status(403)
        .send(
          'cannot delete appointments that are within 24 hours or that are in the past',
        )
    db.query(deleteAppointment, req.params.id, (err, data) => {
      if (err) return res.status(500).send(err)
      return res.status(200).send(data)
    })
  })
})

// Endpoint to get an appointment by appointment Id
app.get('/appointments/:id', (req, res) => {
  const appointmentId = req.params.id

  const q =
    'SELECT StudentID, TutorID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink FROM Appointments WHERE ID = ?'

  db.query(q, [appointmentId], (err, data) => {
    if (err) {
      console.error('Error in getting the appointment:', err)
      return res
        .status(500)
        .json({ error: 'Error in selecting the appointment' })
    }

    console.log('the selected Appointment')
    //return res.json({ success: true });
    return res.json(data)
  })
})

// Endpoint to select an tutor appointment
// get appointments by tutor ID
app.get('/appointments/tutor/:id', (req, res) => {
  const TutorID = req.params.id

  const q =
    'SELECT ID, StudentID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink FROM Appointments WHERE TutorID = ?'

  db.query(q, [TutorID], (err, data) => {
    if (err) {
      console.error('Error in getting the appointment:', err)
      return res.status(500).json({ error: 'Error in the appointment' })
    }

    console.log('the Appointment')
    //return res.json({ success: true });
    return res.json(data)
  })
})

// Endpoint to delete from tutor appointment
// delete appointment by tutors ID
app.delete('/appointments/tutor/:id', (req, res) => {
  const TutorID = req.params.id

  const q = 'DELETE FROM Appointments WHERE TutorID = ?'

  db.query(q, [TutorID], (err, data) => {
    if (err) {
      console.error('Error deleting appointment:', err)
      return res.status(500).json({ error: 'Error deleting appointment' })
    }

    console.log('Appointment deleted successfully')
    return res.json({ success: true })
  })
})

// Endpoint to select an student appointment
// get appointments by student ID
app.get('/appointments/student/:id', (req, res) => {
  const StudentID = req.params.id

  const q =
    'SELECT ID, TutorID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink FROM Appointments WHERE StudentID = ?'

  db.query(q, [StudentID], (err, data) => {
    if (err) {
      console.error('Error in getting the appointment:', err)
      return res.status(500).json({ error: 'Error in the appointment' })
    }

    console.log('the Appointment')
    return res.json(data)
  })
})

// Endpoint to delete from student appointment
// delete appointment by student ID
app.delete('/appointments/student/:id', (req, res) => {
  const StudentID = req.params.id

  const q = 'DELETE FROM Appointments WHERE StudentID = ?'

  db.query(q, [StudentID], (err, data) => {
    if (err) {
      console.error('Error deleting appointment:', err)
      return res.status(500).json({ error: 'Error deleting appointment' })
    }

    console.log('Appointment deleted successfully')
    return res.json({ success: true })
  })
})

app.post('/createAppointment', (req, res) => {
  const { studentID, tutorID, appointmentDate, startTime, endTime } = req.body

  // Define default values for optional fields
  const defaultSubject = 'Default Subject'
  const defaultNotes = 'Default Notes'
  const defaultMeetingLink = null

  const insertQuery = `INSERT INTO Appointments 
    (StudentID, TutorID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

  const values = [
    studentID,
    tutorID,
    appointmentDate,
    startTime,
    endTime,
    defaultSubject,
    defaultNotes,
    defaultMeetingLink,
  ]

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error creating appointment:', err)
      return res.status(400).json({ error: 'Error creating appointment' })
    }
    //console.log('Appointment created successfully');
    return res.status(201).json({ success: true })
  })
})

// create new tutor
// query parameters: none
// body parameters: all attributes associated with tutors
// async is needed to allow await for bcrypt to hash.
app.post('/tutors', async (req, res) => {
  const createUserQuery =
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (aes_encrypt(?,?),?,?,?,?,?,?);'
  const createTutorQuery =
    'insert into Tutors (ID,Bio,Subject,AvailableHoursStart,AvailableHoursEnd) values (?);'
  const tutorInfoQuery =
    'select ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,TOTPEnabled from Users natural join Tutors where Email=?'

  let result = await checkCriminalBackground(
    req.body.FirstName,
    req.body.LastName,
    req.body.Email,
  )
  if (result) return res.status(403).send({ message: result })

  result = checkPasswordStrength(req.body.Password)
  if (result) return res.status(403).send({ message: result })

  const hashedPassword = await bcrypt.hash(req.body.Password, 10)
  const createUserValues = [
    req.body.Email,
    process.env.AES_KEY,
    req.body.FirstName,
    req.body.LastName,
    hashedPassword,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.body.IsTutor,
  ]
  db.query(createUserQuery, createUserValues, (err, data) => {
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
      db.query(tutorInfoQuery, [req.body.Email], (err, data3) => {
        if (err) return res.status(500).send(err)
        req.session.user = { ...data3[0], SessionTOTPVerified: false }
        return res.status(200).send(data3)
      })
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
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (aes_encrypt(?,?),?,?,?,?,?,?);'
  const createStudentQuery = 'insert into Students (ID) values (?);'
  const studentInfoQuery =
    'select ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,TOTPEnabled from Users natural join Students where Email=?'

  let result = await checkCriminalBackground(
    req.body.FirstName,
    req.body.LastName,
    req.body.Email,
  )
  if (result) return res.status(403).send({ message: result })

  result = checkPasswordStrength(req.body.Password)
  if (result) return res.status(403).send({ message: result })

  const hashedPassword = await bcrypt.hash(req.body.Password, 10)
  const createUserValues = [
    req.body.Email,
    process.env.AES_KEY,
    req.body.FirstName,
    req.body.LastName,
    hashedPassword,
    req.body.HoursCompleted,
    req.body.ProfilePictureID,
    req.body.IsTutor,
  ]
  db.query(createUserQuery, createUserValues, (err, data) => {
    if (err) return res.status(400).send(err)
    const createStudentValues = [data.insertId]
    db.query(createStudentQuery, [createStudentValues], (err, data2) => {
      if (err) return res.status(400).send(err)
      db.query(studentInfoQuery, [req.body.Email], (err, data3) => {
        if (err) return res.status(500).send(err)
        req.session.user = { ...data3[0], SessionTOTPVerified: false }
        return res.status(200).send(data3)
      })
    })
  })
})

// get session user
app.get('/users/session', (req, res) => {
  if (req.session.user) return res.status(200).send(req.session.user)
  else return res.status(404).send('no session user')
})

// delete session
app.delete('/users/session', (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return res.status(400).send('unable to end session')
      return res.status(200).send('session ended')
    })
  } else return res.status(404).send('no session found')
})

// retrieve user
// parameters: Email and HashedPassword
// returns: all Users attributes from database
//          returns 1 user
app.get('/users/:Email/:Password', async (req, res) => {
  const getUser = 'select * from Users where Email=aes_encrypt(?,?);'
  const getTutor =
    'select ID,cast(aes_decrypt(Email,?) as char) as Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,TOTPEnabled,Bio,AvailableHoursStart,AvailableHoursEnd,Subject from Users natural join Tutors where Email=aes_encrypt(?,?)'
  const getStudent =
    'select ID,cast(aes_decrypt(Email,?) as char) as Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,TOTPEnabled from Users natural join Students where Email=aes_encrypt(?,?)'
  let getNoPassword = ''
  db.query(getUser, [req.params.Email, process.env.AES_KEY], (err, data) => {
    if (err) return res.status(500).send(err)
    // if no tuples in result
    if (data.length == 0) return res.status(404).send('user not found')
    else if (data.length != 1)
      return res.status(404).send('error, multiple users with same email')
    const user = data[0]
    bcrypt.compare(req.params.Password, user.HashedPassword, (err2, res2) => {
      if (err2) return res.status(500).send(err2)
      if (res2) {
        if (user.IsTutor == 0) getNoPassword = getStudent
        else getNoPassword = getTutor
        db.query(
          getNoPassword,
          [process.env.AES_KEY, req.params.Email, process.env.AES_KEY],
          (err, data) => {
            if (err) return res.status(500).send(err)
            req.session.user = { ...data[0], SessionTOTPVerified: false }
            return res.status(200).send(req.session.user)
          },
        )
      } else return res.status(401).send('invalid password')
    })
  })
})

// retrieve student by ID
// parameters: ID
// returns: Users natural join Students attributes
//          returns 1 user
app.get('/students/:id', (req, res) => {
  const q =
    'select ID,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor from Users natural join Students where ID=?;'
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
  const q =
    'select ID,Email,FirstName,LastName,HoursCompleted,ProfilePictureID,IsTutor,Bio,Subject,AvailableHoursStart,AvailableHoursEnd from Users natural join Tutors where ID=?;'
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
        req.session.user = {
          ...req.session.user,
          ProfilePictureID: req.file.filename,
        }
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

// app.get('/images/:path', (req, res) => {
//   return res.sendFile(PROFILE_PHOTOS_DIR + '/' + req.params.path)
// })

/**********************************************************************************************************************************************************/
//tutor endpoint start
app.get('/tutors', (req, res) => {
  const q =
    'SELECT  \
      Users.ID, \
      Users.FirstName, \
      Users.LastName,\
      Users.HoursCompleted, \
      Tutors.Bio, \
      Tutors.Subject, \
      Tutors.AvailableHoursStart, \
      Tutors.AvailableHoursEnd  \
      FROM Users NATURAL JOIN Tutors;'
  db.query(q, (err, data) => {
    if (err) return res.json(err)
    return res.json(data)
  })
})

//end point for delete operation
app.delete('/tutors/:ID', (req, res) => {
  const tutorsID = req.params.ID
  const q = 'DELETE FROM tutors WHERE ID = ?'

  db.query(q, [tutorsID], (err, data) => {
    if (err) return res.json(err)
    return res.json('tutors profile has been deleted succeffully.')
  })
})

//tutor endpoint end
// ................................. ///

// generate qr image
app.get('/TOTPQRCode/:id', async (req, res) => {
  const tempSecret = authenticator.generateSecret()
  const uri = authenticator.keyuri(req.params.id, '2fa', tempSecret)
  const image = await qrcode.toDataURL(uri)
  const q = 'update Users set TOTPTempSecret=? where ID=?;'
  db.query(q, [tempSecret, req.params.id], (err, data) => {
    if (err) return res.status(500).send(err)
    return res.send({ image })
  })
})

// set 2fa secret
app.get('/setTOTP/:id/:code', (req, res) => {
  const getUser = 'select * from Users where ID=?;'
  const setSecret = 'update Users set TOTPSecret=?,TOTPEnabled=true where ID=?;'
  db.query(getUser, req.params.id, (err, data) => {
    // verify code is correct
    if (err) return res.status(500).send(err)
    const user = data[0]
    const verified = authenticator.check(req.params.code, user.TOTPTempSecret)
    if (!verified) return res.status(401).send('invalid code')
    db.query(setSecret, [user.TOTPTempSecret, user.ID], (err2, data2) => {
      // set user secret to tempSecret
      if (err2) return res.status(500).send(err2)
      req.session.user.TOTPEnabled = true
      return res.status(200).send(data2)
    })
  })
})

// verify login with 2fa
app.get('/verifyTOTP/:id/:code', (req, res) => {
  const getUser = 'select * from Users where ID=?;'
  db.query(getUser, req.params.id, (err, data) => {
    if (err) return res.status(500).send(err)
    if (data.length === 0) return res.status(404).send('invalid user ID')
    const user = data[0]
    const verified = authenticator.check(req.params.code, user.TOTPSecret)
    if (!verified) return res.status(401).send('invalid code')
    req.session.user.SessionTOTPVerified = true
    return res.status(200).send(user)
  })
})

// calculate hours completed using the number of past appointments
app.get('/hoursCompleted/:id', (req, res) => {
  const hours =
    'select sum(Duration) as HoursCompleted from \
    (select timestampdiff(HOUR,timestamp(AppointmentDate,StartTime), \
    timestamp(AppointmentDate,EndTime)) \
    as Duration from Appointments \
    where (StudentID=? or TutorID=?) and timestamp(AppointmentDate,EndTime)<now()) as t;'
  const userExists = 'select * from Users where ID=?;'
  db.query(userExists, req.params.id, (err, data) => {
    if (err) return res.status(500).send(err)
    if (data.length == 0) return res.status(404).send('user not found')
    db.query(hours, [req.params.id, req.params.id], (err, data) => {
      if (err) return res.status(500).send(err)
      if (data[0].HoursCompleted == null)
        return res.status(200).send({ HoursCompleted: 0 })
      return res.status(200).send(data[0])
    })
  })
})

app.listen(8800, () => {
  console.log('connected to backend!')
})

function checkPasswordStrength(password) {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/
  if (passwordRegex.test(password)) {
    return false
  } else {
    return 'Password must be at least 8 characters,one capital letter,one special character,and at least one digit'
  }
}

async function checkCriminalBackground(first_name, last_name, email) {
  const checkquery =
    'select * from Criminals where FirstName = ? and LastName = ? and Email=aes_encrypt(?,?)'
  const promisDb = db.promise()
  const [rows, fields] = await promisDb.query(checkquery, [
    first_name,
    last_name,
    email,
    process.env.AES_KEY,
  ])
  if (rows.length == 0) {
    return false
  } else {
    return 'Criminal Background check failed'
  }
}
