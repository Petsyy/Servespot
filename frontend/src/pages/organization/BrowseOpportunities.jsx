import React, { useState } from 'react';
import { Calendar, MapPin, Users, Globe, Search } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const OpportunityCard = ({ opportunity }) => {
    const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={opportunity.image} 
          alt={opportunity.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{opportunity.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="text-sm">{opportunity.date}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {opportunity.location && (
          <span className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full mb-4">
            On Site
          </span>
        )}
        
        <button onClick={() => navigate("/organization/task-details")} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200">
          Sign Up
        </button>
      </div>
    </div>
  );
};

const BrowseOpportunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('any');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const opportunities = [
    {
      id: 1,
      title: 'Community Park Lineup',
      date: 'October 26, 2024',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      tags: ['Teamwork', 'Gardening', 'Environmental Care'],
      location: true
    },
    {
      id: 2,
      title: 'Senior Companion Program',
      date: 'Weekly (2 hours)',
      image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&h=300&fit=crop',
      tags: ['Communication', 'Story Telling'],
      location: true
    },
    {
      id: 3,
      title: 'Virtual Tutoring for Students',
      date: 'Flexible (1-2 hours/week)',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      tags: ['Mathematics', 'Science', 'Mentoring', 'Remote'],
      location: false
    },
    {
      id: 4,
      title: 'Tree Planting Initiative',
      date: 'Saturday, November 2nd (6 hours)',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
      tags: ['Physical Labor', 'Nature Conservation'],
      location: true
    }
  ];

  const filteredOpportunities = opportunities.filter(opp => 
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="w-full px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-600 hover:text-green-700 transition cursor-pointer">ServeSpot</h1>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <a href="#" className="text-green-600 font-semibold">Browse Opportunities</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Volunteer Dashboard</a>
              <a onClick={() => navigate("/organization/badges-and-points")} className="text-gray-700 hover:text-green-600 transition-colors cursor-pointer">Badges and Points</a>
            </div>

            <div className="md:hidden">
              <button className="text-gray-700 hover:text-green-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 lg:px-12 py-8">
        {/* Title and Search */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Discover Opportunities</h2>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">Any Date</span>
              </button>
              
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">All Locations</span>
              </button>
              
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">All Skills</span>
              </button>
              
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Globe className="w-4 h-4 mr-2" />
                <span className="text-sm">All Types</span>
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOpportunities.map(opportunity => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No opportunities found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseOpportunities;