import React, { useRef } from "react";
import axios from "axios";

function PhotoVideoShare({ groupId, userEmail, onUpload, onUploading }) {
  const photoInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Only images and videos are allowed");
      return;
    }

    onUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("groupId", groupId);
    formData.append("email", userEmail);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const isVideo = file.type.startsWith("video/");
      const icon = isVideo ? "🎬" : "🖼️";

      onUpload({
        type: isVideo ? "video" : "photo",
        fileName: file.name,
        fileUrl: res.data.file.fileUrl,
        icon: icon,
      });
    } catch (err) {
      console.error("Error uploading photo/video:", err);
      alert("Failed to upload photo/video. Try another file.");
    } finally {
      onUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={photoInputRef}
        type="file"
        onChange={handleUpload}
        style={{ display: "none" }}
        accept="image/*,video/*"
      />
      <button
        type="button"
        onClick={() => photoInputRef.current?.click()}
        style={{ display: "none" }}
        className="hidden-photo-button"
      >
        Upload Photo/Video
      </button>
    </>
  );
}

export default PhotoVideoShare;
