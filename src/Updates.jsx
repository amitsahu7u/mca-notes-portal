import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { ArrowLeft, Megaphone, FileText } from "lucide-react";
import { db } from "./firebase";
import "./style.css";

export default function Updates() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "notes"),
      (snapshot) => {
        const loadedNotes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotes(loadedNotes);
      },
      (error) => {
        console.error("Error loading updates:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const allUpdates = useMemo(() => {
    const getTime = (value) => {
      if (!value) return 0;

      if (typeof value?.toDate === "function") {
        return value.toDate().getTime();
      }

      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const formatDate = (value) => {
      if (!value) return "New";

      try {
        const date =
          typeof value?.toDate === "function"
            ? value.toDate()
            : new Date(value);

        if (Number.isNaN(date.getTime())) return "New";

        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return "New";
      }
    };

    return [...notes]
      .sort((a, b) => getTime(b.uploadedAt) - getTime(a.uploadedAt))
      .map((note) => ({
        id: note.id,
        date: formatDate(note.uploadedAt),
        title: note.title || "New Study Material",
        subject: note.subject || "",
        semester: note.semester || "",
        fileUrl: note.fileUrl || "",
      }));
  }, [notes]);

  return (
    <div className="updates-page">
      <header className="updates-page-header">
        <div className="container updates-page-nav">
          <a
            href={`${import.meta.env.BASE_URL}`}
            className="updates-back-btn"
          >
            <ArrowLeft size={18} />
            Back to Portal
          </a>

          <div className="updates-page-brand">
            <Megaphone size={22} />
            <div>
              <strong>MCA Notes Portal</strong>
              <span>All Latest Updates</span>
            </div>
          </div>
        </div>
      </header>

      <main className="updates-page-main">
        <div className="container">
          <div className="updates-page-hero">
            <span>PORTAL ACTIVITY</span>
            <h1>All Latest Updates</h1>
            <p>
              View all newly uploaded notes and previous study-material
              updates in one place.
            </p>
          </div>

          {allUpdates.length > 0 ? (
            <div className="updates-page-list">
              {allUpdates.map((update, index) => (
                <article className="updates-page-card" key={update.id}>
                  <div className="updates-page-date">
                    {update.date}
                  </div>

                  <div className="updates-page-icon">
                    <FileText size={22} />
                  </div>

                  <div className="updates-page-info">
                    <span>UPDATE #{String(index + 1).padStart(2, "0")}</span>
                    <h2>{update.title}</h2>

                    <p>
                      {update.semester
                        ? `Semester ${update.semester}`
                        : "MCA Notes Portal"}
                      {update.subject ? ` • ${update.subject}` : ""}
                    </p>
                  </div>

                  {update.fileUrl && (
                    <a
                      href={update.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="updates-open-btn"
                    >
                      Open Note
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="updates-page-empty">
              <Megaphone size={42} />
              <h2>No updates yet</h2>
              <p>New uploaded notes will appear here automatically.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
