import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const PDFupload = () => {
  const [selectedFileName, setSelectedFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    console.log('file assigned' + file.name)
    setSelectedFileName(file.name);

    // Add your file upload logic here
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // const response = await axios.post('http://localhost:3000/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      console.log('uploaded!');
      // Handle success, e.g., show a success message to the user
    } catch (error) {
      console.error('error found :' + error.response.data);
      // Handle error, e.g., show an error message to the user
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: (file) => {
      const validMimeTypes = ['application/pdf'];
      const validExtensions = ['.pdf'];

      const fileExtension = file.name.split('.').pop().toLowerCase();

      return (
        validMimeTypes.includes(file.type) &&
        validExtensions.includes(`.${fileExtension}`)
      );
    },
  });

  return (
    <>
      <div id='main-box' className="fade-in">
        <h3>Upload Manual PDF here:</h3>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <p>{selectedFileName ? `Selected PDF: ${selectedFileName}` : 'Drag & drop a PDF file here, or click to select one'}</p>
        </div>
        <button type="button" onClick={onDrop}>Upload</button>
      </div>
    </>
  );
};

export default PDFupload;
