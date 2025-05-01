import React, { useState, useEffect } from "react";
import TodoHeader from "./TodoHeader";
import TodoBody from "./TodoBody";
import TodoFooter from "./TodoFooter";

const API_BASE_URL = 'https://playground.4geeks.com/todo';
const USERNAME = 'JandryFernandez'; // *** IMPORTANT: Replace with your username ***

const Todo = () => {
  // State for all todos - Initialize empty, let useEffect fetch
  const [todos, setTodos] = useState([]);

  // State for the current filter ('all', 'active', 'completed')
  const [filter, setFilter] = useState('all');

  // State to track if initial fetch is done (to prevent premature rendering/filtering)
  const [isLoading, setIsLoading] = useState(true);

  // Removed counter state - API provides unique IDs

  // --- Fetching Logic moved from TodoBody to here (Centralized State Management) ---
  useEffect(() => {
    const fetchOrCreateUser = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await fetch(`${API_BASE_URL}/users/${USERNAME}`);
        if (response.status === 404) {
          console.log(`User ${USERNAME} not found. Attempting to create...`);
          const createUserResponse = await fetch(`${API_BASE_URL}/users/${USERNAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          if (!createUserResponse.ok) {
            throw new Error(`Failed to create user ${USERNAME}: ${createUserResponse.status}`);
          }
          console.log(`User ${USERNAME} created successfully.`);
          setTodos([]); // Start with empty todos for the new user
        } else if (!response.ok) {
          throw new Error(`HTTP error fetching todos! status: ${response.status}`);
        } else {
          const data = await response.json();
          // Ensure data.todos is an array and use 'is_done' consistently
          setTodos(Array.isArray(data.todos) ? data.todos : []);
          console.log("Fetched todos:", data.todos || []);
        }
      } catch (error) {
        console.error('Error in fetchOrCreateUser:', error);
        setTodos([]); // Set to empty array on error
      } finally {
        setIsLoading(false); // Finish loading
      }
    };
    fetchOrCreateUser();
  }, []); // Empty dependency array: Run only once on mount

  // Filter todos based on the current filter state
  const getFilteredTodos = () => {
    if (isLoading) return []; // Return empty if still loading

    switch (filter) {
      case 'active':
        // Use is_done for filtering
        return todos.filter(todo => !todo.is_done);
      case 'completed':
        // Use is_done for filtering
        return todos.filter(todo => todo.is_done);
      case 'all':
      default:
        return todos;
    }
  };

  const filteredTodos = getFilteredTodos();

  // Render loading state or the main content
  if (isLoading) {
     return <div className="glass-panel text-center p-5 text-white">Loading tasks...</div>;
  }

  return (
    <div className="glass-panel">
      {/* Pass necessary props down */}
      <TodoHeader
        // Pass only what's needed: setTodos function
        setTodos={setTodos}
        apiBaseUrl={API_BASE_URL}
        username={USERNAME}
      />
      <TodoBody
        // Pass the filtered list for display
        todos={filteredTodos}
        // Pass the original setter for modifications (toggle/delete)
        setTodos={setTodos}
        apiBaseUrl={API_BASE_URL}
        username={USERNAME} // Pass username if needed inside Body (already there)
      />
      <TodoFooter
        todos={todos} // Pass original todos for counts/clearing
        setTodos={setTodos}
        filter={filter}
        setFilter={setFilter}
        apiBaseUrl={API_BASE_URL}
        username={USERNAME}
      />
    </div>
  );
};

export default Todo;