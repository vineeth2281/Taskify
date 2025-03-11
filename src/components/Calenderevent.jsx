import React from 'react';

export const TimeBlock = ({ type, title, start, end, isDashed = false }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-200 text-blue-700';
      case 'task':
        return 'bg-pink-200 text-pink-700';
      case 'lunch':
        return 'bg-yellow-200 text-yellow-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const height = (end - start) * 50; // 50px per hour

  return (
    <div
      className={`
        absolute w-full rounded-lg p-2 text-sm
        ${getBackgroundColor()}
        ${isDashed ? 'border-2 border-dashed border-yellow-400' : ''}
      `}
      style={{
        top: `${start * 50}px`,
        height: `${height}px`
      }}
    >
      {title}
    </div>
  );
};

export const HourMarker = ({ hour }) => (
  <div className="absolute w-full border-t border-gray-100" style={{ top: `${hour * 50}px` }}>
    <span className="text-xs text-gray-400">{`${hour}:00`}</span>
  </div>
);