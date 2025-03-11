import React, { useState } from "react";
import { Calendar as CalendarIcon, X, Plus, Trash2, SidebarClose, SidebarOpen } from "lucide-react";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createEventsServicePlugin } from "@schedule-x/events-service";

const CalendarModal = ({ isOpen, onClose }) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '09:00',
    endTime: '10:00',
    description: ''
  });
  const [calendarEvents, setCalendarEvents] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  const calendar = useCalendarApp({
    views: [
      createViewDay(), 
      createViewWeek(), 
      createViewMonthGrid(), 
      createViewMonthAgenda()
    ],
    events: calendarEvents,
    selectedDate: today,
    plugins: [
      createEventModalPlugin(),
      createDragAndDropPlugin(),
      createEventsServicePlugin()
    ]
  });

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      const eventToAdd = {
        id: `event-${Date.now()}`,
        title: newEvent.title,
        start: `${newEvent.date} ${newEvent.time}`,
        end: `${newEvent.date} ${newEvent.endTime}`,
        description: newEvent.description
      };

      const eventsService = calendar.eventsService;
      if (eventsService) {
        eventsService.add(eventToAdd);
        setCalendarEvents(prev => [...prev, eventToAdd]);
      }

      setNewEvent({
        title: '',
        date: '',
        time: '09:00',
        endTime: '10:00',
        description: ''
      });
      setIsAddingEvent(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    const eventsService = calendar.eventsService;
    if (eventsService) {
      eventsService.remove(eventId);
      setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-8"
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="bg-white rounded-2xl p-12 w-full max-w-6xl h-[93vh] relative shadow-2xl overflow-hidden"
      >
        <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            {showSidebar ? <SidebarClose className="w-8 h-8 text-gray-600" /> : <SidebarOpen className="w-8 h-8 text-gray-600" />}
          </button>
          <button
            onClick={() => setIsAddingEvent(true)}
            className="p-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-8 h-8 text-gray-600 hover:text-gray-900" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <X className="w-8 h-8 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        <div className={`grid ${showSidebar ? 'grid-cols-4' : 'grid-cols-1'} gap-4 h-full`}>
          <div className={`h-full overflow-y-auto ${showSidebar ? 'col-span-3' : 'col-span-1'}`}>
            <ScheduleXCalendar 
              calendarApp={calendar}
              className="p-6 w-full"
            />
          </div>

          {showSidebar && (
            <div className="bg-gray-50 p-6 rounded-xl overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Events</h2>
              
              <div className="space-y-4">
                {calendarEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-4 border rounded bg-white"
                  >
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.start.split(' ')[0]} {event.start.split(' ')[1]}
                      </p>
                      {event.description && <p className="text-sm">{event.description}</p>}
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:bg-red-100 p-2 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rest of the code remains the same */}
        {isAddingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Event</h2>
                <button 
                  onClick={() => setIsAddingEvent(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <input 
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-2">
                  <input 
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <input 
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <textarea 
                  placeholder="Description (Optional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <button 
                  onClick={handleAddEvent}
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WeekCalendarView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
      >
        <CalendarIcon className="w-6 h-6" />
        Open Calendar
      </button>

      <CalendarModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default WeekCalendarView;