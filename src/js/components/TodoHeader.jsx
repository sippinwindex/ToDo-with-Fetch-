import React, { useState } from 'react';

// Standardized helper to format API errors (same logic as in Todo.jsx)
const formatApiError = async (response, defaultMessage) => {
    let errorDetail = defaultMessage || `HTTP error! status: ${response.status}`;
    const errorText = await response.text();
    try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
            errorDetail += ` - ${errorData.detail}`;
        } else if (errorData.label && Array.isArray(errorData.label)) {
            errorDetail += ` - Label: ${errorData.label.join(', ')}`;
        } else if (errorData.msg) {
            errorDetail += ` - ${errorData.msg}`;
        } else {
            if (errorDetail.endsWith(response.status.toString())) {
                 errorDetail += ` - ${errorText}`;
            } else if (!errorDetail.includes(errorText)) {
                 errorDetail += ` - ${errorText}`;
            }
        }
    } catch (e) {
        if (errorDetail.endsWith(response.status.toString())) {
            errorDetail += ` - ${errorText}`;
        } else if (!errorDetail.includes(errorText)) {
            errorDetail += ` - ${errorText}`;
        }
    }
    return errorDetail;
};


const TodoHeader = ({ setTodos, apiBaseUrl, username }) => {
    const [newTodoLabel, setNewTodoLabel] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const addTask = async () => {
        const trimmedLabel = newTodoLabel.trim();
        if (!trimmedLabel || isAdding) {
            if (!trimmedLabel) alert("Please enter a task label.");
            return;
        }

        setIsAdding(true);
        const newTaskPayload = { label: trimmedLabel, is_done: false };

        try {
            const response = await fetch(`${apiBaseUrl}/todos/${username}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTaskPayload),
            });

            if (!response.ok) {
                throw new Error(await formatApiError(response, `Failed to add task`));
            }

            const addedTodo = await response.json();
            console.log('Todo added successfully on server:', addedTodo);
            // Ensure the addedTodo from server has an 'id' and other expected fields
            // The API should return the full todo object including its 'id'
            if (addedTodo && addedTodo.id) {
                setTodos(prevTodos => [...prevTodos, addedTodo]);
                setNewTodoLabel("");
            } else {
                // This case should ideally not happen if API is consistent
                console.error("Added todo from server is missing ID or invalid:", addedTodo);
                alert("Task was added but there was an issue updating the list. Please refresh.");
            }
        } catch (error) {
            console.error('Error adding todo:', error);
            alert(error.message);
        } finally {
            setIsAdding(false);
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
                disabled={isAdding}
            />
            <button
                className="add-task btn btn-primary shrink-0"
                onClick={addTask}
                disabled={isAdding || !newTodoLabel.trim()} 
            >
                {isAdding ? 'Adding...' : 'Add Task'}
            </button>
        </header>
    );
};

export default TodoHeader;