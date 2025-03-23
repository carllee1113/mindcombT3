import React from 'react'

// Change to named export only
// Remove unused React import
export const Header = () => {
  return (
    <header className="bg-white shadow-sm py-3 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-indigo-700">Mindcomb T3</h1>
      
      <div className="flex space-x-2">
        <button 
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Align Nodes
        </button>
        
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Import FreeMind
        </button>
        
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Save as FreeMind
        </button>
      </div>
    </header>
  )
}

// Remove default export