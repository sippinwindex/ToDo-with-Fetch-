import React, { useState, useEffect, useRef } from 'react';

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

const TodoBody = ({ todos, setTodos, apiBaseUrl, username }) => {
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const editInputRef = useRef(null);

    useEffect(() => {
        if (editingId !== null && editInputRef.current) {
            editInputRef.current.focus();
            
        }
    }, [editingId]);

    const toggleComplete = async (id) => {
        const todoToUpdate = todos.find(todo => todo.id === id);
        if (!todoToUpdate) return;

        const newCompletedStatus = !todoToUpdate.is_done;
        const originalTodo = { ...todoToUpdate }; // Store original for full revert if needed

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
                    label: todoToUpdate.label, // API requires full object for PUT
                    is_done: newCompletedStatus
                }),
            });
            if (!response.ok) {
                throw new Error(await formatApiError(response, `Failed to update task completion`));
            }
            const updatedTodoFromServer = await response.json();
            // Sync with server data to ensure consistency!!!!
             setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...updatedTodoFromServer } : todo
                )
            );
            console.log('Todo updated (completion) successfully on server.');
        } catch (error) {
            console.error('Error updating todo completion on server:', error);
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? originalTodo : todo // Revert to original todo state
                )
            );
            alert(error.message);
        }
    };

    const deleteTodo = async (id) => {
        const originalTodos = [...todos];
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));

        try {
            const response = await fetch(`${apiBaseUrl}/todos/${id}`, {
                method: 'DELETE',
            });
          
            if (!response.ok && response.status !== 204) {
                throw new Error(await formatApiError(response, `Failed to delete task`));
            }
            console.log(`Todo ${id} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting todo:', error);
            setTodos(originalTodos); // Revert UI on failure
            alert(error.message);
        }
    };

    const handleEdit = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.label);
    };

    const handleSaveEdit = async (id) => {
        if (editingId !== id) return;

        const trimmedEditText = editText.trim();
        const todoToUpdate = todos.find(todo => todo.id === id);

        if (!todoToUpdate) {
            setEditingId(null);
            return;
        }
        
        if (trimmedEditText === "") {
            alert("Task label cannot be empty. Edit cancelled.");
            setEditingId(null);
       
            return;
        }
        
        if (trimmedEditText === todoToUpdate.label) {
            setEditingId(null);
            return;
        }

        const originalTodo = { ...todoToUpdate };

        setTodos(prevTodos =>
            prevTodos.map(todo =>
                todo.id === id ? { ...todo, label: trimmedEditText } : todo
            )
        );
        setEditingId(null);

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
            // Sync with server data
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? { ...updatedTodoFromServer } : todo
                )
            );
        } catch (error) {
            console.error('Error updating todo label on server:', error);
            setTodos(prevTodos =>
                prevTodos.map(todo =>
                    todo.id === id ? originalTodo : todo // Revert to original todo
                )
            );
            alert(error.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
      
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
    
    const handleBlur = (id) => {
        // Check if still in editing mode for this item before saving
    
        if (editingId === id) {
       
            setTimeout(() => {
                if (editingId === id) { // Double check after timeout
                    handleSaveEdit(id);
                }
            }, 150); // Adjusted timeout slightly
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
                            onBlur={() => handleBlur(todo.id)} 
                            className="edit-input flex-grow mr-2"
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
                            <div className="todo-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(todo)}
                                    aria-label={`Edit task ${todo.label}`}
                                    title="Edit task"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteTodo(todo.id)}
                                    aria-label={`Delete task ${todo.label}`}
                                    title="Delete task"
                                >
                                    🗑️
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