import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import Chance from 'chance'

import dotenv from 'dotenv'

const chance = new Chance()

dotenv.config({ path: './.env' })

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE || 'online_tutoring',
  multipleStatements: true,
})

const password = await bcrypt.hash('password', 10)
const subjects = ['Maths', 'Biology', 'Chemistry', 'Physics', 'History']

const insertStudents = async () => {
  const q =
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (aes_encrypt(?,?),?,?,?,?,?,?); \
    insert into Students values (last_insert_id());'
  for (let i = 0; i < 20; i++)
    await db
      .promise()
      .query(q, [
        chance.email(),
        process.env.AES_KEY,
        chance.first(),
        chance.last(),
        password,
        0,
        null,
        0,
      ])
      .catch(console.log)
}

const insertTutors = async () => {
  const q =
    'insert into Users (Email,FirstName,LastName,HashedPassword,HoursCompleted,ProfilePictureID,IsTutor) values (aes_encrypt(?,?),?,?,?,?,?,?); \
    insert into Tutors values (last_insert_id(),?,?,?,?);'
  for (let i = 0; i < 20; i++) {
    let time = chance.integer({ min: 0, max: 19 }) * 10000
    const values = [
      // user
      chance.email(),
      process.env.AES_KEY,
      chance.first(),
      chance.last(),
      password,
      0,
      null,
      1,
      // tutor
      chance.sentence(),
      subjects[Math.floor(Math.random() * subjects.length)],
      time,
      time + 50000,
    ]
    await db.promise().query(q, values).catch(console.log)
  }
}

const getStudents = async () => {
  const q = 'select ID from Students;'
  let students
  await db // get students
    .promise()
    .query(q)
    .then((res) => (students = res[0]))
    .catch(console.log)
  return students
}
const getTutors = async () => {
  const q = 'select ID,Subject from Tutors;'
  let tutors
  await db // get tutors
    .promise()
    .query(q)
    .then((res) => (tutors = res[0]))
    .catch(console.log)
  return tutors
}

const insertAppointments = async () => {
  const q =
    "insert into Appointments (StudentID,TutorID,AppointmentDate,StartTime,EndTime,Subject,AppointmentNotes,MeetingLink) values (?,?,str_to_date(?,'%m-%d-%Y'),?,?,?,?,null);"

  let students = await getStudents()
  let tutors = await getTutors()
  for (let i = 0; i < 10; i++) {
    let time = chance.integer({ min: 0, max: 23 }) * 10000
    let date = chance
      .date({ string: true, year: 2023, month: 9 })
      .replaceAll('/', '-')
    let student =
      await students[chance.integer({ min: 0, max: students.length })]
    let tutor = await tutors[chance.integer({ min: 0, max: tutors.length })]
    await db
      .promise()
      .query(q, [
        student.ID,
        tutor.ID,
        date,
        time,
        time + 10000,
        tutor.Subject,
        chance.sentence(),
      ])
      .catch(console.log)
  }
}

const insertFavorites = async () => {
  const q =
    'insert into FavoritesList values ((select ID from Students order by rand() limit 1),(select ID from Tutors order by rand() limit 1));'

  for (let i = 0; i < 25; i++)
    await db
      .promise()
      .query(q)
      .catch((err) => console.log(err.sqlMessage))
}

const insertCrimnals = async () => {
  const insertCrimnals = ' insert into Criminals values (?,?,aes_encrypt(?,?));'
  for (let i = 0; i < 10; i++)
    await db
      .promise()
      .query(insertCrimnals, [
        chance.first(),
        chance.last(),
        chance.email(),
        process.env.AES_KEY,
      ])
      .catch(console.log)
}

await insertStudents()
await insertTutors()
await insertAppointments()
await insertFavorites()
await insertCrimnals()

db.end()
