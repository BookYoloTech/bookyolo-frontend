import React, { useState } from 'react';
import logo from '../assets/main-logo.jpg';
import jeanImage from '../assets/jean 1.JPG';

const Hero = ({ onSignup }) => {
  const [imageUrl, setImageUrl] = useState(jeanImage);

  return (
    <section id="hero" className="relative py-20 md:py-28 overflow-hidden bg-white">
      {/* Background effects - subtle accent color gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 opacity-20" style={{background: 'radial-gradient(600px 400px at -150px 150px, #e9e8ea, transparent)'}} />
        <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-20" style={{background: 'radial-gradient(500px 300px at 150px -100px, #e9e8ea, transparent)'}} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6 leading-tight">
                Smarter Stays <span className="text-primary">Start</span> Here
              </h1>
              <p className="text-lg md:text-xl text-primary leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                We decode the fine print of any vacation rental so you book with confidence. Because every trip deserves more joy, less doubt. BookYolo is your AI-powered travel engine that reveals the full story behind every stay — clarity, not surprises.
              </p>
              
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary mb-8">
                <span className="text-primary">⭐</span>
                Already Trusted by 12,000+ travelers worldwide
              </div>
              
              {/* CTA text */}
              <p className="text-sm text-primary opacity-70 mb-8">Free. Sign up in seconds — no credit card required.</p>
              
              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={onSignup}
                  className="px-8 py-4 bg-button text-button rounded-2xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Open Web App
                </button>
                <button className="px-8 py-4 bg-white text-primary border-2 border-accent rounded-2xl font-semibold hover:bg-accent transition-all duration-300">
                  Download iPhone App
                </button>
              </div>
            </div>
            
            {/* Right: Image */}
            <div className="relative">
              <div className="relative rounded-3xl bg-white backdrop-blur-sm ring-1 border-accent shadow-xl p-6 overflow-hidden">
                <div className="flex items-center justify-center min-h-[400px]">
                  <img 
                    src={imageUrl} 
                    alt="Hero illustration" 
                    className="max-w-full h-auto object-contain rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Recognition strip */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-primary mb-6">Trusted by travelers worldwide</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <span className="text-primary font-medium">BookYolo</span>
              <span className="text-primary font-medium">BookYolo</span>
              <span className="text-primary font-medium">BookYolo</span>
              <span className="text-primary font-medium">BookYolo</span>
              <span className="text-primary font-medium">BookYolo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
