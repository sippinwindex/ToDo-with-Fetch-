import React, { useState } from 'react';

// Receive apiBaseUrl and username
const TodoHeader = ({ setTodos, apiBaseUrl, username }) => {
    const [newTodoLabel, setNewTodoLabel] = useState("");
    const [isAdding, setIsAdding] = useState(false); // State to disable button while adding

    const addTask = async () => {
        const trimmedLabel = newTodoLabel.trim();
        if (!trimmedLabel || isAdding) {
            if (!trimmedLabel) alert("Please enter a task label.");
            return; // Prevent adding empty/duplicate adds
        }

        setIsAdding(true); // Disable button

        // Prepare new task object matching API structure
        const newTaskPayload = {
            label: trimmedLabel,
            is_done: false // Default for new tasks
        };

//      const addTask = () => {
//      const newTodoObj = {
//      label: newTodo
//      No more need for counter.
//     const appendArray = [...todos, newTodoObj];
//  }
//     setNewTodo("");
//    step 4. create a new function to fetch a POST
//  postNewTask(newTodoObj);
// }
// const postNewTask = async (todoObject) => {. 
//      const response = await fetch(). // fetch needs2 arguments for a POST (URL, {options})
//      cosnt response = await fetch("https://playground.4geeks.com/todo/todos/JandryFernandez", {
//      method: "POST", 
//      headers: {
//          'content-type': 'application/json'      
//      },
//      body: JSON.stringify(todoObject)
//  });
//  if (response.ok) {
//      const data = await response.json();
//      setTodos(data.todos);
//      return data;
//          error: {
//              stastus: response.status,
//              statusText: response.statusText
//  }
// }
//}
//  return ()

        try {
            // --- Backend Update ---
            const response = await fetch(`${apiBaseUrl}/todos/${username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTaskPayload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error adding todo! status: ${response.status} ${await response.text()}`);
            }

            const addedTodo = await response.json(); // Get the full todo object from API (with ID)
            console.log('Todo added successfully on server:', addedTodo);

            // --- Frontend Update (Only after successful API add) ---
            setTodos(prevTodos => [...prevTodos, addedTodo]); // Add the new todo from API response
            setNewTodoLabel(""); // Clear input

        } catch (error) {
            console.error('Error adding todo:', error);
            alert(`Failed to add task: ${error.message}`); // Inform user
        } finally {
            setIsAdding(false); // Re-enable button
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    };

    return (
        <header className="todo-header mb-6 flex items-center gap-4">
            <input
                type="text"
                className="new-todo flex-grow p-3 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/20 placeholder-gray-300 text-white"
                placeholder="What needs to be done?"
                value={newTodoLabel}
                onChange={(e) => setNewTodoLabel(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAdding} // Disable input while adding
            />
            <button
                className="add-task btn btn-primary shrink-0"
                onClick={addTask}
                disabled={isAdding} // Disable button while adding
            >
                {isAdding ? 'Adding...' : 'Add Task'}
            </button>
        </header>
    );
};

export default TodoHeader;