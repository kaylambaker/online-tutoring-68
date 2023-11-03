import { useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import axios from 'axios'

export default function TutorProfilePage() {
    let { id } = useParams()
    const [tutor, setTutor] = useState({
        id: id,
        first_name: "",
        last_name: "",
        bio: "",
        profile_picture_url: "https://fastly.picsum.photos/id/1/200/200.jpg?hmac=jZB9EZ0Vtzq-BZSmo7JKBBKJLW46nntxq79VMkCiBG8",
        subjects: [],
        available_hours_start: "",
        available_hours_end: ""
    });
    useEffect(() => {
        axios.get(`http://localhost:8800/tutors/${id}`)
            .then((response)=>{
                let profile_picture_url = tutor.profile_picture_url;
                if(response.data.ProfilePictureID) {
                    profile_picture_url = `http://localhost:8800/images/${response.data.ProfilePictureID}`;
                }
                setTutor({
                    ...tutor,
                    id: response.data.ID,
                    first_name: response.data.FirstName,
                    last_name: response.data.LastName,
                    bio: response.data.Bio,
                    subjects: [response.data.Subject],
                    available_hours_start: response.data.AvailableHoursStart,
                    available_hours_end: response.data.AvailableHoursEnd,
                    profile_picture_url: profile_picture_url
                })
            }).catch((error)=>{
                alert(error.response.data.sqlMessage || error)
            });
    }, [])
    return (
        <div className="flex flex-col gap-2 bg-gray-100 rounded-lg py-8 px-10 shadow-lg">
            <img src={tutor.profile_picture_url} className="rounded-xl w-1/2" />
            <h1 className="text-3xl font-bold ">
                {tutor.last_name}, {tutor.first_name}
            </h1>
            <p className="bg-gray-300 p-2 rounded-lg">
                {tutor.bio}
            </p>
            <div>
                <h2 className="text-xl font-bold">
                    Subjects
                </h2 >
                <ul className="flex gap-2">
                    {tutor.subjects.map((subject) => (<li key={subject} className="bg-blue-600 text-white px-2 py-1 rounded-lg">{subject}</li>))}
                </ul>
            </div>
            <div>
                <h2 className="text-xl font-bold">
                    General availability
                </h2>
                <h3>
                    Start: {tutor.available_hours_start} End: {tutor.available_hours_end}
                </h3>
            </div>
            <div>
                <a href="#" className="flex text-xl text-white justify-center bg-blue-500 hover:bg-blue-600 rounded-md p-2 w-full cursor-pointer">
                    Show Bookings
                </a>
            </div>
        </div>
    )
}