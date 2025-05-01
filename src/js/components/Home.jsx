import React from 'react';
import Todo from './Todo';
// Ensure CSS is imported (likely already in main.jsx or here)
// import '../../styles/glassmorphism.css'; // Or wherever it's imported

const Home = () => {
  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen">
      <div className="w-full max-w-2xl mt-10">
        {/* Apply the new contrast class */}
        <h1 className="text-3xl font-bold mb-8 text-center animated-gradient-text-contrast">
          Todo App
        </h1>
        <Todo />
      </div>
    </div>
  );
};

export default Home;