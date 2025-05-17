import React, { useState, useEffect } from "react";
import TodoHeader from "./TodoHeader";
import TodoBody from "./TodoBody";
import TodoFooter from "./TodoFooter";

const API_BASE_URL = 'https://playground.4geeks.com/todo';
const USERNAME = 'JandryFernandez'; // *** Ensure this is your unique username for the API ***

// Standardized helper to format API errors
const formatApiError = async (response, defaultMessage) => {
    let errorDetail = defaultMessage || `HTTP error! status: ${response.status}`;
    const errorText = await response.text(); // Get raw error text first
    try {
        const errorData = JSON.parse(errorText); // Try to parse as JSON
        if (errorData.detail) {
            errorDetail += ` - ${errorData.detail}`;
        } else if (errorData.label && Array.isArray(errorData.label)) { // Specific check for certain API error formats
            errorDetail += ` - Label: ${errorData.label.join(', ')}`;
        } else if (errorData.msg) {
            errorDetail += ` - ${errorData.msg}`;
        } else {
            // If JSON parsed but no known fields, append the raw text if it's not already the detail
            // This handles cases where errorText might be a simple string like "Not found."
            // or a JSON object without 'detail', 'label', or 'msg'.
            if (errorDetail.endsWith(response.status.toString())) { // Avoid duplicating status if defaultMessage was used
                 errorDetail += ` - ${errorText}`;
            } else if (!errorDetail.includes(errorText)) { // Avoid duplicating raw text
                 errorDetail += ` - ${errorText}`;
            }
        }
    } catch (e) {
        // If parsing error body as JSON fails, use the raw text
        if (errorDetail.endsWith(response.status.toString())) {
            errorDetail += ` - ${errorText}`;
        } else if (!errorDetail.includes(errorText)) {
            errorDetail += ` - ${errorText}`;
        }
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
            body: JSON.stringify({}) // API expects an empty body or specific fields if creating user with details
          });
          if (!createUserResponse.ok) {
            // Use the standardized formatApiError
            throw new Error(await formatApiError(createUserResponse, `Failed to create user ${USERNAME}`));
          }
          const creationResult = await createUserResponse.json();
          console.log(`User ${USERNAME} creation/access result:`, creationResult.msg || "User processed.");
          setTodos([]); // New user starts with empty todos
        } else if (!userResponse.ok) {
          // Use the standardized formatApiError
          throw new Error(await formatApiError(userResponse, `HTTP error fetching user/todos!`));
        } else {
          const data = await userResponse.json();
          setTodos(Array.isArray(data.todos) ? data.todos : []);
          console.log("Fetched todos:", data.todos || []);
        }
      } catch (error) {
        console.error('Error in fetchOrCreateUser:', error);
        alert(error.message);
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Keep your username validation logic as is, or simplify if 'JandryFernandez_test' is no longer relevant
    if (USERNAME && USERNAME.trim() !== '' && USERNAME.toUpperCase() !== 'YOUR_USERNAME_HERE' && USERNAME !== 'JandryFernandez_test') {
        fetchOrCreateUser();
    } else {
        const msg = `TODO APP: Invalid or placeholder username ('${USERNAME}'). Please set a unique USERNAME in Todo.jsx to save your tasks.`;
        console.error(msg);
        alert(msg);
        setTodos([]);
        setIsLoading(false);
    }
  }, []); // USERNAME is a const, so [] is fine. If USERNAME could change via props/state, include it.

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
        todos={todos} // Footer needs all todos for counts, not just filtered ones
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