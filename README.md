# PDF Annotator - Backend

This repository contains the backend server for the Full-Stack PDF Annotator application. It is built with Node.js and Express and is responsible for handling user authentication, file storage, and managing highlight data.

## Overview of Architecture and Features

The backend provides a RESTful API that the React frontend consumes. Its primary responsibilities include:

* **User Authentication**: Handles user registration and login using a JWT-based system.
* **PDF Management**:
    * Accepts PDF file uploads and stores them on the local server file system.
    * Generates a unique UUID for each uploaded PDF for easy tracking.
    * Saves PDF metadata (filename, UUID, associated user) to a MongoDB database.
* **Highlight Management**: Provides CRUD (Create, Retrieve, Update, Delete) endpoints for saving and managing text highlight data. Each highlight is linked to a specific user and PDF.
* **PDF Library**: An API endpoint to fetch a list of all PDFs that belong to the currently authenticated user.

## Tech Stack

* **Runtime**: Node.js
* **Framework**: Express
* **Database**: MongoDB with Mongoose
* **Authentication**: JSON Web Tokens (JWT)
* **File Handling**: Multer
* **Unique IDs**: UUID

## Setup and Installation

Follow these instructions to get the backend server running on your local machine.

### **1. Clone the repository**

```bash
git clone <your-repository-url>
cd pdf-annotator/backend
```

### **2. Install dependencies**

```bash
npm install
```

### **3. Set up environment variables**

Create a file named `.env` in the `backend` root directory. This file will hold your secret keys and configuration variables. Copy the contents of `.env.example` into it and add your own values.

Create a `.env.example` file with the following content (as required by the project specifications ):

```env
# The port the server will run on
PORT=5001

# Your MongoDB connection string
MONGODB_URI=your_mongodb_connection_string_here

# A strong, secret key for signing JWTs
JWT_SECRET=your_super_secret_and_random_jwt_key
```

Then, create your actual `.env` file and fill in the values.

### **4. Add Scripts to `package.json`**

For convenience, add the following `scripts` to your `backend/package.json` file:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### **5. Run the server**

To start the server in development mode (which will automatically restart on file changes), run:

```bash
npm run dev
```

The server should now be running on the port you specified in your `.env` file (e.g., http://localhost:5001).

---