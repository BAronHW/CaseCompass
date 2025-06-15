export default function ChatPage() {

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        
      </div>

      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md m-10">
        
        <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <input className="hidden" type="file" name="" id="file_upload" />
          <label htmlFor="file_upload">
            <div className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
              +
            </div>
          </label>
          
          <input 
            type="text" 
            placeholder="Chat with case compass"
            className="flex-1 bg-transparent focus:outline-none placeholder-gray-500"
          />
          
          <button className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
