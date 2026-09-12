import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Layers,
  Info,
  Search,
  User,
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
  Send
} from "lucide-react";
import "./styles.css";

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
    "Operating System", "Theory of Computation", "Design and Analysis of Algorithms",
    "Computer Organization & Architecture", "Object Oriented Programming Using JAVA", "Linux Lab", "Java Lab"
  ],
  3: [
    "Software Engineering", "Computer Graphics", "Advanced DBMS",
    "Java Programming", "Data Mining", "Java Lab"
  ],
  4: [
    "Cloud Computing", "Artificial Intelligence", "Cyber Security",
    "Machine Learning", "Project Work"
  ],
  5: [
    "Advanced Web Development", "Big Data Analytics", "DevOps",
    "Elective I", "Major Project"
  ],
  6: [
    "Major Project", "Seminar", "Industrial Training", "Viva Voce"
  ]
};

const updates = [
  ["13 Sep 2026", "Welcome to MCA Notes Portal!"]
];

const cardClasses = ["blue", "green", "pink", "purple", "yellow", "cyan", "pink"];

function App() {
  const [semester, setSemester] = useState(1);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const subjects = useMemo(() => {
    return subjectsBySemester[semester].filter(s =>
      s.toLowerCase().includes(search.toLowerCase())
    );
  }, [semester, search]);

  const selectSemester = (sem) => {
    setSemester(sem);
    setSearch("");
    document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header className="header">
        <div className="container nav">
          <a className="brand" href="#home">
            <img src={`${import.meta.env.BASE_URL}assets/university-seal.png`} alt="University seal" />
            <div>
              <div className="brand-title"> KUU MCA <span>Notes Portal</span></div>
              <div className="brand-subtitle">UNIVERSITY, BERHAMPUR, ODISHA</div>
              <div className="brand-tagline">Learn Together, Grow Together</div>
            </div>
          </a>

          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X /> : <Menu />}
          </button>

          <nav className={mobileOpen ? "main-nav open" : "main-nav"}>
            <a className="active" href="#home" onClick={() => setMobileOpen(false)}><GraduationCap size={19}/> Home</a>
            <a href="#semesters" onClick={() => setMobileOpen(false)}><BookOpen size={19}/> Semesters</a>
            <a href="#subjects" onClick={() => setMobileOpen(false)}><Layers size={19}/> Subjects</a>
            <a href="#about" onClick={() => setMobileOpen(false)}><Info size={19}/> About</a>
          </nav>

          <div className="nav-actions">
            <label className="search">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes, subjects..." />
              <Search size={22}/>
            </label>
            <button className="login" onClick={() => setLoginOpen(true)}><User size={18}/> Login</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-overlay"/>
          <div className="container hero-content">
            <div className="eyebrow">OFFICIAL STUDENT NOTES PORTAL</div>
            <h1>MCA <span>Notes Portal</span></h1>
            <h2>UNIVERSITY, BERHAMPUR, ODISHA</h2>
            <div className="hero-line"/>
            <p className="hero-features">Semester-wise <b>|</b> Subject-wise <b>|</b> Daily Notes</p>
            <p className="quote">“Knowledge Today, Better Tomorrow”</p>

            <div className="hero-stats">
              <div><span><BookOpen/></span><strong>Study</strong><small>Smart</small></div>
              <div><span><Users/></span><strong>Share</strong><small>Learn</small></div>
              <div><span><BarChart3/></span><strong>Grow</strong><small>Together</small></div>
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
              {[1,2,3,4,5,6].map(sem => (
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
              <p>Click on any subject to view daily notes, topics and study material</p>
            </div>
            <button className="view-all" onClick={() => setSearch("")}>View All Subjects <ChevronRight size={17}/></button>
          </div>

          <div className="layout">
            <div className="subject-grid">
              {subjects.length ? subjects.map((subject, i) => (
                <article
                  className={`subject-card ${cardClasses[i % cardClasses.length]}`}
                  key={subject}
                  onClick={() => alert(`Opening notes for: ${subject}`)}
                >
                  <Folder className="folder" size={43}/>
                  <span className="number">{i + 1}.</span>
                  <h3>{subject}</h3>
                  <div className="view-notes"><FileText size={17}/> View Notes</div>
                  <div className="round-arrow"><ChevronRight size={20}/></div>
                </article>
              )) : (
                <div className="empty">No subjects found for “{search}”.</div>
              )}
            </div>

            <aside className="sidebar">
              <div className="panel">
                <div className="panel-title"><Megaphone size={20}/> Latest Updates <a href="#updates">View All</a></div>
                <div className="updates" id="updates">
                  {updates.map(([date, text]) => (
                    <div className="update" key={date + text}>
                      <time>{date}</time><b>{text}</b>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-title"><LinkIcon size={20}/> Quick Links</div>
                <div className="quick-links">
                  <a href="#subjects"><Package size={17}/><span>All Subjects</span><ChevronRight size={17}/></a>
                  <a href="#"><BookOpen size={17}/><span>Study Material</span><ChevronRight size={17}/></a>
                  <a href="#"><FileText size={17}/><span>Previous Year Papers</span><ChevronRight size={17}/></a>
                  <a href="#"><Layers size={17}/><span>Syllabus</span><ChevronRight size={17}/></a>
                  <a href="#contact"><LinkIcon size={17}/><span>Contact / Feedback</span><ChevronRight size={17}/></a>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <footer id="about">
        <div className="container footer-wrap">
          <div className="footer-brand">
            <img src="/assets/university-seal.png" alt="University seal"/>
            <div>
              <strong>MCA Notes Portal</strong>
              <span>UNIVERSITY, BERHAMPUR, ODISHA</span>
              <small>For MCA Students, By MCA Students</small>
            </div>
          </div>
          <div className="footer-quote">“Knowledge Today, Better Tomorrow”<div className="tiny-line"/></div>
          <div className="social">
            <div><span>Instagram</span><span>Instagram</span> <Send/></div>
            <small>© 2026 MCA Notes Portal. All rights reserved.</small>
          </div>
        </div>
      </footer>

      {loginOpen && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setLoginOpen(false)}>
          <div className="modal-card">
            <button className="close" onClick={() => setLoginOpen(false)}><X/></button>
            <h2>Student Login</h2>
            <p>Sign in to access personalized notes.</p>
            <input type="email" placeholder="Email address"/>
            <input type="password" placeholder="Password"/>
            <button className="primary">Login</button>
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
