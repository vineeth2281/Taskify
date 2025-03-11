import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar as CalendarIcon,
  HelpCircle,
  X,
  Star,
} from "lucide-react";


import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const CalendarModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
  
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBlock, setSelectedBlock] = useState(null); // For popover
    const [tasks, setTasks] = useState([]); // Store tasks
    const [taskForm, setTaskForm] = useState({
      name: "",
      priority: false,
      startTime: "",
      endTime: "",
      color: "#f87171",
    });
  
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
    // Create a full 24-hour time slot array in 30-minute intervals
    const timeSlots = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = i % 2 === 0 ? "00" : "30";
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute} ${period}`;
    });
  
    const goToNextWeek = () => {
      setCurrentDate((prevDate) => {
        const nextDate = new Date(prevDate);
        nextDate.setDate(prevDate.getDate() + 7);
        return nextDate;
      });
    };
  
    const goToPreviousWeek = () => {
      setCurrentDate((prevDate) => {
        const prevDateObj = new Date(prevDate);
        prevDateObj.setDate(prevDate.getDate() - 7);
        return prevDateObj;
      });
    };
  
    const handleBlockClick = (time, dayIndex) => {
      setSelectedBlock({ time, dayIndex });
    };
  
    const handleTaskSubmit = () => {
      setTasks((prevTasks) => [
        ...prevTasks,
        { ...taskForm, ...selectedBlock },
      ]);
      setSelectedBlock(null);
      setTaskForm({ name: "", priority: false, startTime: "", endTime: "", color: "#f87171" });
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="w-[95vw] h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="hover:bg-gray-100 p-2 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h1>
              </div>
  
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousWeek}
                  className="hover:bg-gray-100 p-2 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToNextWeek}
                  className="hover:bg-gray-100 p-2 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-100 p-2 rounded-full">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="hover:bg-gray-100 p-2 rounded-full">
                  <CalendarIcon className="w-5 h-5" />
                </button>
                <div className="px-2 border-l">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    Help <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="hover:bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>
  
          <div className="flex-1 overflow-auto">
            {/* Main Grid */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)]">
              {/* Header Row */}
              <div className="bg-white sticky top-0 z-10 border-r">
                <div className="h-16" />
              </div>
              {daysOfWeek.map((day, index) => {
                const date = new Date(currentDate);
                date.setDate(currentDate.getDate() - currentDate.getDay() + index);
  
                return (
                  <div
                    key={day}
                    className="bg-white sticky top-0 z-10 text-center border-r h-16"
                  >
                    <div className="text-sm text-gray-500">{day}</div>
                    <div className="mt-1 text-lg">{date.getDate()}</div>
                  </div>
                );
              })}
  
              {/* Time Rows and Blocks */}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="h-12 px-2 text-sm text-gray-500 flex items-center justify-end border-r">
                    {time}
                  </div>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={`${time}-${i}`}
                      className="h-12 border-r border-b hover:bg-gray-50 cursor-pointer relative"
                      onClick={() => handleBlockClick(time, i)}
                    >
                      {tasks.map(
                        (task) =>
                          task.time === time &&
                          task.dayIndex === i && (
                            <div
                              key={task.name}
                              className="absolute inset-1 rounded-lg"
                              style={{ backgroundColor: task.color }}
                            >
                              <div className="text-white text-xs px-2">
                                {task.name}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
  
        {/* Popover */}
        {selectedBlock && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Add Task</h2>
                <button
                  onClick={() => setSelectedBlock(null)} // Close the task modal
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Task Name"
                className="w-full p-2 mb-3 border rounded"
                value={taskForm.name}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, name: e.target.value })
                }
              />
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() =>
                    setTaskForm((prev) => ({
                      ...prev,
                      priority: !prev.priority,
                    }))
                  }
                  className={`p-2 rounded-full ${
                    taskForm.priority ? "bg-yellow-500" : "bg-gray-200"
                  }`}
                >
                  <Star className="w-5 h-5" />
                </button>
                <span>Mark as Priority</span>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="time"
                  className="p-2 border rounded w-full"
                  value={taskForm.startTime}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, startTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="p-2 border rounded w-full"
                  value={taskForm.endTime}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, endTime: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <label>Color:</label>
                <input
                  type="color"
                  className="w-10 h-10 p-1"
                  value={taskForm.color}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, color: e.target.value })
                  }
                />
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleTaskSubmit}
              >
                Add Task
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };