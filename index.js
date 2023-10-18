import express from 'express'
import mysql from "mysql2"
import cors from 'cors'


const app = express()



const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Irving2028!",
    database:"test_onlinetutor"
})

app.use(express.json());
app.use(cors());

app.get("/", (req, res) =>{
    res.json("hello this is the backend")
})

//endpoint tutors
app.get("/tutors", (req, res) =>{
    const q = "SELECT * FROM tutors"
    db.query(q, (err, data) =>{
        if(err) return res.json(err)
        return res.json(data)
    })
})

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

//end point for delete operation
app.delete("/tutors/:ID", (req, res)=>{
    const tutorsID = req.params.ID;
    const q = "DELETE FROM tutors WHERE ID = ?"

    db.query(q, [tutorsID], (err, data)=>{
        if(err) return res.json(err);
        return res.json("tutors profile has been deleted succeffully.");

    })
})


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

app.listen(8800, () => {
    console.log("Connected to backend!")
})