
import React from 'react';

interface NotebookPageProps {
  children: React.ReactNode;
  title?: string;
  color?: string;
  className?: string;
  id?: string;
}

const NotebookPage: React.FC<NotebookPageProps> = ({ children, title, color = "bg-white", className = "", id }) => {
  return (
    <div 
      id={id}
      className={`relative w-full max-w-2xl mx-auto p-8 sm:p-12 mb-8 page-shadow rounded-sm border-l-8 border-pink-200 ${color} ${className}`}
      style={{ minHeight: '600px' }}
    >
      {/* Notebook rings */}
      <div className="absolute left-[-20px] top-10 flex flex-col gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300 shadow-inner"></div>
        ))}
      </div>
      
      {title && (
        <div className="mb-8 border-b-2 border-pink-100 pb-2">
          <h1 className="text-4xl handwritten text-pink-600 font-bold text-center">{title}</h1>
        </div>
      )}
      
      <div className="notebook-content">
        {children}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-4 right-4 opacity-30 select-none">
        <span className="text-3xl">🌸</span>
      </div>
      <div className="absolute top-4 right-4 opacity-30 select-none">
        <span className="text-3xl">✨</span>
      </div>
    </div>
  );
};

export default NotebookPage;
