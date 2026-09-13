import { useState } from "react";
import { auth, db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CLOUDINARY_UPLOAD_URL } from "./cloudinary";

const semesters = {
  1: [
    "C Programming and Data Structure",
    "Database Management System",
    "Data Communication and Computer Networks",
    "Mathematical Foundation of Computer Applications",
    "Communicative English",
    "Programming in C & Data Structure Lab",
    "Oracle Lab",
  ],
  2: [
    "Operating System",
    "Theory of Computation",
    "Design and Analysis of Algorithms",
    "Computer Organization & Architecture",
    "Object Oriented Programming Using JAVA",
    "Linux Lab",
    "Java Lab",
  ],
  3: [
    "Software Engineering",
    "Computer Graphics",
    "Advanced DBMS",
    "Java Programming",
    "Data Mining",
    "Java Lab",
  ],
  4: [
    "Cloud Computing",
    "Artificial Intelligence",
    "Cyber Security",
    "Machine Learning",
    "Project Work",
  ],
  5: [
    "Advanced Web Development",
    "Big Data Analytics",
    "DevOps",
    "Elective I",
    "Major Project",
  ],
  6: [
    "Major Project",
    "Seminar",
    "Industrial Training",
    "Viva Voce",
  ],
};

export default function UploadNotes() {
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setMessage("Please login first.");
      return;
    }

    if (!semester || !subject || !title || !file) {
      setMessage("Please fill all fields and select a PDF.");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("PDF must be smaller than 10 MB.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // Upload PDF to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "mca_notes_upload");

      console.log("Cloudinary URL:", CLOUDINARY_UPLOAD_URL);
      console.log("Cloudinary preset:", "mca_notes_upload");

      const cloudinaryResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const cloudinaryData = await cloudinaryResponse.json();

      if (!cloudinaryResponse.ok) {
      console.log("Cloudinary Status:", cloudinaryResponse.status);
      console.log("Cloudinary Response:", cloudinaryData);
      console.log(
       "X-Cld-Error:",
      cloudinaryResponse.headers.get("X-Cld-Error")
      );

  throw new Error(
    cloudinaryData?.error?.message || "Cloudinary upload failed"
  );
}

      // Save note information in Firestore
      await addDoc(collection(db, "notes"), {
        title,
        semester: String(semester),
        subject,
        fileUrl: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        uploadedBy: auth.currentUser.email,
        uploadedAt: serverTimestamp(),
      });

      setTitle("");
      setSemester("");
      setSubject("");
      setFile(null);
      document.getElementById("pdf-file").value = "";

      setMessage("✅ Notes uploaded successfully!");
    } catch (error) {
      console.error(error);
      setMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-notes-box">
      <h2>Upload Notes</h2>

      <form onSubmit={handleUpload}>
        <label>Semester</label>

        <select
          value={semester}
          onChange={(e) => {
            setSemester(e.target.value);
            setSubject("");
          }}
        >
          <option value="">Select Semester</option>

          {Object.keys(semesters).map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>

        <label>Subject</label>

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={!semester}
        >
          <option value="">Select Subject</option>

          {semester &&
            semesters[semester].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>

        <label>Note Title</label>

        <input
          type="text"
          placeholder="Example: Unit 1 Notes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>PDF File</label>

        <input
          id="pdf-file"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Notes"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}