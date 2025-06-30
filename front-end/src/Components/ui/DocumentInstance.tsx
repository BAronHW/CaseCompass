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

  return (
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
        <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Open
        </button>
        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
          Edit
        </button>
        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
          Download
        </button>
      </div>
    </div>
  );
}

export default DocumentInstance;