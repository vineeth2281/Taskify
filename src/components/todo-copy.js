import React, { useRef, useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, Circle, Trash2, XCircle, Clock, Star, Tags, AlertCircle, Calendar, Sun, Moon, Search, Filter, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this path matches your Firebase config file


const Todo = ({ user}) => {
  const [todoList, setTodoList] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, priority, today, upcoming
  const [tags, setTags] = useState(['work', 'personal', 'shopping', 'health']);
  const [showSubtaskInput, setShowSubtaskInput] = useState({});
  const [selectedDependencies, setSelectedDependencies] = useState({});
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [selectedTodoForDependencies, setSelectedTodoForDependencies] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
  selectedTags: [],
  dateRange: {
    start: '',
    end: ''
  },
  completionStatus: 'all' // all, completed, incomplete
});
  const inputRef = useRef();


  
  // Subscribe to todos when component mounts or user changes
  useEffect(() => {
    if (!user?.email) return;

    const todosRef = collection(db, 'todos');
    const q = query(todosRef, where('userEmail', '==', user.email));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTodoList(todos);
    });

    return () => unsubscribe();
  }, [user?.email]);

  const add = async () => {
    const value = inputRef.current.value.trim();
    if (!value) {
      setError('Please enter a task');
      return;
    }
    setError('');

    try {
      const newTodo = {
        text: value,
        completed: false,
        createdAt: new Date().toLocaleString(),
        isPriority: false,
        dueDate: '',
        tag: '',
        timeSpent: 0,
        isTracking: false,
        startTime: null,
        subtasks: [],
        dependencies: [],
        recurrence: null,
        userEmail: user.email
      };

      await addDoc(collection(db, 'todos'), newTodo);
      inputRef.current.value = '';
    } catch (err) {
      setError('Failed to add todo: ' + err.message);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePriority = async (id) => {
    const todo = todoList.find(t => t.id === id);
    await updateTodo(id, { isPriority: !todo.isPriority });
  };

  const setDueDate = async (id, date) => {
    await updateTodo(id, { dueDate: date });
  };

  const setTag = async (id, tag) => {
    await updateTodo(id, { tag });
  };

  const toggleTimeTracking = (id) => {
    setTodoList(prevTodos =>
      prevTodos.map(todo => {
        if (todo.id === id) {
          if (!todo.isTracking) {
            return { ...todo, isTracking: true, startTime: new Date() };
          } else {
            const timeSpent = todo.timeSpent + (new Date() - new Date(todo.startTime));
            return { ...todo, isTracking: false, timeSpent, startTime: null };
          }
        }
        return todo;
      })
    );
  };

  const formatTimeSpent = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const addSubtask = async (todoId, subtaskText) => {
    if (!subtaskText.trim()) return;
    
    const todo = todoList.find(t => t.id === todoId);
    const newSubtask = {
      id: Math.random() * 54861 + Date.now(),
      text: subtaskText,
      completed: false
    };

    await updateTodo(todoId, {
      subtasks: [...todo.subtasks, newSubtask]
    });
    setShowSubtaskInput(prev => ({ ...prev, [todoId]: false }));
  };
  
  const toggleSubtaskComplete = async (todoId, subtaskId) => {
    const todo = todoList.find(t => t.id === todoId);
    const updatedSubtasks = todo.subtasks.map(subtask =>
      subtask.id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    await updateTodo(todoId, { subtasks: updatedSubtasks });
  };

  const canCompleteTask = (todoId) => {
    const todo = todoList.find(t => t.id === todoId);
    if (!todo || !todo.dependencies.length) return true;
    return todo.dependencies.every(depId => 
      todoList.find(t => t.id === depId)?.completed
    );
  };

  const getDependencyDetails = (todoId) => {
  const pendingDeps = todoList
    .filter(todo => todoId.dependencies?.includes(todo.id) && !todo.completed)
    .map(todo => todo.text);
  return pendingDeps;
};
  
  const setDependencies = (todoId, dependencyIds) => {
    setTodoList(prevTodos =>
      prevTodos.map(todo =>
        todo.id === todoId ? { ...todo, dependencies: dependencyIds } : todo
      )
    );
  };
  
  const setRecurrence = (todoId, recurrenceRule) => {
    setTodoList(prevTodos =>
      prevTodos.map(todo =>
        todo.id === todoId ? { ...todo, recurrence: recurrenceRule } : todo
      )
    );
  };

  const getFirstName = () => {
    if (!user?.displayName) return '';
    return user.displayName.split(' ')[0];
  };

  const getFilteredTodos = () => {
    return todoList.filter(todo => {
      // Basic status filter
      if (filter !== 'all') {
        switch (filter) {
          case 'priority':
            if (!todo.isPriority) return false;
            break;
          case 'today':
            if (!todo.dueDate || new Date(todo.dueDate).toDateString() !== new Date().toDateString()) return false;
            break;
          case 'upcoming':
            if (!todo.dueDate || new Date(todo.dueDate) <= new Date()) return false;
            break;
        }
      }

      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = todo.text.toLowerCase().includes(searchLower) ||
          todo.tag?.toLowerCase().includes(searchLower) ||
          todo.subtasks.some(subtask => subtask.text.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Advanced filters
      if (showAdvancedFilters) {
        // Tag filter
        if (advancedFilters.selectedTags.length > 0 && !advancedFilters.selectedTags.includes(todo.tag)) {
          return false;
        }

        // Date range filter
        if (todo.dueDate) {
          const todoDate = new Date(todo.dueDate);
          todoDate.setHours(0, 0, 0, 0); // Normalize todo date to start of day

          if (advancedFilters.dateRange.start) {
            const startDate = new Date(advancedFilters.dateRange.start);
            startDate.setHours(0, 0, 0, 0); // Normalize start date to start of day
            if (todoDate < startDate) return false;
          }

          if (advancedFilters.dateRange.end) {
            const endDate = new Date(advancedFilters.dateRange.end);
            endDate.setHours(23, 59, 59, 999); // Set end date to end of day
            if (todoDate > endDate) return false;
          }
        } else if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
          // If date range is set but todo has no due date, filter it out
          return false;
        }

        // Completion status filter
        if (advancedFilters.completionStatus !== 'all') {
          if (advancedFilters.completionStatus === 'completed' && !todo.completed) return false;
          if (advancedFilters.completionStatus === 'incomplete' && todo.completed) return false;
        }
      }

      return true;
    });
  };

  // Get filtered todos
  const filteredTodos = getFilteredTodos();
  
   const hasDependentTasks = (todoId) => {
    return todoList.some(todo => todo.dependencies.includes(todoId));
  };

  const deleteTodo = async (id) => {
    if (hasDependentTasks(id)) {
      const dependentTasks = todoList
        .filter(todo => todo.dependencies.includes(id))
        .map(todo => todo.text)
        .join(', ');
      
      alert(`Cannot delete this task as it is required by: ${dependentTasks}`);
      return;
    }

    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (err) {
      setError('Failed to delete todo: ' + err.message);
    }
  };
  
  const updateTodo = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'todos', id), updates);
    } catch (err) {
      setError('Failed to update todo: ' + err.message);
    }
  };

  const toggleComplete = async (id) => {
    if (!canCompleteTask(id)) {
      const pendingDeps = getDependencyDetails(id);
      alert(`Please complete the following tasks first:\n${pendingDeps.join('\n')}`);
      return;
    }

    const todo = todoList.find(t => t.id === id);
    await updateTodo(id, { completed: !todo.completed });
  };

  return (
    <div className={`h-[800px] p-4 flex justify-center items-start transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}>
      <div className={`w-full h-full max-w-7xl flex flex-col p-6 rounded-xl shadow-lg border border-blue-400  transition-colors duration-200 overflow-hidden $ ${
  isDarkMode ? 'bg-gray-800' : 'bg-white'
}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          
          <div className="flex items-center justify-center w-full gap-4 relative">
  <button
    onClick={toggleTheme}
    className={`absolute left-0 p-2 rounded-full transition-colors ${
      isDarkMode 
        ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
  </button>
  <span
      className={`text-lg font-medium ${
        isDarkMode ? 'text-white' : 'text-gray-700'
      } ml-16`} 
    >
      Hi, {getFirstName()}
    </span>
   </div>


          
          <div className=" flex gap-2">
            {['all', 'priority', 'today', 'upcoming'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
              
            ))}
          </div>
        </div>

        
    <div className={`  min-h-screen p-8 flex justify-center items-start transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-purple-50'
    }`}>
      <div className={` border-blue-400 w-11/12 max-w-4xl flex flex-col p-6 rounded-xl shadow-lg transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header section remains the same */}
        
        {/* Search and Filter Section */}
        <div className="mt-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Search tasks..."
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
            <div className="text-sm text-gray-500">
              {filteredTodos.length} tasks found
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className={`p-4 rounded-lg space-y-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              {/* Tags Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setAdvancedFilters(prev => ({
                        ...prev,
                        selectedTags: prev.selectedTags.includes(tag)
                          ? prev.selectedTags.filter(t => t !== tag)
                          : [...prev.selectedTags, tag]
                      }))}
                      className={`px-3 py-1 rounded-full text-sm ${
                        advancedFilters.selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-200'
                            : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <input
                    type="date"
                    value={advancedFilters.dateRange.start}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-600 text-white border-gray-500'
                        : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <input
                    type="date"
                    value={advancedFilters.dateRange.end}
                    onChange={(e) => setAdvancedFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-600 text-white border-gray-500'
                        : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
              </div>

              {/* Completion Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  value={advancedFilters.completionStatus}
                  onChange={(e) => setAdvancedFilters(prev => ({
                    ...prev,
                    completionStatus: e.target.value
                  }))}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-600 text-white border-gray-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              <button
                onClick={() => {
                  setAdvancedFilters({
                    selectedTags: [],
                    dateRange: { start: '', end: '' },
                    completionStatus: 'all'
                  });
                }}
                className={`px-4 py-2 rounded-lg text-sm ${
                  isDarkMode
                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Rest of the component remains the same */}
        {/* ... Todo List, Empty State, and Stats sections ... */}
        {/* Input Section */}
        <div className=" border-blue-400 mt-6">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              className={`w-full pl-4 pr-12 py-3 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                  : 'border border-gray-200 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-200 outline-none`}
              placeholder="Add a new task..."
              onKeyPress={(e) => e.key === 'Enter' && add()}
            />
            <button
              onClick={add}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
        </div>

        {/* Todo List */}
        <div className=" border-blue-400 mt-6 space-y-2 max-h-[100px] overflow-y-auto">
          {filteredTodos.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-2 py-1 px-0 rounded-lg transition-all ${
                isDarkMode
                  ? item.completed
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                  : item.completed
                    ? 'bg-gray-50 text-gray-400'
                    : 'bg-white hover:bg-gray-50'
              }`}
            >
              <button
                onClick={() => toggleComplete(item.id)}
                className="flex-shrink-0"
              >
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                )}
              </button>
              
              <div className="flex-auto py-0">
                <div className="flex items-center gap-2 py-2">
                  <span className={item.completed ? 'line-through' : ''}>
                    {item.text}
                  </span>
                  {item.isPriority && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>

                {/* Add subtasks section here */}
{/* Subtasks section with improved UI */}
<div className=" border-blue-400 ml-6 mt-2 space-y-0">
  {item.subtasks.map(subtask => (
    <div 
      key={subtask.id} 
      className="flex items-center gap-2 group/subtask hover:bg-gray-50 p-1 rounded-md transition-colors"
    >
      <button
        onClick={() => toggleSubtaskComplete(item.id, subtask.id)}
        className="flex-shrink-0"
      >
        {subtask.completed ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300 group-hover/subtask:text-gray-400" />
        )}
      </button>
      <span className={`text-sm ${
        subtask.completed 
          ? 'line-through text-gray-400' 
          : 'text-gray-600'
      }`}>
        {subtask.text}
      </span>
    </div>
  ))}
  
  {showSubtaskInput[item.id] ? (
    <div className="flex items-center gap-2 pl-1">
      <Circle className="w-4 h-4 text-gray-300" />
      <input
        type="text"
        placeholder="Add a subtask..."
        className="flex-grow text-sm py-1 px-2 border-b border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent"
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            addSubtask(item.id, e.target.value);
            e.target.value = '';
          }
        }}
        onBlur={(e) => {
          if (e.target.value.trim()) {
            addSubtask(item.id, e.target.value);
          }
          setShowSubtaskInput(prev => ({ ...prev, [item.id]: false }));
        }}
        autoFocus
      />
    </div>
    
  ) : (
    item.subtasks.length > 0 && (
      <button
        onClick={() => setShowSubtaskInput(prev => ({ ...prev, [item.id]: true }))}
        className="flex items-center gap-2 pl-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Add subtask</span>
      </button>
    )
  )}
</div>
{!canCompleteTask(item.id) && (
  <div className="ml-6 mt-1 text-xs text-orange-500 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" />
    Complete Dependent Task
  </div>
)}
{/* Dependencies Modal */}
{showDependencyModal && selectedTodoForDependencies === item.id && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-96 max-w-lg max-h-[80vh] overflow-y-auto">
      {/* ... rest of the modal code ... */}
    </div>
  </div>
)}

  {/* Add this before the existing flex gap-2 div that shows tags */}
  <div className="flex gap-2 mt-1 text-xs text-gray-500">
    {item.dependencies.length > 0 && (
      <span className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {item.dependencies.length} dependencies
      </span>
    )}
    {item.recurrence && (
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {item.recurrence}
      </span>
    )}
  </div>
                
                <div className="flex gap-2 mt-1 text-xs text-gray-500">
                  {item.tag && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                      {item.tag}
                    </span>
                  )}
                  {item.timeSpent > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeSpent(item.timeSpent)}
                    </span>
                  )}
                  {item.dueDate && (
                    <span className={`flex items-center gap-1 ${
                      new Date(item.dueDate) < new Date() ? 'text-red-500' : ''
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePriority(item.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Star className={`w-4 h-4 ${item.isPriority ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                </button>
                
                <button
                  onClick={() => toggleTimeTracking(item.id)}
                  className={`p-1 hover:bg-gray-100 rounded ${item.isTracking ? 'text-green-500' : 'text-gray-400'}`}
                >
                  <Clock className="w-4 h-4" />
                </button>

                <select
  onChange={(e) => setTag(item.id, e.target.value)}
  value={item.tag}
  className={`text-xs border rounded px-1 ${
    isDarkMode 
      ? 'bg-white border-gray-600 text-black' 
      : 'bg-white text-gray-600'
  }`}
>
  <option value="">No tag</option>
  {tags.map(tag => (
    <option key={tag} value={tag}>{tag}</option>
  ))}
</select>
<input
  type="date"
  onChange={(e) => setDueDate(item.id, e.target.value)}
  className={`text-xs border rounded px-1 ${
    isDarkMode 
      ? 'bg-white border-gray-600 text-black' 
      : 'bg-white text-gray-600'
  }`}
/>

                  {/* Add new subtask button */}
  <button
    onClick={() => setShowSubtaskInput(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
    className="p-1 hover:bg-gray-100 rounded"
  >
    <PlusCircle className="w-4 h-4 text-gray-400" />
  </button>

{/* Add dependency selector */}
{/* Dependency selector */}
<select
  multiple
  value={item.dependencies}
  onChange={(e) => setDependencies(item.id, 
    Array.from(e.target.selectedOptions, option => Number(option.value)))}
  className={`text-xs border rounded px-1 ${
    isDarkMode 
      ? 'bg-white border-gray-600 text-black' 
      : 'bg-white text-gray-600'
  }`}
  onClick={e => e.stopPropagation()}
>
  {todoList
    .filter(t => t.id !== item.id)
    .map(t => (
      <option key={t.id} value={t.id}>
        {t.text}
      </option>
    ))}
</select>


  {/* Add recurrence selector */}
  <select
  value={item.recurrence || ''}
  onChange={(e) => setRecurrence(item.id, e.target.value)}
  className={`text-xs border rounded px-1 ${
    isDarkMode 
      ? 'bg-white border-gray-600 text-black' 
      : 'bg-white text-gray-600'
  }`}
  onClick={e => e.stopPropagation()}
>
  <option value="">No recurrence</option>
  <option value="FREQ=WEEKLY;BYDAY=MO,TH">Every Monday and Thursday</option>
  <option value="FREQ=WEEKLY;BYDAY=MO">Every Monday</option>
  <option value="FREQ=DAILY">Daily</option>
  <option value="FREQ=MONTHLY;BYDAY=1MO">First Monday of month</option>
</select>

                <button
                  onClick={() => deleteTodo(item.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {todoList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No tasks yet. Add one to get started!</p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 pt-4 border-t grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {todoList.length}
            </div>
            <div className="text-xs text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {todoList.filter(todo => todo.completed).length}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {todoList.filter(todo => todo.isPriority).length}
            </div>
            <div className="text-xs text-gray-500">Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {todoList.filter(todo => todo.dueDate && new Date(todo.dueDate) > new Date()).length}
            </div>
            <div className="text-xs text-gray-500">Upcoming</div>
          </div>
        </div>
      </div>
    </div>
  

      </div>
    </div>
  );
};

        

export default Todo;