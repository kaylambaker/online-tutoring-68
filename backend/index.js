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

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: './.env' })

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('images'))

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
  host: 'localhost',
  user: 'root',
  password: 'csproject',
  database: 'calendar_db',
})

// modify tutor, everything but ID, Email, and IsTutor
// query parameters: ID
// body parameters: tutor colums except ID, Email, IsTutor, and hashed passowrd
app.put('/tutors/:id', (req, res) => {
  const q =
    'update Tutors natural join Users set bio=?,Subject=?,AvailableHoursStart=?,AvailableHoursEnd=?,FirstName=?, LastName=?,HoursCompleted=?,ProfilePictureID=? where ID=?;'
  const values = [
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
  db.query(q, values, (err, data) => {
    if (err) return res.status(400).send(err)
    return res.json(data)
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

// query parameters: ID
// body parameters: all student attributes except ID, Email, IsTutor and hashed passowrd
app.put('/students/:id', (req, res) => {
  const q =
    'update Students natural join Users set FirstName=?,LastName=?,HoursCompleted=?,ProfilePictureID=? where ID=?;'
  const values = [
    req.body.FirstName,
    req.body.LastName,
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

//to show all the appointments
app.get("/Appointments", (req,res)=>{
  const q = "SELECT * FROM Appointments"
  db.query(q,(err,data)=>{
    if(err) return res.json(err)
    return res.json(data)
  })
})

// Endpoint to delete an appointment by appointment Id
app.delete("/appointments/:id", (req, res) => {
  const appointmentId = req.params.id;

  const q = "DELETE FROM Appointments WHERE ID = ?";

  db.query(q, [appointmentId], (err, data) => {
    if (err) {
      console.error('Error deleting appointment:', err);
      return res.status(500).json({ error: 'Error deleting appointment' });
    }
    console.log('Appointment deleted successfully');
    return res.json({ success: true });
  });
});

// Endpoint to get an appointment by appointment Id
app.get("/appointments/:id", (req, res) => {
  const appointmentId = req.params.id;

  const q = "SELECT StudentID, TutorID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink FROM Appointments WHERE ID = ?";

  db.query(q, [appointmentId], (err, data) => {
    if (err) {
      console.error('Error in getting the appointment:', err);
      return res.status(500).json({ error: 'Error in selecting the appointment' });
    }

    console.log('the selected Appointment');
    //return res.json({ success: true });
    return res.json(data);
  });
});

// Endpoint to select an tutor appointment
// get appointments by tutor ID
app.get("/appointments/tutor/:id", (req, res) => {
  const TutorID = req.params.id;

  const q = "SELECT ID, StudentID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink FROM Appointments WHERE TutorID = ?";

  db.query(q, [TutorID], (err, data) => {
    if (err) {
      console.error('Error in getting the appointment:', err);
      return res.status(500).json({ error: 'Error in the appointment' });
    }

    console.log('the Appointment');
    //return res.json({ success: true });
    return res.json(data);
  });
});

// Endpoint to delete from tutor appointment
// delete appointment by tutors ID
app.delete("/appointments/tutor/:id", (req, res) => {
  const TutorID = req.params.id;

  const q = "DELETE FROM Appointments WHERE TutorID = ?";

  db.query(q, [TutorID], (err, data) => {
    if (err) {
      console.error('Error deleting appointment:', err);
      return res.status(500).json({ error: 'Error deleting appointment' });
    }

    console.log('Appointment deleted successfully');
    return res.json({ success: true });
  });
});

// Endpoint to select an student appointment
// get appointments by student ID
app.get("/appointments/student/:id", (req, res) => {
  const StudentID = req.params.id;

  const q = "SELECT ID, TutorID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink FROM Appointments WHERE StudentID = ?";

  db.query(q, [StudentID], (err, data) => {
    if (err) {
      console.error('Error in getting the appointment:', err);
      return res.status(500).json({ error: 'Error in the appointment' });
    }

    console.log('the Appointment');
    return res.json(data);
  });
});

// Endpoint to delete from student appointment
// delete appointment by student ID
app.delete("/appointments/student/:id", (req, res) => {
  const StudentID = req.params.id;

  const q = "DELETE FROM Appointments WHERE StudentID = ?";

  db.query(q, [StudentID], (err, data) => {
    if (err) {
      console.error('Error deleting appointment:', err);
      return res.status(500).json({ error: 'Error deleting appointment' });
    }

    console.log('Appointment deleted successfully');
    return res.json({ success: true });
  });
});

app.post('/createAppointment', (req, res) => {
  const {
    studentID,
    tutorID,
    appointmentDate,
    startTime,
    endTime,
  } = req.body;

  // Define default values for optional fields
  const defaultSubject = 'Default Subject';
  const defaultNotes = 'Default Notes';
  const defaultMeetingLink = null;

  const insertQuery = `INSERT INTO Appointments 
    (StudentID, TutorID, AppointmentDate, StartTime, EndTime, Subject, AppointmentNotes, MeetingLink)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const values = [studentID, tutorID, appointmentDate, startTime, endTime, defaultSubject, defaultNotes, defaultMeetingLink];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error('Error creating appointment:', err);
      return res.status(400).json({ error: 'Error creating appointment' });
    }
    //console.log('Appointment created successfully');
    return res.status(201).json({ success: true });
  });
});

// create new tutor
// query parameters: none
// body parameters: all attributes associated with tutors
// async is needed to allow await for bcrypt to hash.
app.post('/tutors', async (req, res) => {
  const createUserQuery =
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (?);'
  const createTutorQuery =
    'insert into Tutors (ID,Bio,Subject,AvailableHoursStart,AvailableHoursEnd) values (?);'
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if(!passwordRegex.test(req.body.Password)){
    return res.status(403).send({
      message: "Password must be at least 8 characters,one capital letter,one special character,and at least one digit"
    })
  }
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
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  if(!passwordRegex.test(req.body.Password)){
    return res.status(403).send({
      message: "Password must be at least 8 characters,one capital letter,one special character,and at least one digit"
    })
  }
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

// app.get('/images/:path', (req, res) => {
//   return res.sendFile(PROFILE_PHOTOS_DIR + '/' + req.params.path)
// })

// -----------------------------------------------------------------------------------------------------------------------//
//tutor endpoint start
app.get("/tutors", (req, res) =>{
    const q = "SELECT  \
      users.FirstName, \
      users.LastName,\
      users.Email, \
      users.HoursCompleted, \
      tutors.Bio, \
      tutors.Subject, \
      tutors.AvailableHoursStart, \
      tutors.AvailableHoursEnd  \
      FROM users NATURAL JOIN tutors;" 
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

//tutor endpoint end
// ................................. ///


app.listen(8800, () => {
  console.log('connected to backend!')
})
