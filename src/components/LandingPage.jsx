import React, { useState } from 'react';
import Todo from '../components/Todo';
import {auth,provider} from "../firebase"

import { 
  CheckCircle, 
  Star, 
  Clock, 
  Calendar, 
  Tags, 
  GitBranch,
  ArrowRight,
  Moon,
  Sun,
  List,
  Filter
} from 'lucide-react';

// Import the Todo component



const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <CheckCircle className="w-12 h-12 text-blue-500" />
            <h1 className="text-5xl font-bold text-gray-900">Taskify</h1>
          </div>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            The intelligent task management system that adapts to your workflow
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-16 bg-white rounded-xl shadow-xl p-6 border border-blue-100">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Complete your daily tasks</span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 ml-auto" />
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Track time spent on tasks</span>
              <span className="ml-auto text-sm text-gray-500">2h 30m</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-gray-700">Set due dates and reminders</span>
              <span className="ml-auto text-sm text-gray-500">Tomorrow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for Enhanced Productivity
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <GitBranch className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Dependencies</h3>
            <p className="text-gray-600">Create task hierarchies and manage complex workflows with ease</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <Tags className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Tagging</h3>
            <p className="text-gray-600">Organize tasks with customizable tags and categories</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <Filter className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Filters</h3>
            <p className="text-gray-600">Find exactly what you need with powerful search and filter options</p>
          </div>
        </div>
      </div>

      {/* Dark Mode Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gray-900 rounded-xl p-8 text-center">
          <div className="flex justify-center gap-6 mb-6">
            <Sun className="w-8 h-8 text-yellow-400" />
            <Moon className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Light or Dark, You Choose
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Taskify adapts to your preferred working environment with seamless theme switching
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">10k+</div>
            <div className="text-gray-600 mt-2">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">1M+</div>
            <div className="text-gray-600 mt-2">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500">4.9</div>
            <div className="text-gray-600 mt-2">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500">99.9%</div>
            <div className="text-gray-600 mt-2">Uptime</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">Taskify</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 Taskify. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;

