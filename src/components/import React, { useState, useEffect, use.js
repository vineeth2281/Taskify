import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar as CalendarIcon,
  HelpCircle,
  X,
  Star,
  Trash2,
  Edit,
} from "lucide-react";
import classnames from "classnames";

const CalendarModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    id: null,
    name: "",
    priority: false,
    startTime: "",
    endTime: "",
    color: "#f87171",
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const timeSlots = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = i % 2 === 0 ? "00" : "30";
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute} ${period}`;
    });
  }, []);

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

  // Improved task management functions (unchanged)

  const currentTime = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const period = hour < 12 ? "AM" : "PM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }, []);

  const currentTimeIndex = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    return hour * 2 + Math.floor(minute / 30);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[95vw] h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
        <header className="bg-white border-b flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousWeek}
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
              <button
                onClick={goToNextWeek}
                className="hover:bg-gray-100 p-2 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
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
          <div className="grid grid-cols-[100px_repeat(7,1fr)]">
            {/* Date row */}
            <div className="bg-white sticky top-0 z-10 border-r">
              <div className="h-16 flex items-center justify-end px-2 text-sm text-gray-500">
                Date
              </div>
            </div>
            {daysOfWeek.map((day, index) => {
              const date = new Date(currentDate);
              date.setDate(currentDate.getDate() - currentDate.getDay() + index);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={classnames(
                    "bg-white sticky top-0 z-10 text-center border-r h-16 flex flex-col justify-center",
                    { "bg-gray-100": isToday }
                  )}
                >
                  <div className={classnames("text-sm", { "font-bold": isToday })}>
                    {day}
                  </div>
                  <div className={classnames("mt-1 text-lg", { "font-bold": isToday })}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Time slots */}
            {timeSlots.map((time, index) => (
              <React.Fragment key={time}>
                <div
                  className={classnames(
                    "h-12 px-2 text-sm text-gray-500 flex items-center justify-end border-r",
                    { "bg-gray-100": index === currentTimeIndex }
                  )}
                >
                  {time}
                  {index === currentTimeIndex && (
                    <div className="h-2 bg-red-500 rounded-full ml-2 w-full"></div>
                  )}
                </div>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={`${time}-${i}`}
                    className="h-12 border-r border-b hover:bg-gray-50 cursor-pointer relative"
                    onClick={() => handleBlockClick(time, i)}
                  >
                    {/* Task display (unchanged) */}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Task modal (unchanged) */}
    </div>
  );
};

export default WeekCalendarView;