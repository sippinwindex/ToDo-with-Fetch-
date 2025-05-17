import React from 'react';
import Todo from './Todo';
import AppFooter from './AppFooter'; 
import '../../styles/glassmorphism.css';

const Home = () => {
  return (
    // This new app-wrapper will make the AppFooter stick to the bottom
    <div className="app-wrapper min-h-screen flex flex-col">
      <main className="container mx-auto p-4 flex-grow flex justify-center items-start">
        <div className="w-full max-w-2xl mt-10">
          <h1 className="text-3xl font-bold mb-8 text-center animated-gradient-text-contrast">
            Todo App
          </h1>
          <Todo />
        </div>
      </main>
      <AppFooter /> {/* Add the new AppFooter here */}
    </div>
  );
};

export default Home;