import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Menu, Search, User as UserIcon } from 'lucide-react';

const DemoStore = () => {
  const { company } = useAuth();
  
  // We use the logged-in user's company ID if available, otherwise fallback
  const widgetUrl = `/widget?company_id=${company?.id || '6fe5b851-b214-4a99-a0f4-651faae4ae9d'}`;
  
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* Fake Store Header */}
      <header className="border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Menu className="w-6 h-6 text-slate-500" />
          <h1 className="text-2xl font-black tracking-tighter">TECH<span className="text-blue-600">STORE</span></h1>
          <nav className="hidden md:flex space-x-6 ml-8 text-sm font-semibold text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">Laptops</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Accessories</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </nav>
        </div>
        <div className="flex items-center space-x-6 text-slate-500">
          <Search className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
          <UserIcon className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
          <ShoppingCart className="w-5 h-5 hover:text-blue-600 cursor-pointer" />
        </div>
      </header>

      {/* Fake Store Hero Content */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="bg-slate-50 rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl">
            <span className="text-blue-600 font-bold tracking-wider text-sm uppercase">New Arrival</span>
            <h2 className="text-5xl font-extrabold mt-4 mb-6 leading-tight">The ultimate pro laptop for creators.</h2>
            <p className="text-lg text-slate-500 mb-8">Experience blazing fast speeds and incredible battery life with our newest M-Series architecture.</p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
              Buy Now - $1,299
            </button>
          </div>
          <div className="mt-12 md:mt-0 opacity-80 mix-blend-multiply">
            <img 
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600" 
              alt="Laptop" 
              className="rounded-2xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-4">Having trouble with a recent order?</h3>
          <p className="text-slate-500">Our support team is online and ready to help. Click the help icon in the bottom right.</p>
        </div>
      </main>

      {/* Floating Widget Toggle Button */}
      <button 
        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-50 focus:outline-none"
      >
        {isWidgetOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* The Embedded SustainHub Iframe Widget */}
      <div 
        className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-40 transition-all duration-300 transform origin-bottom-right ${isWidgetOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '500px' }}
      >
        <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center">
          <span className="font-semibold text-sm">Customer Support</span>
        </div>
        <iframe 
          src={widgetUrl}
          className="w-full h-full border-none"
          title="Support Widget"
        />
      </div>

    </div>
  );
};

export default DemoStore;
