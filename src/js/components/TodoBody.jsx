import React, { useState, useEffect, useRef } from 'react';

const TodoBody = ({ todos, setTodos, apiBaseUrl, username }) => {
    const [editingId, setEditingId] = useState(null); // ID of the todo being edited
    const [editText, setEditText] = useState("");     // Text for the todo being edited
    const editInputRef = useRef(null); // Ref for the edit input field

    // Focus input when editingId changes
    useEffect(() => {
        if (editingId !== null && editInputRef.current) {
            editInputRef.current.focus();
            // Optional: select all text
            // editInputRef.current.select();
        }
    }, [editingId]);

    // Helper to format API errors
    const formatApiError = async (response, defaultMessage) => {
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
                // Fallback if .json() was successful but no known fields
                errorDetail += ` - ${JSON.stringify(errorData)}`;
            }
        } catch (e) {
            // If .json() fails, try .text() - but response might be consumed
            // It's safer to get text() once if .json() is conditional
            // For simplicity here, we assume if .json() fails, no more info.
            // In robust scenarios, get response.text() first.
            errorDetail += ` (Could not parse error body as JSON)`;
        }
        return errorDetail;
    };


    // Function to toggle the 'completed' status of a todo item
    const toggleComplete = async (id) => {
        const todoToUpdate = todos.find(todo => todo.id === id);
        if (!todoToUpdate) return;

        const newCompletedStatus = !todoToUpdate.is_done;
        const originalStatus = todoToUpdate.is_done; // For revert

        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, is_done: newCompletedStatus } : todo
            )
        );

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
                throw new Error(await formatApiError(response, `Failed to update task completion`));
            }
            console.log('Todo updated (completion) successfully on server.');
        } catch (error) {
            console.error('Error updating todo completion on server:', error);
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...todo, is_done: originalStatus } : todo // Revert
                )
            );
            alert(error.message);
        }
    };

    // Function to delete a todo item
    const deleteTodo = async (id) => {
        const originalTodos = [...todos]; // For potential revert (though less common for delete)
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id)); // Optimistic UI update

        try {
            const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 204) { // 204 No Content is success for DELETE
                throw new Error(await formatApiError(response, `Failed to delete task`));
            }
            console.log(`Todo ${id} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting todo:', error);
            setTodos(originalTodos); // Revert UI on failure
            alert(error.message);
        }
    };

    // --- Edit Functionality ---
    const handleEdit = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.label);
    };

    const handleSaveEdit = async (id) => {
        if (editingId !== id) return; // Ensure we are saving the correct item (e.g. blur event)

        const trimmedEditText = editText.trim();
        const todoToUpdate = todos.find(todo => todo.id === id);

        if (!todoToUpdate) {
            setEditingId(null);
            return;
        }
        
        // If the text is empty, revert to original or delete, depending on desired UX
        // For now, if empty, revert and cancel edit.
        if (trimmedEditText === "") {
            alert("Task label cannot be empty. Edit cancelled.");
            setEditingId(null); // Cancel edit
            // No change to todos state, as label was not changed to empty
            return;
        }
        
        // If label hasn't changed, just exit edit mode
        if (trimmedEditText === todoToUpdate.label) {
            setEditingId(null);
            return;
        }

        const originalLabel = todoToUpdate.label;

        // Optimistic UI Update for label
        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, label: trimmedEditText } : todo
            )
        );
        setEditingId(null); // Exit editing mode

        try {
            const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: trimmedEditText,
                    is_done: todoToUpdate.is_done
                }),
            });
            if (!response.ok) {
                throw new Error(await formatApiError(response, `Failed to update task label`));
            }
            const updatedTodoFromServer = await response.json();
            console.log('Todo label updated successfully on server:', updatedTodoFromServer);
            // Sync with server data to ensure consistency (e.g. if server modifies label)
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...todo, label: updatedTodoFromServer.label } : todo
                )
            );
        } catch (error) {
            console.error('Error updating todo label on server:', error);
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...todo, label: originalLabel } : todo // Revert
                )
            );
            alert(error.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const handleEditInputChange = (e) => {
        setEditText(e.target.value);
    };

    const handleEditKeyPress = (e, id) => {
        if (e.key === 'Enter') {
            handleSaveEdit(id);
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    if (!Array.isArray(todos) || todos.length === 0) {
         return <p className="empty-list-message">No tasks here. Add one above!</p>;
    }

    return (
        <div className="todo-body">
            {todos.map(todo => (
                <div
                    key={todo.id}
                    className={`todo-item flex justify-between items-center`}
                >
                    {editingId === todo.id ? (
                        <input
                            ref={editInputRef}
                            type="text"
                            value={editText}
                            onChange={handleEditInputChange}
                            onKeyDown={(e) => handleEditKeyPress(e, todo.id)}
                            onBlur={() => setTimeout(() => handleSaveEdit(todo.id), 100)} // Delay to allow other events like Enter
                            className="edit-input flex-grow mr-2" // Ensure `edit-input` and utilities are styled
                        />
                    ) : (
                        <>
                            <span
                                className={`cursor-pointer flex-grow mr-4 ${todo.is_done ? 'completed' : ''}`}
                                onClick={() => toggleComplete(todo.id)}
                                onDoubleClick={() => handleEdit(todo)}
                                title="Click to toggle complete. Double-click to edit."
                            >
                                {todo.label}
                            </span>
                            <div className="todo-actions"> {/* Container for action buttons */}
                                <button
                                    className="edit-btn" // Styled in glassmorphism.css
                                    onClick={() => handleEdit(todo)}
                                    aria-label={`Edit task ${todo.label}`}
                                    title="Edit task"
                                >
                                    ✏️ {/* Edit icon */}
                                </button>
                                <button
                                    className="delete-btn" // Styled in glassmorphism.css
                                    onClick={() => deleteTodo(todo.id)}
                                    aria-label={`Delete task ${todo.label}`}
                                    title="Delete task"
                                >
                                    🗑️ {/* Trashcan icon */}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TodoBody;