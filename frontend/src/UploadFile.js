import axios from "axios";

function UploadFile() {
  const upload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userEmail", "test@gmail.com");

    await axios.post("http://localhost:5000/api/files/upload", formData);
    alert("File Uploaded");
  };

  return <input type="file" onChange={upload} />;
}

export default UploadFile;
