import React, { useMemo, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { AUTHORIZED_USERS } from "./authorizedUsers";
import Login from "./Login";
import UploadNotes from "./UploadNotes";
import { collection, onSnapshot } from "firebase/firestore";

import {
  BookOpen,
  Layers,
  Info,
  Search,
  Menu,
  X,
  Folder,
  FileText,
  ChevronRight,
  Megaphone,
  Link as LinkIcon,
  Package,
  GraduationCap,
  Users,
  BarChart3,
  Send,
  Code2,
  Database,
  Network,
  Calculator,
  Languages,
  Terminal,
  HardDrive,
  GitBranch,
  Binary,
  Cpu,
  Coffee,
  Brain,
  Settings2,
  Wifi,
  Shield,
  Globe2,
  Boxes,
  Cloud,
} from "lucide-react";

import "./style.css";

const subjectsBySemester = {
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
    "Compiler Design",
    "Artificial Intelligence  and  Machine Learning",
    "Software Engineering",
    "Internet of Things(IOT)",
    "Elective I Cryptography & network security Digital Image Processing(DIP) Big data Analytics",
    "Python Lab",
    "Web Technology Lab ",
    "MINI PROJECT",
  ],
  4: [
    "Data Science & Analytics",
    "Software Project Management",
    "Elective II Cloud Computing Soft Computing Social Network and Analysis",
    "MAJOR PROJECT",
  ],
};

const cardClasses = [
  "blue",
  "green",
  "pink",
  "purple",
  "yellow",
  "cyan",
  "pink",
];

const subjectIcons = {
  "C Programming and Data Structure": Code2,
  "Database Management System": Database,
  "Data Communication and Computer Networks": Network,
  "Mathematical Foundation of Computer Applications": Calculator,
  "Communicative English": Languages,
  "Programming in C & Data Structure Lab": Terminal,
  "Oracle Lab": Database,

  "Operating System": HardDrive,
  "Theory of Computation": GitBranch,
  "Design and Analysis of Algorithms": Binary,
  "Computer Organization & Architecture": Cpu,
  "Object Oriented Programming Using JAVA": Coffee,
  "Linux Lab": Terminal,
  "Java Lab": Coffee,

  "Compiler Design": Code2,
  "Artificial Intelligence  and  Machine Learning": Brain,
  "Software Engineering": Settings2,
  "Internet of Things(IOT)": Wifi,
  "Elective I Cryptography & network security Digital Image Processing(DIP) Big data Analytics": Shield,
  "Python Lab": Code2,
  "Web Technology Lab ": Globe2,
  "MINI PROJECT": Boxes,

  "Data Science & Analytics": BarChart3,
  "Software Project Management": Settings2,
  "Elective II Cloud Computing Soft Computing Social Network and Analysis": Cloud,
  "MAJOR PROJECT": Boxes,
}

const subjectThemeClasses = {
  "C Programming and Data Structure": "theme-c",
  "Database Management System": "theme-dbms",
  "Data Communication and Computer Networks": "theme-network",
  "Mathematical Foundation of Computer Applications": "theme-math",
  "Communicative English": "theme-english",
  "Programming in C & Data Structure Lab": "theme-c-lab",
  "Oracle Lab": "theme-oracle",

  "Operating System": "theme-os",
  "Theory of Computation": "theme-toc",
  "Design and Analysis of Algorithms": "theme-daa",
  "Computer Organization & Architecture": "theme-coa",
  "Object Oriented Programming Using JAVA": "theme-java",
  "Linux Lab": "theme-linux",
  "Java Lab": "theme-java-lab",

  "Compiler Design": "theme-compiler",
  "Artificial Intelligence  and  Machine Learning": "theme-ai",
  "Software Engineering": "theme-software",
  "Internet of Things(IOT)": "theme-iot",
  "Elective I Cryptography & network security Digital Image Processing(DIP) Big data Analytics": "theme-security",
  "Python Lab": "theme-python",
  "Web Technology Lab ": "theme-web",
  "MINI PROJECT": "theme-project",

  "Data Science & Analytics": "theme-data",
  "Software Project Management": "theme-management",
  "Elective II Cloud Computing Soft Computing Social Network and Analysis": "theme-cloud",
  "MAJOR PROJECT": "theme-major",
};
;

function App() {
  const [semester, setSemester] = useState(1);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState([]);

  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Automatically enter the website after 3 seconds.
  useEffect(() => {
    if (!showWelcomeCard) return;

    const timer = setTimeout(() => {
      setShowWelcomeCard(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showWelcomeCard]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const email = user?.email?.trim().toLowerCase();

      if (user && AUTHORIZED_USERS.includes(email)) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setShowUpload(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "notes"),
      (snapshot) => {
        const loadedNotes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotes(loadedNotes);
        console.log("Realtime notes:", loadedNotes);
      },
      (error) => {
        console.error("Error listening to notes:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const subjects = useMemo(() => {
    return subjectsBySemester[semester].filter((subject) =>
      subject.toLowerCase().includes(search.toLowerCase())
    );
  }, [semester, search]);

  const selectSemester = (sem) => {
    setSemester(sem);
    setSearch("");
    document
      .getElementById("subjects")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setShowUpload(false);
      setMobileOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openLogin = () => {
    setMobileOpen(false);
    setShowUpload(false);
    setShowLogin(true);
  };

  const enterWebsite = () => setShowWelcomeCard(false);
  const openSubjectPage = (subject) => {
    setSelectedSubject(subject);
    setMobileOpen(false);
    setShowUpload(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeSubjectPage = () => {
    setSelectedSubject(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedNotes = selectedSubject
    ? notes.filter(
        (note) =>
          note.semester === String(semester) &&
          note.subject === selectedSubject
      )
    : [];


  const latestUpdates = useMemo(() => {
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
      .sort(
        (a, b) => getTime(b.uploadedAt) - getTime(a.uploadedAt)
      )
      .map((note) => ({
        date: formatDate(note.uploadedAt),
        text: `New Note: ${note.title || "New Study Material"}`,
        subject: note.subject || "",
      }));
  }, [notes]);


  return (
    <>
      {showWelcomeCard && (
        <div
          className="welcome-screen"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to MCA Notes Portal"
          onClick={enterWebsite}
        >
          <button
            type="button"
            className="welcome-card"
            onClick={enterWebsite}
            aria-label="Click to enter MCA Notes Portal"
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/amit-sahu-developer-card.png`}
              alt="Built by Amit Sahu — MCA Student Developer"
              className="welcome-card-image"
            />
            <span className="welcome-enter">CLICK TO ENTER</span>
          </button>
        </div>
      )}

      {selectedSubject && (
        <div className="subject-page-overlay">
          <div className="subject-page">
            <header className="subject-page-header">
              <div className="container subject-page-nav">
                <button
                  type="button"
                  className="back-subject-btn"
                  onClick={closeSubjectPage}
                >
                  <ChevronRight size={20} className="back-icon" />
                  Back to Subjects
                </button>

                <div className="subject-page-brand">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/university-seal.png`}
                    alt="University seal"
                  />
                  <div>
                    <strong>KUU MCA Notes Portal</strong>
                    <span>UNIVERSITY, BERHAMPUR, ODISHA</span>
                  </div>
                </div>
              </div>
            </header>

            <main className="subject-page-main">
              <div className="container">
                <div className="subject-page-title">
                  <div className="subject-page-icon">
                    <Folder size={34} />
                  </div>
                  <div>
                    <span>SEMESTER {semester}</span>
                    <h1>{selectedSubject}</h1>
                    <p>All notes and study material for this subject</p>
                  </div>
                </div>

                <div className="subject-page-toolbar">
                  <div>
                    <strong>{selectedNotes.length}</strong>
                    <span>
                      {selectedNotes.length === 1 ? " Note" : " Notes"} Available
                    </span>
                  </div>

                  <button type="button" onClick={closeSubjectPage}>
                    <ChevronRight size={17} className="back-icon" />
                    All Subjects
                  </button>
                </div>

                {selectedNotes.length > 0 ? (
                  <div className="all-notes-grid">
                    {selectedNotes.map((note, index) => (
                      <a
                        key={note.id}
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="full-note-card"
                      >
                        <div className="note-file-icon">
                          <FileText size={26} />
                        </div>

                        <div className="full-note-info">
                          <span className="note-index">
                            NOTE {String(index + 1).padStart(2, "0")}
                          </span>
                          <strong>{note.title}</strong>
                          <small>PDF • Click to open</small>
                        </div>

                        <ChevronRight size={21} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="subject-empty-state">
                    <FileText size={44} />
                    <h2>No Notes Available Yet</h2>
                    <p>Notes for this subject will appear here when uploaded.</p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      <header className="header">
        <div className="container nav">
          <a className="brand" href="#home">
            <img
              src={`${import.meta.env.BASE_URL}assets/university-seal.png`}
              alt="University seal"
            />
            <div>
              <div className="brand-title">
                KUU MCA <span>Notes Portal</span>
              </div>
              <div className="brand-subtitle">
                UNIVERSITY, BERHAMPUR, ODISHA
              </div>
              <div className="brand-tagline">
                Learn Together, Grow Together
              </div>
            </div>
          </a>

          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          <nav className={`main-nav ${mobileOpen ? "open" : ""}`}>
            <a className="active" href="#home" onClick={() => setMobileOpen(false)}>
              <GraduationCap size={19} /> Home
            </a>
            <a href="#semesters" onClick={() => setMobileOpen(false)}>
              <BookOpen size={19} /> Semesters
            </a>
            <a href="#subjects" onClick={() => setMobileOpen(false)}>
              <Layers size={19} /> Subjects
            </a>
            <a href="#about" onClick={() => setMobileOpen(false)}>
              <Info size={19} /> About
            </a>
            {currentUser ? (
              <>
                <button
                  type="button"
                  className="upload-notes-btn mobile-nav-action"
                  onClick={() => {
                    setShowUpload(true);
                    setMobileOpen(false);
                  }}
                >
                  📤 Upload Notes
                </button>

                <button
                  type="button"
                  className="logout-btn mobile-nav-action"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className="authorized-login-btn mobile-nav-action"
                onClick={openLogin}
              >
                🔐 Authorized Login
              </button>
            )}
          </nav>

          <div className="nav-actions">
            <label className="search">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes, subjects..."
              />
              <Search size={22} />
            </label>

            {currentUser ? (
              <>
               <button
                  type="button"
                  className="upload-notes-btn"
                  onClick={() => setShowUpload(!showUpload)}
                >
              📤 Upload Notes
              </button>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                className="authorized-login-btn"
                onClick={openLogin}
              >
           🔐 Authorized Login
             </button>
            )}
          </div>
        </div>
      </header>
        {showLogin &&
  !currentUser &&
  createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Authorized Login"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowLogin(false);
        }
      }}
    >
      <div className="modal-card">
        <button
          type="button"
          className="close"
          onClick={() => setShowLogin(false)}
          aria-label="Close login"
        >
          <X />
        </button>

        <Login
          onLogin={(user) => {
            setCurrentUser(user);
            setShowLogin(false);
          }}
        />
      </div>
    </div>,
    document.body
  )}

      {currentUser &&
        showUpload &&
        createPortal(
          <div
            className="upload-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Upload Notes"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUpload(false);
            }}
          >
            <div className="upload-modal-card">
              <button
                type="button"
                className="upload-modal-close"
                onClick={() => setShowUpload(false)}
                aria-label="Close upload notes"
              >
                <X />
              </button>
              <UploadNotes />
            </div>
          </div>,
          document.body
        )}
      <main>
        <section className="hero" id="home">
          <div className="hero-overlay" />
          <div className="container hero-content">
            <div className="eyebrow">OFFICIAL STUDENT NOTES PORTAL</div>
            <h1>MCA <span>Notes Portal</span></h1>
            <h2>UNIVERSITY, BERHAMPUR, ODISHA</h2>
            <div className="hero-line" />
            <p className="hero-features">
              Semester-wise <b>|</b> Subject-wise <b>|</b> Daily Notes
            </p>
            <p className="quote">“Knowledge Today, Better Tomorrow”</p>

            <div className="hero-stats">
              <div>
                <span><BookOpen /></span>
                <strong>Study</strong>
                <small>Smart</small>
              </div>
              <div>
                <span><Users /></span>
                <strong>Share</strong>
                <small>Learn</small>
              </div>
              <div>
                <span><BarChart3 /></span>
                <strong>Grow</strong>
                <small>Together</small>
              </div>
            </div>
          </div>
        </section>

        <section className="semester-bar" id="semesters">
          <div className="container semester-wrap">
            <div>
              <h3>Choose Your Semester</h3>
              <p>Select your semester to view subject-wise daily notes</p>
            </div>
            <div className="tabs">
              {[1, 2, 3, 4].map((sem) => (
                <button
                  key={sem}
                  className={semester === sem ? "tab selected" : "tab"}
                  onClick={() => selectSemester(sem)}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="container content" id="subjects">
          <div className="section-heading">
            <div>
              <h2>Semester {semester} – Subjects</h2>
              <p>
                Click on any subject to view daily notes, topics and study material
              </p>
            </div>
            <button className="view-all" onClick={() => setSearch("")}>
              View All Subjects <ChevronRight size={17} />
            </button>
          </div>

          <div className="layout">
            <div className="subject-grid">
              {subjects.length ? (
                subjects.map((subject, i) => (
                  <article
                    className={`subject-card ${subjectThemeClasses[subject] || "theme-default"}`}
                    key={subject}
                    role="button"
                    tabIndex={0}
                    onClick={() => openSubjectPage(subject)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSubjectPage(subject);
                      }
                    }}
                  >
                    <div className="subject-bg-art" aria-hidden="true">
                      <span className="art-symbol art-symbol-1" />
                      <span className="art-symbol art-symbol-2" />
                      <span className="art-symbol art-symbol-3" />
                      <span className="art-orbit orbit-1" />
                      <span className="art-orbit orbit-2" />
                      <span className="art-glow" />
                    </div>

                    <div className={`subject-icon-3d icon-${cardClasses[i % cardClasses.length]}`}>
                      {(() => {
                        const SubjectIcon = subjectIcons[subject] || Folder;

                        return (
                          <SubjectIcon
                            className="subject-icon-svg"
                            size={31}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        );
                      })()}
                    </div>
                    <span className="number"> {i + 1}.</span>
                    <h3>{subject}</h3>

                    <div className="view-notes">
                      <FileText size={17} />
                      <span>
                        {notes.filter(
                          (note) =>
                            note.semester === String(semester) &&
                            note.subject === subject
                        ).length}{" "}
                        Notes • Click to View
                      </span>
                    </div>

                    <div className="round-arrow">
                      <ChevronRight size={20} />
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty">
                  No subjects found for “{search}”.
                </div>
              )}
            </div>

            <aside className="sidebar">
              <div className="panel">
                <div className="panel-title">
                  <Megaphone size={20} />
                  Latest Updates

                  {latestUpdates.length > 0 && (
                    <a
                      href={`${import.meta.env.BASE_URL}updates.html`}
                    >
                      View All
                    </a>
                  )}
                </div>

                <div className="updates" id="updates">
                  {latestUpdates.length > 0 ? (
                    latestUpdates.slice(0, 5).map((update, index) => (
                      <div
                        className="update"
                        key={`${update.date}-${update.text}-${index}`}
                      >
                        <time>{update.date}</time>
                        <div>
                          <b>{update.text}</b>
                          {update.subject && <small>{update.subject}</small>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="update">
                      <time>—</time>
                      <b>No new updates yet</b>
                    </div>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">
                  <LinkIcon size={20} /> Quick Links
                </div>
                <div className="quick-links">
                  <a href="#subjects">
                    <Package size={17} /><span>All Subjects</span><ChevronRight size={17} />
                  </a>
                  <a href="#">
                    <BookOpen size={17} /><span>Study Material</span><ChevronRight size={17} />
                  </a>
                  <a href="#">
                    <FileText size={17} /><span>Previous Year Papers</span><ChevronRight size={17} />
                  </a>
                  <a
                   href={`${import.meta.env.BASE_URL}notes/syllabus.pdf`}
                   target="_blank"
                   rel="noopener noreferrer"
                   title="Open MCA Syllabus PDF"
                  >
               <Layers size={17} />
              <span>Syllabus</span>
             <ChevronRight size={17} />
              </a>
                  <a href="#contact">
                    <LinkIcon size={17} /><span>Contact / Feedback</span><ChevronRight size={17} />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer id="about">
        <div className="container footer-wrap">
          <div className="footer-brand">
            <img
              src={`${import.meta.env.BASE_URL}assets/university-seal.png`}
              alt="University seal"
            />
            <div>
              <strong>MCA Notes Portal</strong>
              <span>UNIVERSITY, BERHAMPUR, ODISHA</span>
              <small>For MCA Students, By MCA Students</small>
            </div>
          </div>

          <div className="footer-quote">
            “Knowledge Today, Better Tomorrow”
            <div className="tiny-line" />
          </div>

          <div className="developer-card">
            <div className="developer-photo">
              <img
                src={`${import.meta.env.BASE_URL}assets/amit-sahu-developer-card.png`}
                alt="Amit Sahu"
              />
            </div>
            <div className="developer-details">
              <span className="developer-label">BUILT BY</span>
              <strong>Amit Sahu</strong>
              <span className="developer-role">MCA Student • Developer</span>
              <div className="developer-socials">
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="GitHub">GH</a>
                <a href="#" aria-label="Instagram">IG</a>
              </div>
            </div>
          </div>

          <div className="social">
            <div><span>Instagram</span><span>Instagram</span><Send /></div>
            <small>© 2026 MCA Notes Portal. All rights reserved.</small>
          </div>
        </div>
      </footer>


    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
