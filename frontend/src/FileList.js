import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "./config";

function FileList() {
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const res = await axios.get(`${API_URL}/api/files`);
    setFiles(res.data);
  };

  const deleteFile = async (id) => {
    await axios.delete(`${API_URL}/api/files/${id}`);
    loadFiles();
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div>
      <h3>Files</h3>
      {files.map((f) => (
        <div key={f._id}>
          {f.originalName}
          <a href={`${API_URL}/api/files/download/${f._id}`}>
            <button>Download</button>
          </a>
          <button onClick={() => deleteFile(f._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default FileList;
