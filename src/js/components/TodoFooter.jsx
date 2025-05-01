import React, { useState } from 'react';

// Receive apiBaseUrl and username
const TodoFooter = ({ todos, setTodos, filter, setFilter, apiBaseUrl, username }) => {
  // Use is_done for calculations
  const activeTodosCount = todos.filter(todo => !todo.is_done).length;
  const completedTodos = todos.filter(todo => todo.is_done);
  const completedTodosCount = completedTodos.length;

  const [isClearing, setIsClearing] = useState(false);

  // Clear completed tasks with API calls
  const clearCompleted = async () => {
    if (completedTodosCount === 0 || isClearing) return;

    setIsClearing(true);
    console.log(`Attempting to delete ${completedTodosCount} completed todos...`);

    // Create an array of promises for each DELETE request
    const deletePromises = completedTodos.map(todo =>
      fetch(`${apiBaseUrl}/todos/${todo.id}`, { method: 'DELETE' })
        .then(response => {
          if (!response.ok && response.status !== 204) {
            // Log individual failures but try to continue
            console.error(`Failed to delete todo ${todo.id}: ${response.status}`);
            return { success: false, id: todo.id }; // Indicate failure
          }
          console.log(`Successfully deleted todo ${todo.id}`);
          return { success: true, id: todo.id }; // Indicate success
        })
        .catch(error => {
          console.error(`Error deleting todo ${todo.id}:`, error);
          return { success: false, id: todo.id }; // Indicate failure on network error etc.
        })
    );

    try {
      // Wait for all delete operations to settle
      const results = await Promise.allSettled(deletePromises); // Use allSettled to get all results

      // Filter out successfully deleted IDs from the current state
      const successfulIds = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => result.value.id);

       if (successfulIds.length > 0) {
           setTodos(prevTodos => prevTodos.filter(todo => !successfulIds.includes(todo.id)));
       }

       const failedCount = completedTodosCount - successfulIds.length;
       if (failedCount > 0) {
           alert(`Could not delete ${failedCount} completed task(s). Please try again or check the console.`);
       }


    } catch (error) {
        // This catch block might not be strictly necessary with Promise.allSettled
        console.error("An unexpected error occurred during bulk delete:", error);
        alert("An error occurred while clearing completed tasks.");
    } finally {
       setIsClearing(false);
    }
  };


    const getButtonClass = (buttonFilter) => {
        let classes = 'btn mx-1 transition-colors duration-200 '; // Base class + margin + transition
        if (buttonFilter === filter) {
            classes += 'bg-white/30 text-white font-semibold'; // Active style
        } else {
            // Adjust text color for better contrast if needed
            classes += 'bg-white/10 hover:bg-white/25 text-gray-300 hover:text-white'; // Inactive style
        }
        return classes;
    };

    // Only render footer if there are any todos
    if (todos.length === 0) {
        return null;
    }

    return (
        <div className="todo-footer pt-4 mt-6 border-t border-white/20 text-gray-300">
            <div className="flex justify-between items-center mb-4 text-sm px-2">
                <span>{activeTodosCount} items left</span>
                {completedTodosCount > 0 && (
                    <button
                        className={`hover:text-red-400 text-gray-400 transition-colors duration-200 ${isClearing ? 'opacity-50 cursor-not-allowed' : 'text-red-500'}`}
                        onClick={clearCompleted}
                        disabled={isClearing}
                    >
                        {isClearing ? 'Clearing...' : `Clear Completed (${completedTodosCount})`}
                    </button>
                )}
            </div>
            <div className="flex justify-center items-center space-x-2 mb-2">
                <button className={getButtonClass('all')} onClick={() => setFilter('all')}>All</button>
                <button className={getButtonClass('active')} onClick={() => setFilter('active')}>Active</button>
                <button className={getButtonClass('completed')} onClick={() => setFilter('completed')}>Completed</button>
            </div>
        </div>
    );
};

export default TodoFooter;