import { useState } from "react";
import { customFetch, requestTypeEnum } from "../../lib/customFetch";

interface Document {
  id: number;
  key: string;
  size: number;
  title: string;
  content: string;
  uid: string;
  tags?: { name: string }[];
}

interface DocumentInstanceProps {
  document: Document;
}

function DocumentInstance({ document }: DocumentInstanceProps) {
  const [currentOpenDoc, setCurrentOpenDoc] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  async function getSingleDocDetails(documentId: number) {
    try {
      setIsLoading(true);
      const data = await customFetch(
        `http://localhost:3000/api/documents/${documentId}`, 
        requestTypeEnum.GET, 
      );
      
      if (data && data.foundDocumentWithId) {
        setCurrentOpenDoc(data.foundDocumentWithId);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching document:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
    setCurrentOpenDoc(null);
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {document.title.replace(/\.[^/.]+$/, "") || 'Untitled Document'}
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">ID:</span>
            <span className="text-gray-900 font-mono">#{document.id}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-20">Key:</span>
            <span className="text-gray-900 truncate" title={document.key}>
              {document.key}
            </span>
          </div>
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {document.content && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {document.content}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={() => getSingleDocDetails(document.id)} 
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Open'}
          </button>
          <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Edit
          </button>
          <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Download
          </button>
        </div>
      </div>

      {isModalOpen && currentOpenDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeModal}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Document Details
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Title</p>
                        <p className="text-sm text-gray-900">{currentOpenDoc.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Document ID</p>
                        <p className="text-sm text-gray-900 font-mono">#{currentOpenDoc.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">File Size</p>
                        <p className="text-sm text-gray-900">{formatFileSize(currentOpenDoc.size)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Key</p>
                        <p className="text-sm text-gray-900 font-mono break-all">{currentOpenDoc.key}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User ID</p>
                        <p className="text-sm text-gray-900 font-mono">{currentOpenDoc.uid}</p>
                      </div>
                      {currentOpenDoc.content && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Content Preview</p>
                          <p className="text-sm text-gray-900">{currentOpenDoc.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocumentInstance;