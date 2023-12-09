import React, {useState} from 'react';
import axios from 'axios';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const PDFupload = () => {

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const chosenFile = event.target.files[0];
    setFile(chosenFile);
  };

  const uploadPDF = async () => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(response.data.message);
      // Handle success, e.g., show a success message to the user
    } catch (error) {
      console.error('Error FRONTEND:', error.response.data);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <div id='main-box'>
      <h3>Upload Manual PDF here:</h3>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={uploadPDF}>Upload PDF</button>
    </div>
  );
};

export default PDFupload;
