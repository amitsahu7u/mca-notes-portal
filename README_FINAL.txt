FINAL MCA NOTES PORTAL SETUP

1. Copy src/main.jsx over your existing src/main.jsx.
2. Copy src/styles.css over your existing src/styles.css.
3. Copy src/UploadNotes.jsx over your existing src/UploadNotes.jsx.
4. Copy public/assets/subject-cards/ into public/assets/subject-cards/.
5. Run: npm run build
6. Then: git add . && git commit -m "Finalize subject cards and admin dashboard" && git push

Subject cards now use:
- left: number + subject name + notes count
- right: subject-specific image
- bottom-right: clean circular arrow
- static pastel theme
- no cinematic/animated card effects

UploadNotes admin dashboard CSS is scoped under .admin-dashboard.
