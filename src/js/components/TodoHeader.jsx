import React, { useState } from 'react';

// Helper to format API errors (can be imported from a utility file if used in multiple places)
const formatApiError = async (response, defaultMessage) => {
    // ... (same as in TodoBody.jsx, or import if extracted)
    let errorDetail = defaultMessage || `HTTP error! status: ${response.status}`;
    try {
        const errorData = await response.json();
        if (errorData.detail) {
            errorDetail += ` - ${errorData.detail}`;
        } else if (errorData.label && Array.isArray(errorData.label)) {
            errorDetail += ` - Label: ${errorData.label.join(', ')}`;
        } else if (errorData.msg) {
            errorDetail += ` - ${errorData.msg}`;
        } else {
            errorDetail += ` - ${JSON.stringify(errorData)}`;
        }
    } catch (e) {
        errorDetail += ` (Could not parse error body as JSON)`;
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
            setTodos(prevTodos => [...prevTodos, addedTodo]);
            setNewTodoLabel("");
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
                className="add-task btn btn-primary shrink-0" // Assuming btn, btn-primary, shrink-0 are styled
                onClick={addTask}
                disabled={isAdding}
            >
                {isAdding ? 'Adding...' : 'Add Task'}
            </button>
        </header>
    );
};

export default TodoHeader;