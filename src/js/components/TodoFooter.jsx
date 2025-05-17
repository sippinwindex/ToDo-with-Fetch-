import React, { useState } from 'react';

const TodoFooter = ({ todos, setTodos, filter, setFilter, apiBaseUrl, username }) => {
  const activeTodosCount = todos.filter(todo => !todo.is_done).length;
  const completedTodos = todos.filter(todo => todo.is_done);
  const completedTodosCount = completedTodos.length;
  const totalTodosCount = todos.length; // New counter

  const [isClearing, setIsClearing] = useState(false);

  const clearCompleted = async () => {
    if (completedTodosCount === 0 || isClearing) return;
    setIsClearing(true);

    console.log(`Attempting to delete ${completedTodosCount} completed todos...`);

    const deletePromises = completedTodos.map(todo =>
      fetch(`${apiBaseUrl}/todos/${todo.id}`, { method: 'DELETE' })
        .then(response => {
          if (!response.ok && response.status !== 204) {
            console.error(`Failed to delete todo ${todo.id}: Status ${response.status}`);
            return response.text().then(text => {
                console.error(`Error body for ${todo.id}: ${text}`);
                return { success: false, id: todo.id, errorStatus: response.status };
            });
          }
          console.log(`Successfully deleted todo ${todo.id}`);
          return { success: true, id: todo.id };
        })
        .catch(error => {
          console.error(`Network or other error deleting todo ${todo.id}:`, error);
          return { success: false, id: todo.id, error: error.message };
        })
    );

    try {
      const results = await Promise.allSettled(deletePromises);
      const successfulIds = [];
      let failedCount = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulIds.push(result.value.id);
        } else {
          failedCount++;
          if (result.status === 'rejected') {
            console.error(`Promise rejected for a delete operation:`, result.reason);
          } else { 
            console.error(`Failed to delete todo (API error): ID ${result.value.id}, Status/Error: ${result.value.errorStatus || result.value.error}`);
          }
        }
      });

       if (successfulIds.length > 0) {
           setTodos(prevTodos => prevTodos.filter(todo => !successfulIds.includes(todo.id)));
       }

       if (failedCount > 0) {
           alert(`Could not delete ${failedCount} out of ${completedTodosCount} completed task(s). Please check the console for details.`);
       } else if (successfulIds.length > 0) {
           console.log(`${successfulIds.length} completed tasks cleared successfully.`);
       }

    } catch (error) {
        console.error("An unexpected error occurred during the Promise.allSettled phase of bulk delete:", error);
        alert("An unexpected error occurred while clearing completed tasks.");
    } finally {
       setIsClearing(false);
    }
  };

    const getButtonClass = (buttonFilter) => {
        let classes = 'btn mx-1 transition-colors duration-200 ';
        if (buttonFilter === filter) {
            classes += 'bg-white/30 text-white font-semibold';
        } else {
            classes += 'bg-white/10 hover:bg-white/25 text-gray-300 hover:text-white';
        }
        return classes;
    };

    // Render footer if there are any todos OR if it's in the process of clearing
    if (totalTodosCount === 0 && !isClearing) {
        return null;
    }

    return (
        <div className="todo-footer pt-4 mt-6 border-t border-white/20 text-gray-300">
            <div className="flex flex-wrap justify-between items-center mb-4 text-sm px-2 gap-y-2"> {/* Added gap-y-2 for wrap */}
                <div className="flex gap-x-3 items-center"> {/* Container for counts */}
                    <span>{activeTodosCount} items left</span>
                    <span className="text-white/50">|</span>
                    <span>{totalTodosCount} total tasks</span>
                </div>
                {completedTodosCount > 0 && (
                    <button
                        className={`hover:text-red-400 transition-colors duration-200 ${isClearing ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-red-500 hover:text-red-400'}`}
                        onClick={clearCompleted}
                        disabled={isClearing || completedTodosCount === 0}
                    >
                        {isClearing ? `Clearing ${completedTodosCount}...` : `Clear Completed (${completedTodosCount})`}
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