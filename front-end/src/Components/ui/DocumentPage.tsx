import { useState, useEffect } from 'react';
import { requestTypeEnum } from '../../interfacesEnumsAndTypes/enums';
import { customFetch } from '../../lib/customFetch';
import DocumentInstance from './DocumentInstance';

interface Document {
    id: number;
    key: string;
    size: number;
    title: string;
    content: string;
    uid: string;
    tags?: { name: string }[];
}

function DocumentPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const accessToken = sessionStorage.getItem('Authorization');
        console.log('Access token exists:', !!accessToken);
        
        const data = await customFetch(
          'http://localhost:3000/api/documents/', 
          requestTypeEnum.GET, 
        );
                
        if (data && data.allDocumentsWithUuid) {
          setDocuments(data.allDocumentsWithUuid);
        } else if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          console.error('Unexpected response format:', data);
          setError('No documents found in response');
        }
        
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError(err instanceof Error ? err.message : 'Error loading documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Documents</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <DocumentInstance key={doc.id} document={doc} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No documents found
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentPage;