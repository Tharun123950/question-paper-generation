# Generator

## 1. Project Purpose
This repository contains a complete academic question-paper generation application designed to reduce manual effort in creating structured exam papers. It combines:
- a Flask-based backend for parsing uploaded question-bank documents,
- a React frontend for user interaction,
- a PostgreSQL database for storing questions and generated papers,
- and export features for DOCX and PDF output.

The goal is to allow faculty or administrators to upload PDF/DOCX question banks, store the questions in a database, and generate balanced, formatted exam papers automatically from those stored questions.

---

## 2. What the system does
The application performs the following major tasks:

1. User authentication
   - Register a new user
   - Log in with existing credentials
   - Log out safely

2. Question-bank ingestion
   - Upload PDF or DOCX files containing unit-wise questions
   - Extract question text from the file
   - Identify marks categories such as 2 marks and 5 marks
   - Ignore duplicate or repeated questions

3. Question storage
   - Save all extracted questions into PostgreSQL
   - Organize them by unit and marks value

4. Automated paper generation
   - Generate two paper formats:
     - MID 1: Units 1 and 2
     - MID 2: Units 3, 4, and 5
   - Randomly select balanced questions while keeping the paper structure consistent
   - Prevent duplicate paper generation using a hash-based signature

5. Paper export
   - Preview generated paper content in the browser
   - Download generated papers as DOCX or PDF

6. Admin management
   - Add new questions manually through the admin interface
   - Delete questions if needed

---

## 3. High-level architecture
The project is split into two main parts:

### Backend
- Built with Flask
- Handles API routes, parsing logic, database access, authentication, and export generation
- Main file: backend/app.py

### Frontend
- Built with React
- Provides the user interface for login, file upload, paper generation, preview, and admin functions
- Main entry: frontend/src/App.js

### Database
- Uses PostgreSQL with SQLAlchemy
- Stores:
  - registered users
  - extracted questions
  - generated paper metadata and content

---

## 4. Detailed backend functionality
The backend contains the core logic of the application.

### 4.1 Authentication module
The Flask backend exposes:
- POST /api/register
  - Registers a new user
  - Validates missing fields
  - Prevents duplicate username and email
  - Returns a JWT token

- POST /api/login
  - Verifies username and password
  - Returns a user object and JWT token

- POST /api/logout
  - Returns a successful logout response
  - The actual token removal is handled on the frontend

### 4.2 Upload and parsing module
The endpoint POST /upload-pdf?unit=1..5 accepts a PDF or DOCX file and performs the following:
- Validates the unit number from 1 to 5
- Validates the uploaded file type
- Saves the uploaded file in backend/uploads
- Parses the document line by line or table by table
- Detects marks categories like 2M and 5M using headings or patterns
- Extracts questions and stores them in the Question table
- Prevents duplicate entries using normalized text comparison

This module is one of the most important pieces because it converts raw academic documents into structured question data.

### 4.3 Question generation logic
The endpoints:
- GET /generate-type1
- GET /generate-type2

use stored questions to create final paper content.

They:
- fetch questions grouped by unit and marks,
- randomly select a valid set of questions,
- build Part-A and Part-B sections,
- create the final output text,
- save a copy of the generated paper in the database,
- and return the generated paper content to the frontend.

### 4.4 Duplicate prevention
To avoid generating the same paper again, the system creates a hash using selected question IDs. If the same combination already exists in the GeneratedPaper table, it returns a duplicate warning.

### 4.5 Download module
The endpoint GET /download-paper/<paper_id>?format=pdf|docx generates the final paper in the chosen format.

This includes:
- PDF generation using ReportLab
- DOCX generation using python-docx
- Institution-style formatting with headers, subject, time, marks, branch/section, and exam details

### 4.6 Admin management routes
The backend also provides:
- GET /questions
  - Returns all saved questions
- POST /add-question
  - Adds a question manually
- DELETE /delete-question/<question_id>
  - Removes a stored question

---

## 5. Detailed frontend functionality
The React app is the user-facing interface of the system.

### 5.1 Login and registration screen
The login page allows users to:
- sign in using an existing account,
- register a new account,
- switch between login and sign-up modes,
- store the JWT token in browser storage.

### 5.2 Home page and navigation
The main screen allows the user to navigate between:
- Home
- MID 1 Generator
- MID 2 Generator
- Admin Panel

This makes the system easy to use for different paper-generation tasks.

### 5.3 Upload section
For each unit, the user can upload a PDF or DOCX question file and trigger the extraction process. The system then reports how many questions were added and how many duplicates were skipped.

### 5.4 Generator form
The generator page collects exam metadata such as:
- year
- education level
- semester
- exam name
- month/year
- subject name
- exam time
- max marks
- branch/section
- exam date
- regulation

These details are used to format the final paper.

### 5.5 Generated paper preview and download
Once a paper is generated, the UI shows:
- the paper preview in a text block,
- buttons for DOCX download,
- buttons for PDF download.

### 5.6 Admin panel
The admin panel lets a user:
- choose a unit and marks value,
- enter a new question,
- add it to the database,
- view the full question list,
- delete questions when necessary.

---

## 6. Database design
The backend uses SQLAlchemy models.

### User model
Stores login credentials and metadata:
- id
- username
- email
- password (hashed)
- created_at

### Question model
Stores raw extracted questions:
- id
- unit
- marks
- question_text

### GeneratedPaper model
Stores metadata and the final output text:
- id
- fingerprint
- signature_hash
- paper_content
- year
- education
- semester
- exam_name
- month_year
- subject_name
- exam_time
- max_marks
- branch_section
- exam_date
- regulation
- created_at

This structure makes it possible to track, re-download, and reuse generated papers.

---

## 7. Data flow in one complete cycle
A typical user workflow is:

1. The user logs into the application.
2. The user uploads one or more unit-wise PDF/DOCX files.
3. The backend extracts questions and stores them in PostgreSQL.
4. The user selects the exam type and enters exam details.
5. The backend randomly picks suitable questions.
6. The backend creates a final paper layout and stores it.
7. The frontend displays the paper preview.
8. The user downloads the paper as DOCX or PDF.

This cycle turns a manual document-based process into an automated exam-paper generation workflow.

---

## 8. Why this project is useful
This project is useful because it:
- automates repetitive exam-paper creation work,
- reduces manual formatting effort,
- supports institutional exam workflows,
- stores a reusable question bank,
- generates papers quickly and consistently,
- and supports export to common document formats.

---

## 9. Technology stack
### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- PyJWT
- pdfplumber
- python-docx
- ReportLab
- Werkzeug

### Frontend
- React
- JavaScript
- Axios
- Bootstrap
- React Scripts

### Database
- PostgreSQL

---

## 10. Setup instructions
### Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend setup
```bash
cd frontend
npm install
npm start
```

### Database setup
Make sure PostgreSQL is running and a database named question_generator exists.
The current backend expects this connection string:

```text
postgresql://postgres:prasanna123@localhost:5432/question_generator
```

---

## 11. Important implementation notes
- The app currently assumes a local PostgreSQL installation.
- The upload logic supports PDF and DOCX only.
- The generation logic is designed around academic exam paper formats.
- Duplicate prevention uses a hash of selected question identifiers.
- The exported paper format is intended for educational and administrative use.

---

## 12. Summary
This project is a practical, full-stack academic paper generation system that connects document parsing, database storage, random question selection, and final output generation into one workflow. It is especially suitable for institutions that need a faster and more structured way to create exam papers from uploaded question banks.
