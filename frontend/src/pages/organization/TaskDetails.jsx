import React, { useState } from 'react';
import { MapPin, Calendar, Users, Globe, Mail, Building2, Menu, X, Bell } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const TaskDetails = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-600">ServeSpot</h1>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Opportunities</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/organization/notifications")} className="hidden md:flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </button>

              <button 
                className="md:hidden text-gray-700 hover:text-green-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600">Home</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600">Opportunities</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600">About</a>
              <button className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Community Garden Cleanup Day
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  <MapPin className="w-3 h-3 mr-1" />
                  Oakwood Community Park
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  <Globe className="w-3 h-3 mr-1" />
                  Environmental Cleanup
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  4 hours (Saturday, July 27th)
                </span>
              </div>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Help us rejuvenate the Oakwood Community Garden for the upcoming planting season. A perfect opportunity to contribute to local green spaces and meet fellow community members.
              </p>

              {/* About This Opportunity */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Opportunity</h2>
                <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-4">
                  <p>
                    We are inviting all passionate individuals to join us in our annual Community Garden Cleanup Day! 
                    This event is aimed for rejuvenating the beauty and productivity of our beloved Oakwood Community 
                    Garden. Volunteers will assist with various tasks, including weeding, mulching, pruning, and preparing 
                    beds for new plantings. This year, we're focusing on revitalizing the herb garden section and expanding 
                    our native plant area. Your contribution will directly impact the availability of fresh produce for local 
                    food banks and enhance the biodiversity of our park. All tools and safety equipment will be provided. 
                    Please wear comfortable clothing and closed-toe shoes. Water and light refreshments will be available.
                  </p>
                  <p>
                    Join us for a fulfilling experience in our local community garden. We're looking for enthusiastic 
                    volunteers to help us with planting, weeding, and harvesting. No prior gardening experience is required; 
                    we'll provide all the necessary tools and guidance. This is a great chance to get your hands dirty, 
                    meet new people, and contribute to a greener neighborhood.
                  </p>
                </div>
              </section>

              {/* Your Role Includes */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Role Includes:</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Preparing garden beds for planting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Watering and caring for young plants</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Harvesting seasonal produce</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span>Light maintenance and clean-up</span>
                  </li>
                </ul>
                <p className="text-gray-700 mt-4">
                  We operate on a flexible schedule and even a few hours can make a significant difference. Bring your 
                  positive attitude and a willingness to learn!
                </p>
              </section>

              {/* Visuals & Resources */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Visuals & Resources</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop" 
                      alt="Community garden with plants"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Photo of a community garden with various plants and tools, layered and vibrant, composed with golden ratio and balanced negative space.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=300&fit=crop" 
                      alt="Volunteer planting"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Photo of a volunteer planting a small tree in a garden, hands in soil, focused, composed with golden ratio and balanced negative space.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop" 
                      alt="Gardening tools"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-600">
                        Photo of gardening tools neatly arranged on a wooden bench, close-up, natural lighting, composed with golden ratio and balanced negative space.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Sign Up Button */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors mb-3">
                  Sign Up to Volunteer
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors">
                  Edit Task (for Organizers)
                </button>
              </div>

              {/* Organizer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Details about the organization posting this task.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Contact: Emily Chen</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        Organization: Oakwood Parks & Recreation
                      </p>
                      <p className="text-sm text-gray-600">
                        Oakwood Parks & Recreation is dedicated to preserving and enhancing our city's natural beauty, 
                        providing accessible green spaces and recreational opportunities for all residents. We believe in 
                        fostering community spirit through outdoor activities and environmental stewardship.
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-2 rounded-lg transition-colors text-sm">
                  Contact Organizer
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetails;