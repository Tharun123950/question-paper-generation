import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");

  const navigateTo = (newView) => {
    setView(newView);
    window.history.pushState({ view: newView }, "", `?view=${newView}`);
  };

  useEffect(() => {
    // Set initial state based on URL or default to home
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get("view") || "home";
    setView(initialView);
    window.history.replaceState({ view: initialView }, "", `?view=${initialView}`);

    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [papers, setPapers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [preview, setPreview] = useState("");
  const [currentPaperId, setCurrentPaperId] = useState(null);
  
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  const [file4, setFile4] = useState(null);
  const [file5, setFile5] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const [form, setForm] = useState({ unit: 1, marks: 2, text: "" });

  // ================= HEADER STATES =================
  const [year, setYear] = useState("");
  const [education, setEducation] = useState("");
  const [semester, setSemester] = useState("");
  const [exam_name, setExamName] = useState("");
  const [month_year, setMonthYear] = useState("");

  const [subject_name, setSubjectName] = useState("");

  const [exam_time, setExamTime] = useState("");
  const [max_marks, setMaxMarks] = useState("");
  const [branch_section, setBranchSection] = useState("");
  const [exam_date, setExamDate] = useState("");

  const [regulation, setRegulation] = useState("R23");

  const uploadFile = async (unit, file) => {
    if (!file) {
      alert("Please select a file first ❌");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/upload-pdf?unit=${unit}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setUploadMessage(
        `Unit ${unit}: ${res.data.questions_added} added, ${res.data.duplicates_skipped} skipped`
      );
      fetchQuestions();

    } catch (error) {
      setUploadMessage("Upload failed ❌");
    }
  };

  // ================= FETCH =================

  const fetchPapers = async () => {
    const res = await axios.get("http://127.0.0.1:5000/papers");
    setPapers(res.data.papers);
  };

  const fetchQuestions = async () => {
    const res = await axios.get("http://127.0.0.1:5000/questions");
    setQuestions(res.data.questions);
  };

  useEffect(() => {
    fetchPapers();
    fetchQuestions();
  }, []);

  // ================= GENERATE =================

  const generatePaper = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        "http://127.0.0.1:5000/generate-type1",
        {
          params: {
            year,
            education,
            semester,
            exam_name,
            month_year,
            subject_name,
            exam_time,
            max_marks,
            branch_section,
            exam_date,
            regulation
          }
        }
      );

      setPreview(response.data.content);
      setCurrentPaperId(response.data.paper_id);
      setMessage("Paper Generated Successfully ✅");
      fetchPapers();
      setLoading(false);

    } catch (error) {
      setLoading(false);
      setMessage("Duplicate Paper Detected ❌ (Or Not enough questions)");
    }
  };

  const generatePaper2 = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await axios.get(
        "http://127.0.0.1:5000/generate-type2",
        {
          params: {
            year,
            education,
            semester,
            exam_name,
            month_year,
            subject_name,
            exam_time,
            max_marks,
            branch_section,
            exam_date,
            regulation
          }
        }
      );

      setPreview(response.data.content);
      setCurrentPaperId(response.data.paper_id);
      setMessage("Paper Generated Successfully ✅");
      fetchPapers();
      setLoading(false);

    } catch (error) {
      setLoading(false);
      setMessage("Duplicate Paper Detected ❌ (Or Not enough questions)");
    }
  };

  // ================= DOWNLOAD =================

  const downloadPaper = async (id, format) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/download-paper/${id}?format=${format}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Question_Paper_${id}.${format}`);
      document.body.appendChild(link);
      link.click();

    } catch (error) {
      alert("Download failed ❌");
    }
  };

  // ================= ADMIN =================

  const addQuestion = async () => {
    await axios.post("http://127.0.0.1:5000/add-question", form);
    setForm({ unit: 1, marks: 2, text: "" });
    fetchQuestions();
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    await axios.delete(`http://127.0.0.1:5000/delete-question/${id}`);
    fetchQuestions();
  };

  const renderHeaderInputs = () => (
    <div className="row mb-3">
      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={year}
          onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="I">I</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={education}
          onChange={(e) => setEducation(e.target.value)}>
          <option value="">Select Education</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}>
          <option value="">Select Semester</option>
          <option value="I Semester">I Semester</option>
          <option value="II Semester">II Semester</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={exam_name}
          onChange={(e) => setExamName(e.target.value)}>
          <option value="">Select Exam</option>
          <option value="First Mid-Term Examination">Mid-1</option>
          <option value="Second Mid-Term Examination">Mid-2</option>
          <option value="Semester Examination">Semester</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={month_year}
          onChange={(e) => setMonthYear(e.target.value)}>
          <option value="">Select Month</option>
          <option value="January-2026">January-2026</option>
          <option value="February-2026">February-2026</option>
          <option value="March-2026">March-2026</option>
        </select>
      </div>
      
      <div className="col-md-4 mb-2">
        <input
          className="form-control"
          placeholder="Enter Subject Name"
          value={subject_name}
          onChange={(e) => setSubjectName(e.target.value)}
        /> 
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={exam_time}
          onChange={(e) => setExamTime(e.target.value)}>
          <option value="">Select Time</option>
          <option value="1 Hour 30 Minutes">1:30</option>
          <option value="1 Hour 50 Minutes">1:50</option>
          <option value="2 Hours">2:00</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={max_marks}
          onChange={(e) => setMaxMarks(e.target.value)}>
          <option value="">Select Marks</option>
          <option value="40">40</option>
          <option value="60">60</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <select className="form-select"
          value={branch_section}
          onChange={(e) => setBranchSection(e.target.value)}>
          <option value="">Select Branch</option>
          <option value="CSE-A">CSE-A</option>
          <option value="CSE-B">CSE-B</option>
          <option value="CSE-C">CSE-C</option>
          <option value="CSE-D">CSE-D</option>
        </select>
      </div>

      <div className="col-md-4 mb-2">
        <input
          type="date"
          className="form-control"
          value={exam_date}
          onChange={(e) => setExamDate(e.target.value)}
        />
      </div>

      <div className="col-md-4 mb-2">
        <input
          className="form-control"
          placeholder="Regulation"
          value={regulation}
          onChange={(e) => setRegulation(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <>
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="container mt-4">
          {/* Header with User Info and Logout */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="text-center fw-bold mb-0">
                Question Paper Generator System
              </h2>
              <p className="text-center text-muted mt-2">Welcome, {user?.username}!</p>
            </div>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* Stats */}
          {view !== 'home' && (
            <div className="row mb-4 text-center">
              <div className="col-md-6 mb-2">
                <div className="card shadow-sm p-3">
                  <h6 className="text-muted">Total Questions</h6>
                  <h3 className="text-success">{questions.length}</h3>
                </div>
              </div>

              <div className="col-md-6 mb-2">
                <div className="card shadow-sm p-3">
                  <h6 className="text-muted">Total Papers Generated</h6>
                  <h3 className="text-primary">{papers.length}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="text-center mb-4">
            <button
              className={`btn me-2 ${view === "home" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => navigateTo("home")}
            >
              Home
            </button>
            <button
              className={`btn me-2 ${view === "generator" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => navigateTo("generator")}
            >
              Mid 1 Generator
            </button>
            <button
              className={`btn me-2 ${view === "generator2" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => navigateTo("generator2")}
            >
              Mid 2 Generator
            </button>
            <button
              className={`btn ${view === "admin" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => navigateTo("admin")}
            >
              Admin Panel
            </button>
          </div>

          <hr className="my-4"/>

          {/* ================= HOME VIEW ================= */}
          {view === "home" && (
            <div className="card shadow-sm p-5 text-center">
                <h3>Select Paper Type</h3>
                <div className="mt-4">
                    <button className="btn btn-primary btn-lg me-3" onClick={() => navigateTo("generator")}>MID 1 Paper (Units 1,2)</button>
                    <button className="btn btn-success btn-lg" onClick={() => navigateTo("generator2")}>MID 2 Paper (Units 3,4,5)</button>
                </div>
            </div>
          )}

          {/* ================= MID 1 GENERATOR ================= */}
          {view === "generator" && (
            <>
              <div className="mb-3">
                 <button className="btn btn-outline-secondary" onClick={() => navigateTo("home")}>
                   &larr; Back to Home
                 </button>
              </div>
              {/* UPLOAD UNIT 1 & 2 */}
              <h5 className="mb-3">Upload Questions Files (Units 1 & 2)</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm">
                    <h6 className="mb-2">Upload Unit 1</h6>
                    <input type="file" className="form-control mb-2" onChange={(e) => setFile1(e.target.files[0])} />
                    <button className="btn btn-primary" onClick={() => uploadFile(1, file1)}>Upload Unit 1</button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card p-3 shadow-sm">
                    <h6 className="mb-2">Upload Unit 2</h6>
                    <input type="file" className="form-control mb-2" onChange={(e) => setFile2(e.target.files[0])} />
                    <button className="btn btn-success" onClick={() => uploadFile(2, file2)}>Upload Unit 2</button>
                  </div>
                </div>
              </div>
              {uploadMessage && <div className="alert alert-info mt-3">{uploadMessage}</div>}
              
              {/* GENERATE */}
              <div className="card shadow-sm p-4 mt-4">
                <h4 className="mb-3">Generate MID 1 Question Paper</h4>
                {renderHeaderInputs()}
                <button onClick={generatePaper} disabled={loading} className="btn btn-primary mb-3">
                  {loading ? "Generating..." : "Generate MID 1 Paper"}
                </button>
                {message && <div className="alert alert-info">{message}</div>}
              </div>
            </>
          )}

          {/* ================= MID 2 GENERATOR ================= */}
          {view === "generator2" && (
            <>
              <div className="mb-3">
                 <button className="btn btn-outline-secondary" onClick={() => navigateTo("home")}>
                   &larr; Back to Home
                 </button>
              </div>
              {/* UPLOAD UNIT 3 & 4 & 5 */}
              <h5 className="mb-3">Upload Questions Files (Units 3, 4, & 5)</h5>
              <div className="row">
                <div className="col-md-4">
                  <div className="card p-3 shadow-sm">
                    <h6 className="mb-2">Upload Unit 3</h6>
                    <input type="file" className="form-control mb-2" onChange={(e) => setFile3(e.target.files[0])} />
                    <button className="btn btn-primary" onClick={() => uploadFile(3, file3)}>Upload Unit 3</button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card p-3 shadow-sm">
                    <h6 className="mb-2">Upload Unit 4</h6>
                    <input type="file" className="form-control mb-2" onChange={(e) => setFile4(e.target.files[0])} />
                    <button className="btn btn-success" onClick={() => uploadFile(4, file4)}>Upload Unit 4</button>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card p-3 shadow-sm">
                    <h6 className="mb-2">Upload Unit 5</h6>
                    <input type="file" className="form-control mb-2" onChange={(e) => setFile5(e.target.files[0])} />
                    <button className="btn btn-warning" onClick={() => uploadFile(5, file5)}>Upload Unit 5</button>
                  </div>
                </div>
              </div>
              {uploadMessage && <div className="alert alert-info mt-3">{uploadMessage}</div>}
              
              {/* GENERATE */}
              <div className="card shadow-sm p-4 mt-4">
                <h4 className="mb-3">Generate MID 2 Question Paper</h4>
                {renderHeaderInputs()}
                <button onClick={generatePaper2} disabled={loading} className="btn btn-success mb-3">
                  {loading ? "Generating..." : "Generate MID 2 Paper"}
                </button>
                {message && <div className="alert alert-info">{message}</div>}
              </div>
            </>
          )}

          {/* ================= PREVIEW ================= */}
          {(view === "generator" || view === "generator2") && preview && (
            <div className="card mt-3 p-4 bg-light border">
              <h5 className="mb-3 text-center">Preview</h5>
              <div style={{
                maxHeight: "400px",
                overflowY: "auto",
                background: "#ffffff",
                padding: "20px",
                border: "1px solid #ddd"
              }}>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                  {preview}
                </pre>
              </div>
              <div className="text-center mt-4">
                <button
                  className="btn btn-success me-3"
                  onClick={() => downloadPaper(currentPaperId, "docx")}
                >
                  Download DOCX
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => downloadPaper(currentPaperId, "pdf")}
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* GENERATED PAPERS LIST */}
          {(view === "generator" || view === "generator2") && (
            <>
              <h5 className="mt-4">Generated Papers</h5>
              <ul className="list-group mt-3">
                {papers.map((paper) => (
                  <li key={paper.id}
                    className="list-group-item d-flex justify-content-between align-items-center">
                    {paper.created_at}
                    <div>
                      <button className="btn btn-sm btn-success me-2" onClick={() => downloadPaper(paper.id, "docx")}>DOCX</button>
                      <button className="btn btn-sm btn-danger" onClick={() => downloadPaper(paper.id, "pdf")}>PDF</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ================= ADMIN ================= */}
          {view === "admin" && (
            <div className="card shadow-sm p-4">
              <h4 className="mb-3">Admin Panel</h4>
              <div className="row mb-3">
                <div className="col-md-3">
                  <select className="form-select"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: Number(e.target.value) })}>
                    <option value={1}>Unit 1</option>
                    <option value={2}>Unit 2</option>
                    <option value={3}>Unit 3</option>
                    <option value={4}>Unit 4</option>
                    <option value={5}>Unit 5</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select"
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}>
                    <option value={2}>2 Marks</option>
                    <option value={5}>5 Marks</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <textarea className="form-control"
                  placeholder="Enter question text"
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows="3" />
              </div>
              <button onClick={addQuestion} className="btn btn-success mb-4">
                Add Question
              </button>
              <h5>All Questions</h5>
              <ul className="list-group mt-3">
                {questions.map((q) => (
                  <li key={q.id}
                    className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <strong>Unit {q.unit} | {q.marks}M:</strong> {q.text}
                    </span>
                    <button onClick={() => deleteQuestion(q.id)} className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;