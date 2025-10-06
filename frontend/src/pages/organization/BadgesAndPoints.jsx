import React, { useState } from 'react';
import { Award, Clock, MapPin, TrendingUp, Menu, X, User, Bell} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const BadgesAndPoints = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);    

  const earnedBadges = [
    {
      id: 1,
      name: 'Community Builder',
      description: 'Contributed to 5 community events',
      icon: '🏘️',
      status: 'Earned'
    },
    {
      id: 2,
      name: 'Green Thumb',
      description: 'Participated in 3 environmental projects',
      icon: '🌱',
      status: 'Earned'
    }
  ];

  const upcomingBadges = [
    {
      id: 3,
      name: 'Helping Hand',
      description: 'Volunteered 50+ hours',
      icon: '👋',
      status: 'Locked'
    },
    {
      id: 4,
      name: 'Digital Champion',
      description: 'Helped 5 organizations with digital needs',
      icon: '💻',
      status: 'Locked'
    },
    {
      id: 5,
      name: 'First Responder',
      description: 'Completed an emergency response task',
      icon: '🚨',
      status: 'Locked'
    },
    {
      id: 6,
      name: 'Animal Advocate',
      description: 'Volunteered for an animal welfare organization',
      icon: '🐾',
      status: 'Locked'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="w-full mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-600">ServeSpot</h1>
            </div>
            
            <div className="hidden lg:flex space-x-6">
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors text-sm">Browse Opportunities</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors text-sm">Volunteer Dashboard</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors text-sm">Organization Dashboard</a>
              <a href="#" className="text-green-600 font-semibold text-sm">Badges and Points</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors text-sm">Admin Panel</a>
            </div>

            {/* Right Section (Profile + Notification + Mobile Menu) */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <button onClick={() => navigate("/organization/notifications")} className="hidden lg:block p-2 text-gray-700 hover:text-green-600 transition-colors cursor-pointer relative">
                <Bell className="w-5 h-5" />
                {/* Optional: Notification badge */}
                <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Icon */}
              <button className="hidden lg:block p-2 text-gray-700 hover:text-green-600 transition-colors cursor-pointer">
                <User className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden text-gray-700 hover:text-green-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600 text-sm">Browse Opportunities</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600 text-sm">Volunteer Dashboard</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600 text-sm">Organization Dashboard</a>
              <a href="#" className="block py-2 text-green-600 font-semibold text-sm">Badges and Points</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600 text-sm">Admin Panel</a>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-6 sm:px-6 lg:px-8 py-8">
        {/* Impact Points Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Impact Points</h2>
              <div className="mb-4">
                <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">2000 points</div>
                <div className="w-full bg-white rounded-full h-3 mb-2">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm text-gray-600">100% Good Job! Keep up the good work</p>
              </div>
              <p className="text-gray-700">
                Keep up the great work! Every contribution makes a difference.
              </p>
            </div>
            <div className="flex-shrink-0">
              <img 
                src="https://illustrations.popsy.co/amber/team-spirit.svg" 
                alt="Community Impact"
                className="w-48 h-48 sm:w-56 sm:h-56"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Badges */}
          <div className="lg:col-span-2 space-y-8">
            {/* You Earned Badges */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">You Earned Badges</h2>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Celebrate your achievements and see what you've unlocked!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {earnedBadges.map(badge => (
                  <div key={badge.id} className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                      {badge.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                    <span className="inline-block px-4 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {badge.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Badges */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Upcoming Badges</h2>
              <p className="text-gray-600 text-center mb-6 text-sm">
                Discover new challenges and work towards these prestigious awards.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {upcomingBadges.map(badge => (
                  <div key={badge.id} className="text-center p-6 border border-gray-200 rounded-lg opacity-75 hover:opacity-100 transition-opacity">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center text-3xl grayscale">
                      {badge.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                    <span className="inline-block px-4 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                      {badge.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats and CTA */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Impact Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Your Community Impact</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">60</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">48</div>
                  <div className="text-sm text-gray-600">Hours Volunteered</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                Ready for your next challenge?
              </h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Discover new volunteering opportunities and earn more points and badges!
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Find New Opportunities
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BadgesAndPoints;