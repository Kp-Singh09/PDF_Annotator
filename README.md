# PDF Annotator - Full-Stack Application

This is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to meet the requirements of the Full Stack Engineering Intern Project. It allows users to upload, view, and annotate PDF documents with both highlights and freehand drawings. The application features a secure JWT-based authentication system, persistent storage of all annotations, and an interactive and user-friendly interface.

## 🌟 Features

This application includes all the core requirements from the project description, plus several advanced bonus features to enhance its functionality.

### Core Features
- **User Authentication**: Secure user registration and login system using email and password. Sessions are managed with JSON Web Tokens (JWT).
- **PDF Upload & Storage**: Users can upload PDF files, which are stored locally on the server.
- **Interactive PDF Viewer**: An in-browser PDF viewer with controls for pagination (next/previous page) and zoom (in/out).
- **Text Highlighting**: Users can select and highlight text directly on the PDF. Highlights are saved with their position, text content, and color.
- **Custom Notes on Highlights**: Users can add, edit, and view text notes associated with each highlight.
- **Persistent Annotations**: All highlights, drawings, and notes are saved to a MongoDB database and are automatically reloaded when a PDF is reopened.
- **User Dashboard**: A personal "PDF Library" for each user, showing all their uploaded documents. From the dashboard, users can open, rename, or delete their PDFs.

### Bonus Features Implemented
- **Advanced Drawing Tools**: In addition to highlighting, users can draw various shapes on the PDF:
  - **Freehand** lines
  - **Rectangles**
  - **Circles**
  - **Arrows**
- **Interactive Drawings & Shapes**:
  - **Move Tool**: Select and drag any drawing or shape to a new position on the page.
  - **Eraser Tool**: Click on any drawing or shape to instantly delete it.
- **Full-Text Search**: A robust search functionality that finds all occurrences of a query within the PDF text and allows the user to cycle through the results.

## 🛠️ Tech Stack

-   **Frontend**: React, Material-UI, `react-pdf`
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Authentication**: JSON Web Tokens (JWT)
-   **File Handling**: Multer for file uploads

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (which includes npm)
- [MongoDB](https://www.mongodb.com/try/download/community) (Make sure the MongoDB server is running)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-folder>
    ```

2.  **Setup the Backend:**
    - Navigate to the `backend` directory:
      ```bash
      cd backend
      ```
    - Install the required npm packages:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `backend` directory and add the following environment variables:
      ```env
      # .env (backend)

      # Your MongoDB connection string
      MONGODB_URI=mongodb://localhost:27017/pdf-annotator

      # A secret key for signing JWT tokens (choose any long, random string)
      JWT_SECRET=your_super_secret_jwt_key

      # The port for the backend server
      PORT=5000
      ```

3.  **Setup the Frontend:**
    - Navigate to the `frontend` directory from the root folder:
      ```bash
      cd ../frontend
      ```
    - Install the required npm packages:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `frontend` directory and add the following environment variable. This tells your React app where to find the backend API.
      ```env
      # .env (frontend)

      # The base URL of your backend server
      REACT_APP_API_BASE_URL=http://localhost:5000
      ```

### Running the Application

You will need to run the frontend and backend servers in separate terminals.

1.  **Start the Backend Server:**
    - From the `backend` directory, run:
      ```bash
      npm start
      ```
    - The server should now be running on `http://localhost:5000`.

2.  **Start the Frontend Application:**
    - From the `frontend` directory, run:
      ```bash
      npm start
      ```
    - The React application will open in your browser, usually at `http://localhost:3000`.

You can now register a new user, log in, and start using the PDF Annotator!