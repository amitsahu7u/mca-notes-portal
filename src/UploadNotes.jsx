import { useEffect, useState } from "react";
import { auth, db } from "./firebase";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import "./style.css";
import {
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_UPLOAD_PRESET,
} from "./cloudinary";

const semesters = {
  1: [
    "C Programming and Data Structure",
    "Database Management System",
    "Data Communication and Computer Networks",
    "Mathematical Foundation of Computer Science",
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

};

export default function UploadNotes() {
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // =========================
  // LOAD NOTES
  // =========================
  const loadNotes = async () => {
    try {
      setLoadingNotes(true);

      const snapshot = await getDocs(collection(db, "notes"));

      const loadedNotes = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      loadedNotes.sort((a, b) => {
        const aTime = a.uploadedAt?.seconds || 0;
        const bTime = b.uploadedAt?.seconds || 0;

        return bTime - aTime;
      });

      setNotes(loadedNotes);
    } catch (error) {
      console.error(error);
      setMessage(`❌ Failed to load notes: ${error.message}`);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // =========================
  // UPLOAD
  // =========================
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
      setProgress(0);
      setMessage("");

      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
      );

      const cloudinaryData = await new Promise(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open("POST", CLOUDINARY_UPLOAD_URL);

          xhr.upload.addEventListener(
            "progress",
            (event) => {
              if (event.lengthComputable) {
                setProgress(
                  Math.round(
                    (event.loaded / event.total) * 100
                  )
                );
              }
            }
          );

          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);

              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(data);
              } else {
                reject(
                  new Error(
                    data?.error?.message ||
                      "Cloudinary upload failed"
                  )
                );
              }
            } catch {
              reject(
                new Error("Invalid Cloudinary response")
              );
            }
          };

          xhr.onerror = () => {
            reject(
              new Error("Network error during upload")
            );
          };

          xhr.send(formData);
        }
      );

      setProgress(100);

      await addDoc(collection(db, "notes"), {
        title: title.trim(),
        semester: String(semester),
        subject,
        fileUrl: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        fileSize: file.size,
        uploadedBy: auth.currentUser.email,
        uploadedAt: serverTimestamp(),
      });

      setTitle("");
      setSemester("");
      setSubject("");
      setFile(null);
      setProgress(0);

      const fileInput =
        document.getElementById("pdf-file");

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage("Notes uploaded successfully!");

      await loadNotes();

      window.dispatchEvent(new Event("notes-updated"));
    } catch (error) {
      console.error(error);
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id, noteTitle) => {
    const confirmed = window.confirm(
      `Delete "${noteTitle}" from the notes list?`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "notes", id));

      setMessage("Note deleted successfully.");

      await loadNotes();

      window.dispatchEvent(new Event("notes-updated"));
    } catch (error) {
      console.error(error);
      setMessage(`Delete failed: ${error.message}`);
    }
  };

  // =========================
  // EDIT
  // =========================
  const startEdit = (note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
  };

  const saveEdit = async (id) => {
    if (!editingTitle.trim()) {
      alert("Note title cannot be empty.");
      return;
    }

    try {
      await updateDoc(doc(db, "notes", id), {
        title: editingTitle.trim(),
      });

      setEditingId(null);
      setEditingTitle("");

      setMessage("Note title updated.");

      await loadNotes();

      window.dispatchEvent(new Event("notes-updated"));
    } catch (error) {
      console.error(error);
      setMessage(`Update failed: ${error.message}`);
    }
  };

  // =========================
  // FILE SIZE
  // =========================
  const formatFileSize = (bytes) => {
    if (!bytes) return "Size unavailable";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // =========================
  // FILTER
  // =========================
  const filteredNotes = notes.filter((note) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      note.title?.toLowerCase().includes(searchText) ||
      note.subject?.toLowerCase().includes(searchText);

    const matchesSemester =
      filterSemester === "all" ||
      note.semester === filterSemester;

    return matchesSearch && matchesSemester;
  });

  return (
    <div className="admin-dashboard">

      {/* =========================
          HEADER
      ========================= */}
      <div className="admin-header">
        <div>
          <div className="admin-title">
            <span className="admin-title-icon">📚</span>

            <div>
              <h2>Admin Dashboard</h2>

              <p>
                Manage MCA notes and study materials
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={loadNotes}
          disabled={loadingNotes}
        >
          ↻ Refresh
        </button>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="admin-stats">

        <div className="stat-card">
          <div className="stat-icon purple">
            📄
          </div>

          <div>
            <span>Total Notes</span>
            <strong>{notes.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            🎓
          </div>

          <div>
            <span>Semesters</span>
            <strong>4</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            👤
          </div>

          <div>
            <span>Admin</span>
            <strong>Authorized</strong>
          </div>
        </div>

      </div>

      {/* =========================
          UPLOAD CARD
      ========================= */}
      <section className="admin-card upload-card">

        <div className="section-heading">
          <div className="section-icon">
            ↑
          </div>

          <div>
            <h3>Upload New Notes</h3>
            <p>
              Add PDF study material for students
            </p>
          </div>
        </div>

        <form
          className="admin-upload-form"
          onSubmit={handleUpload}
        >

          <div className="form-grid">

            <div className="form-group">
              <label>Semester</label>

              <select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setSubject("");
                }}
                disabled={uploading}
              >
                <option value="">
                  Select Semester
                </option>

                {Object.keys(semesters).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject</label>

              <select
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
                disabled={!semester || uploading}
              >
                <option value="">
                  Select Subject
                </option>

                {semester &&
                  semesters[semester].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>Note Title</label>

            <input
              type="text"
              placeholder="Example: Unit 1 Notes"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>PDF File</label>

            <label
              htmlFor="pdf-file"
              className="file-upload-box"
            >
              <span className="file-upload-icon">
                📄
              </span>

              <span>
                {file
                  ? file.name
                  : "Choose PDF file"}
              </span>

              <small>
                {file
                  ? formatFileSize(file.size)
                  : "Maximum file size 10 MB"}
              </small>
            </label>

            <input
              id="pdf-file"
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploading}
              onChange={(e) => {
                setFile(
                  e.target.files[0] || null
                );
              }}
              className="hidden-file-input"
            />
          </div>

          {/* Progress */}
          {uploading && (
            <div className="upload-progress">

              <div className="progress-info">
                <span>Uploading PDF...</span>
                <strong>{progress}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

            </div>
          )}

          <button
            type="submit"
            className="upload-main-btn"
            disabled={uploading}
          >
            {uploading
              ? `Uploading ${progress}%`
              : "↑ Upload Notes"}
          </button>

        </form>
      </section>

      {/* =========================
          MESSAGE
      ========================= */}
      {message && (
        <div className="admin-message">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* =========================
          NOTES SECTION
      ========================= */}
      <section className="admin-card notes-card">

        <div className="notes-header">

          <div className="section-heading">
            <div className="section-icon">
              ☷
            </div>

            <div>
              <h3>
                Uploaded Notes
                <span className="notes-count">
                  {filteredNotes.length}
                </span>
              </h3>

              <p>
                View and manage uploaded study materials
              </p>
            </div>
          </div>

          <select
            className="semester-filter"
            value={filterSemester}
            onChange={(e) =>
              setFilterSemester(e.target.value)
            }
          >
            <option value="all">
              All Semesters
            </option>

            {Object.keys(semesters).map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

        </div>

        {/* Search */}
        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search notes or subjects..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        {/* Loading */}
        {loadingNotes && (
          <div className="empty-notes">
            Loading notes...
          </div>
        )}

        {/* Empty */}
        {!loadingNotes &&
          filteredNotes.length === 0 && (
            <div className="empty-notes">
              <div>📭</div>
              <strong>No notes found</strong>
              <span>
                Upload a PDF or change your search.
              </span>
            </div>
          )}

        {/* Notes */}
        {!loadingNotes &&
          filteredNotes.map((note) => (
            <div
              className="note-admin-item"
              key={note.id}
            >

              <div className="note-main">

                <div className="note-subject">
                  Semester {note.semester}
                  <span>•</span>
                  {note.subject}
                </div>

                {editingId === note.id ? (
                  <div className="edit-row">

                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) =>
                        setEditingTitle(
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        saveEdit(note.id)
                      }
                      className="save-btn"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setEditingId(null);
                        setEditingTitle("");
                      }}
                    >
                      Cancel
                    </button>

                  </div>
                ) : (
                  <h4>
                    <span className="pdf-icon">
                      PDF
                    </span>

                    {note.title}
                  </h4>
                )}

                <div className="note-meta">

                  <span>
                    💾{" "}
                    {formatFileSize(
                      note.fileSize
                    )}
                  </span>

                  <span>
                    👤{" "}
                    {note.uploadedBy ||
                      "Authorized Admin"}
                  </span>

                </div>

              </div>

              {editingId !== note.id && (
                <div className="note-actions">

                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                  >
                    👁 View PDF
                  </a>

                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                      startEdit(note)
                    }
                  >
                    ✎ Edit
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        note.id,
                        note.title
                      )
                    }
                  >
                    🗑 Delete
                  </button>

                </div>
              )}

            </div>
          ))}

      </section>
    </div>
  );
}