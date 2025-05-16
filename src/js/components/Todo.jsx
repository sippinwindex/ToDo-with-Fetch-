import React, { useState, useEffect } from "react";
import TodoHeader from "./TodoHeader";
import TodoBody from "./TodoBody";
import TodoFooter from "./TodoFooter";

const API_BASE_URL = 'https://playground.4geeks.com/todo';
const USERNAME = 'JandryFernandez'; // *** IMPORTANT: Replace with your username ***

// Helper to format API errors (can be imported from a utility file if used in multiple places)
const formatApiErrorText = async (response, defaultMessage) => {
    // This version is for when you expect text and then try to parse
    let errorDetail = defaultMessage || `HTTP error! status: ${response.status}`;
    const errorText = await response.text(); // Get text once
    try {
        const errorData = JSON.parse(errorText); // Try to parse
        if (errorData.detail) {
            errorDetail += ` - ${errorData.detail}`;
        } else if (errorData.label && Array.isArray(errorData.label)) {
            errorDetail += ` - Label: ${errorData.label.join(', ')}`;
        } else if (errorData.msg) {
            errorDetail += ` - ${errorData.msg}`;
        } else {
            errorDetail += ` - ${errorText}`; // Fallback to raw text if specific fields not found
        }
    } catch (e) {
        errorDetail += ` - ${errorText}`; // If parsing error body as JSON fails, use raw text
    }
    return errorDetail;
};


const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateUser = async () => {
      setIsLoading(true);
      try {
        const userResponse = await fetch(`${API_BASE_URL}/users/${USERNAME}`);
        if (userResponse.status === 404) {
          console.log(`User ${USERNAME} not found. Attempting to create...`);
          const createUserResponse = await fetch(`${API_BASE_URL}/users/${USERNAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          if (!createUserResponse.ok) {
            throw new Error(await formatApiErrorText(createUserResponse, `Failed to create user ${USERNAME}`));
          }
          const creationResult = await createUserResponse.json(); // Should be { msg: "..." }
          console.log(`User ${USERNAME} process result:`, creationResult.msg || "User created/accessed.");
          setTodos([]); // New user starts with empty todos
        } else if (!userResponse.ok) {
          throw new Error(await formatApiErrorText(userResponse, `HTTP error fetching user/todos!`));
        } else {
          const data = await userResponse.json();
          setTodos(Array.isArray(data.todos) ? data.todos : []);
          console.log("Fetched todos:", data.todos || []);
        }
      } catch (error) {
        console.error('Error in fetchOrCreateUser:', error);
        alert(error.message); // Show detailed error to user
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (USERNAME && USERNAME.trim() !== '' && USERNAME.toUpperCase() !== 'YOUR_USERNAME_HERE' && USERNAME !== 'JandryFernandez_test') { // Added better default check
        fetchOrCreateUser();
    } else {
        console.error("Default username is being used or username is invalid. Please set a unique USERNAME in Todo.jsx");
        alert("TODO APP: Please configure a unique username in the source code (Todo.jsx) to save your tasks.");
        setTodos([]);
        setIsLoading(false);
    }
  }, [USERNAME]); // USERNAME is a const, so [] is fine, but this is more explicit if it could change

  const getFilteredTodos = () => {
    if (isLoading) return [];
    switch (filter) {
      case 'active': return todos.filter(todo => !todo.is_done);
      case 'completed': return todos.filter(todo => todo.is_done);
      default: return todos;
    }
  };

  const filteredTodos = getFilteredTodos();

  if (isLoading) {
     return <div className="glass-panel text-center p-5 text-white">Loading tasks for {USERNAME}...</div>;
  }

  return (
    <div className="glass-panel">
      <TodoHeader
        setTodos={setTodos}
        apiBaseUrl={API_BASE_URL}
        username={USERNAME}
      />
      <TodoBody
        todos={filteredTodos}
        setTodos={setTodos}
        apiBaseUrl={API_BASE_URL}
        username={USERNAME}
      />
      <TodoFooter
        todos={todos}
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