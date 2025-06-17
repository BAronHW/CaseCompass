import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  MessageSquareText
} from 'lucide-react';
import { useNavigate } from 'react-router';

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigation = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'Upload', label: 'Upload', icon: Home },
    { id: 'Chat', label: 'Chat', icon: MessageSquareText},
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sideBarOnClick = (itemId: string): void => {
    setActiveItem(itemId);
    navigation(itemId.toLocaleLowerCase());
  }

  return (
    <>
    <div className="flex h-screen bg-gray-100">
      <div className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-16'
      } flex flex-col`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`font-bold text-xl text-gray-800 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            {isOpen && 'Dashboard'}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => sideBarOnClick(item.id)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${
                      activeItem === item.id
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
                    <span className={`ml-3 transition-opacity duration-300 ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {isOpen && item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
    </>
  );
};

export default Sidebar;