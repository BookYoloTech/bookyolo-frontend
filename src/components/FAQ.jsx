import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const faqs = [
    {
      question: "Do I need to register?",
      answer: "Yes. Creating a free account takes seconds; no credit card required."
    },
    {
      question: "Is BookYolo available on mobile?",
      answer: "Absolutely. Use our web app on any phone or download the iPhone app."
    },
    {
      question: "Is BookYolo really free?",
      answer: "Yes. Everyday travelers get unlimited scans and AI interaction under fair use. Most travelers will never hit the limits — scans are effectively unlimited."
    },
    {
      question: "Does BookYolo cover all Airbnb and Booking.com listings?",
      answer: "Pretty much. If it's on Airbnb or Booking.com, we can scan it."
    },
    {
      question: "Why should I use BookYolo if platforms already show reviews?",
      answer: "Because stars average everything. BookYolo looks for hidden risks, shifts in quality, and mismatched promises you'd never catch on your own."
    },
    {
      question: "How long does a scan take?",
      answer: "Usually seconds."
    },
    {
      question: "Is my data safe?",
      answer: "100%. We only store what's needed for your scan history. No data sales. Ever."
    },
    {
      question: "Will you expand to other platforms?",
      answer: "Yes. We currently support Airbnb and Booking.com, and other booking sites are coming soon."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('help@bookyolo.com');
    alert('Email address copied to clipboard!');
  };

  return (
    <section id="faq" className="relative py-16 md:py-20 overflow-hidden bg-[#f8fafb]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(600px_400px_at_-150px_150px,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute right-0 bottom-0 h-full w-1/2 bg-[radial-gradient(500px_300px_at_150px_-100px,rgba(147,51,234,0.06),transparent)]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-3xl">
          {/* Header section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-indigo-700 mb-4 ring-1 ring-indigo-100">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              Frequently Asked <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about BookYolo and how it works
            </p>
          </div>
          
          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <div className="relative">
                  {/* Background glow on hover */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-500 ease-out ${
                    activeIndex === index 
                      ? 'bg-gradient-to-r from-indigo-600/8 via-purple-600/8 to-blue-600/8 blur-lg scale-105' 
                      : 'bg-gradient-to-r from-gray-600/2 via-gray-600/2 to-gray-600/2 blur-lg opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-105'
                  }`} />
                  
                  {/* Main card */}
                  <div className={`relative rounded-xl bg-white/90 backdrop-blur-sm ring-1 transition-all duration-500 ease-out transform ${
                    activeIndex === index 
                      ? 'ring-indigo-200/60 shadow-xl scale-[1.02]' 
                      : 'ring-gray-200/50 shadow-sm hover:shadow-lg hover:scale-[1.01]'
                  }`}>
                    <button
                      className="flex justify-between items-center w-full p-4 md:p-5 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-300"
                      onClick={() => toggleFAQ(index)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-500 ease-out transform ${
                          activeIndex === index 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg rotate-180 scale-110' 
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600 group-hover:scale-110'
                        }`}>
                          <svg 
                            className={`w-3 h-3 transition-transform duration-500 ease-out ${
                              activeIndex === index ? 'rotate-180' : 'rotate-0'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-base md:text-lg font-semibold transition-colors duration-300 ${
                            activeIndex === index ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                          }`}>
                            {faq.question}
                          </h3>
                        </div>
                      </div>
                    </button>
                    
                    {/* Answer section */}
                    {activeIndex === index && (
                      <div className="overflow-hidden">
                        <div className="px-4 md:px-5 pb-4 md:pb-5 animate-in slide-in-from-top-3 duration-500 ease-out">
                          <div className="pl-9">
                            <div className="p-3 md:p-4 rounded-lg bg-gradient-to-br from-indigo-50/80 to-purple-50/80 ring-1 ring-indigo-100/60 backdrop-blur-sm">
                              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-xs font-medium text-blue-700 ring-1 ring-blue-100 hover:shadow-md transition-all duration-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Still have questions? Contact our support team
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-medium text-white ring-1 ring-blue-200 hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Help
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600">Get help from our support team</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Email us at:</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">help@bookyolo.com</span>
                  <button
                    onClick={copyEmailToClipboard}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=help@bookyolo.com&su=BookYolo Support Request&body=Hi BookYolo Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your question or issue here]%0D%0A%0D%0AThank you!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Open Gmail
                </a>
                <a
                  href="mailto:help@bookyolo.com?subject=BookYolo Support Request&body=Hi BookYolo Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your question or issue here]%0D%0A%0D%0AThank you!"
                  className="flex-1 bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Default Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FAQ;