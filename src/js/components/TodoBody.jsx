// TodoBody.jsx

import React from 'react'; // Removed useEffect, fetching is now in Todo.jsx

// Define constants for the API endpoint and username **inside the component**
// OR receive them as props if preferred (as done in this update)


// delete todo function 
// 1. declare a variable called updatedTodos
// 2. assign it with the FILTERED todos array by removing the todo with the passed id argument
// 3. setTodos with the updatedTodos
// 4. create the fetch needed to delete the todo item from the TODO API
// const updatedTodos = todos.filter((todoItem) => todoItem.id != id)
// setTodos(updatedTodos);

// const deleteTodo = async (id) => {
// const updatedTodos = todos.filter((todoItem) => todoItem.id != id)
// setTodos(updatedTodos);

// using async await 
// const respone = await fetch(`https://playground.4geeks.com/todo/todos/${id}`, {
//  method: 'DELETE'
// });
// if (response.ok)
// }
// else {
//  console.log(Error: ', response.status, responseText)}
//  return {
//      error: {
//          status: response.status,
//          statusText: response.statusText
//          }
//      }
//  }
//}

const TodoBody = ({ todos, setTodos, apiBaseUrl, username }) => {

    // Function to toggle the 'completed' status of a todo item
    const toggleComplete = async (id) => {
        const todoToUpdate = todos.find(todo => todo.id === id);
        if (!todoToUpdate) return;

        const newCompletedStatus = !todoToUpdate.is_done;

        // Optimistic UI Update
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, is_done: newCompletedStatus } : todo
            )
        );

        // Backend Update
        try {
            const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: todoToUpdate.label,
                    is_done: newCompletedStatus
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error updating todo! status: ${response.status} ${await response.text()}`);
            }
            console.log('Todo updated successfully on server:');
        } catch (error) {
            console.error('Error updating todo on server:', error);
            // Revert UI on failure
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...todo, is_done: todoToUpdate.is_done } : todo
                )
            );
            alert(`Failed to update task: ${error.message}`);
        }
    };

    // Function to delete a todo item
    const deleteTodo = async (id) => {
        // Find the element before API call if you want pre-emptive animation
        // const itemElement = document.querySelector(`.todo-item[data-id="${id}"]`);
        // itemElement?.classList.add('exiting'); // Example pre-animation

        // Backend Update
        try {
            const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 204) {
                throw new Error(`HTTP error deleting todo! status: ${response.status} ${await response.text()}`);
            }

            // Frontend Update (after successful API deletion)
            // Optional: Delay if using pre-emptive animation
            // setTimeout(() => {
                 setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
            // }, 500); // Match animation duration

            console.log(`Todo ${id} deleted successfully.`);

        } catch (error) {
            console.error('Error deleting todo:', error);
             // itemElement?.classList.remove('exiting'); // Remove animation class on error
            alert(`Failed to delete task: ${error.message}`);
        }
    };

    // --- Render Logic ---
    if (!Array.isArray(todos) || todos.length === 0) {
         // Handle case where filtered list is empty but original might not be
         // You might want a different message depending on the active filter
         return <p className="empty-list-message">No tasks match the current filter.</p>;
    }

    return (
        <div className="todo-body">
            {todos.map(todo => (
                <div
                    key={todo.id}
                    // Add data-id if needed for advanced animation selectors
                    // data-id={todo.id}
                    className={`todo-item flex justify-between items-center`}
                >
                    <span
                        className={`cursor-pointer flex-grow mr-4 ${todo.is_done ? 'completed' : ''}`}
                        onClick={() => toggleComplete(todo.id)}
                    >
                        {todo.label}
                    </span>
                    <button
                        className="delete-btn"
                        onClick={() => deleteTodo(todo.id)}
                        aria-label={`Delete task ${todo.label}`}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TodoBody;