function DocumentInstance() {
  const testDocument = {
    id: 'doc-123',
    title: 'Sample Project Proposal',
    type: 'PDF',
    size: '2.4 MB',
    lastModified: '2025-06-14',
    author: 'John Doe',
    status: 'Draft',
    tags: ['project', 'Q3-2025', 'engineering']
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{testDocument.title}</h2>
              <p className="text-sm text-gray-500">{testDocument.type} • {testDocument.size}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            {testDocument.status}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Author:</span>
            <span className="text-gray-900">{testDocument.author}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Last Modified:</span>
            <span className="text-gray-900">{testDocument.lastModified}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Document ID:</span>
            <span className="text-gray-900 font-mono">{testDocument.id}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {testDocument.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 border bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Open
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Edit
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentInstance;