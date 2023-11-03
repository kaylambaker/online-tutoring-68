import React, { useEffect } from "react";
import axios from "axios";

function FileUpload() {
  const [file, setFile] = React.useState();
  const [data, setData] = React.useState([]);
  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };
  useEffect(() => {
    axios
      .get("http://localhost:8800/")
      .then((res) => {
        setData(res.data[0]);
      })
      .catch((err) => console.log(err));
  }, []);
  const handleUpload = () => {
    const formData = new FormData();
    formData.append("image", file);
    axios
      .put("http://localhost:8800/users/profile_picture/34", formData)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };
  return (
    <div className="container">
      <input type="file" onChange={handleFile} />
      <button onClick={handleUpload}>upload</button>
      <img
        src={`http://localhost:8800/images/` + data.ProfilePictureID} // Sửa lại đường dẫn ở đây
        alt=""
        width="50"
        height="50"
      />
    </div>
  );
}

export default FileUpload;
