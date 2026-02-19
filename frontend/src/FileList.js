import { useEffect, useState } from "react";
import axios from "axios";

function FileList() {
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    const res = await axios.get("http://localhost:5000/api/files");
    setFiles(res.data);
  };

  const deleteFile = async (id) => {
    await axios.delete(`http://localhost:5000/api/files/${id}`);
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
          <a href={`http://localhost:5000/api/files/download/${f._id}`}>
            <button>Download</button>
          </a>
          <button onClick={() => deleteFile(f._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default FileList;
