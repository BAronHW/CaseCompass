import { useState } from 'react';
import { customFetch, requestTypeEnum } from '../lib/customFetch';
import { UploadStatus } from '../interfacesEnumsAndTypes/interfaces';

const DocumentUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const uploadWithProgress = (formData: FormData): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', 'http://localhost:3000/api/documents/createDocument');
      const authToken = sessionStorage.getItem('Authorization')
      xhr.setRequestHeader('Authorization', `${authToken}`);
      
      xhr.send(formData);
    });
  };

  const uploadDocument = async () => {
    if (!file) {
      setUploadStatus({ status: false, message: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('size', file.size.toString());
      await uploadWithProgress(formData);
      setUploadProgress(100);
      setUploadStatus({status: true, message: 'Sucessfully uploaded document'})
    } catch (error) {
      console.log(error)
      setUploadStatus({ status: false, message: 'Error uploading document' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md m-10">
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
        <div className={`mb-4 p-3 rounded-md ${uploadStatus.status ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
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