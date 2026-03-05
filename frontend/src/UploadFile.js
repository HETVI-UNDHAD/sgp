import axios from "axios";
import { API_URL } from "./config";

function UploadFile() {
  const upload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userEmail", "test@gmail.com");

    await axios.post(`${API_URL}/api/files/upload`, formData);
    alert("File Uploaded");
  };

  return <input type="file" onChange={upload} />;
}

export default UploadFile;
