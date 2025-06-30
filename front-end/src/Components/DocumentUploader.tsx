import { useState } from 'react';
import { useNavigate } from 'react-router';
import { customFetch, requestTypeEnum } from '../lib/customFetch';

const DocumentUploader = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const logOut = async () => {
    const res = await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    if(res.ok){
      sessionStorage.removeItem('Authorization');
    }
    if(res.ok){
      navigate('/')
    }
  }

  const uploadDocument = async () => {
    if (!file) {
      setUploadStatus({ success: false, message: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    try {
      const base64File = await toBase64(file);
      
      // Create payload
      const payload = {
        name: file.name,
        size: file.size,
        file: base64File.split(',')[1]
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return newProgress;
        });
      }, 100);

      const accessToken = sessionStorage.getItem('Authorization');
      await customFetch('http://localhost:3000/api/documents/createDocument', requestTypeEnum.POST, accessToken ?? undefined, payload)
      clearInterval(progressInterval);
      setUploadStatus({success: true, message: 'Sucessfully uploaded document'})
    } catch (error) {
      console.log(error)
      setUploadStatus({ success: false, message: 'Error uploading document' });
    } finally {
      setUploading(false);
    }
  };

  // Helper function to convert file to base64
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md m-10">
      <button onClick={logOut} className='hover:bg-sky-700'>Log Out</button>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Document</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="document">
          Select PDF Document
        </label>
        <input
          type="file"
          id="document"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        />
      </div>
      
      {file && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Name:</span> {file.name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Size:</span> {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
        </div>
      )}
      
      {uploadStatus && (
        <div className={`mb-4 p-3 rounded-md ${uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {uploadStatus.message}
        </div>
      )}
      
      <button
        onClick={uploadDocument}
        disabled={!file || uploading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  );
};

export default DocumentUploader;