'use client';  
import Link from "next/link";
import GuestLayout from "./(main)/GuestLayout";


export default function PublicLandingPage() {
  return (
    <GuestLayout >
    <div className="min-h-screen bg-[#FDFBF7]">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#8E735B]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B85C38]/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-20 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#2C3E50]/5 text-[#2C3E50] px-4 py-2 rounded-full text-sm font-medium border border-[#2C3E50]/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B85C38] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B85C38]"></span>
                </span>
                Join 10,000+ readers
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A2A3A] leading-tight">
                Your next
                <span className="text-[#B85C38]"> chapter</span>
                <br />
                awaits
              </h1>
              
              <p className="text-lg text-[#4A5568] max-w-lg leading-relaxed">
                BookNest is where readers find their next favorite book, 
                track their journey, and connect with authors who inspire them.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/market"
                  className="group bg-[#2C3E50] text-white px-8 py-3.5 rounded-xl font-medium hover:bg-[#1A2A3A] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Explore marketplace
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <button 
                  onClick={() => alert('PWA install - will implement install prompt')}
                  className="border border-[#8E735B]/30 text-[#8E735B] px-8 py-3.5 rounded-xl font-medium hover:bg-[#8E735B]/5 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install app
                </button>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-[#8E735B]/20 border-2 border-white flex items-center justify-center text-[#8E735B] text-sm font-medium">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-[#1A2A3A]">2,000+</span>
                  <span className="text-[#4A5568]"> active readers</span>
                </div>
              </div>
            </div>
            
            {/* Right - Book Cards */}
            <div className="relative lg:pl-8">
              <div className="relative h-[460px]">
                <div className="absolute top-0 right-10 w-56 bg-white rounded-2xl shadow-xl p-5 rotate-6 hover:rotate-0 transition-all duration-300 z-30 border border-[#E8E2D9]">
                  <div className="space-y-2">
                    <div className="w-12 h-16 bg-[#2C3E50]/10 rounded-lg mb-3"></div>
                    <div className="font-semibold text-[#1A2A3A]">The Night Circus</div>
                    <div className="text-sm text-[#4A5568]">Erin Morgenstern</div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[#B85C38]">★</span>
                      <span className="text-sm text-[#4A5568]">4.8 (2.3k)</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-24 left-0 w-52 bg-white rounded-2xl shadow-xl p-5 -rotate-3 hover:rotate-0 transition-all duration-300 z-20 border border-[#E8E2D9]">
                  <div className="space-y-2">
                    <div className="text-2xl">🎧</div>
                    <div className="font-semibold text-[#1A2A3A]">Atomic Habits</div>
                    <div className="text-sm text-[#4A5568]">Audiobook</div>
                    <div className="w-full bg-[#E8E2D9] rounded-full h-1.5 mt-2">
                      <div className="bg-[#B85C38] h-1.5 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 right-0 w-64 bg-white rounded-2xl shadow-xl p-5 rotate-12 hover:rotate-0 transition-all duration-300 z-10 border border-[#E8E2D9]">
                  <div className="space-y-2">
                    <div className="text-2xl">💬</div>
                    <div className="font-semibold text-[#1A2A3A]">Book Club Chat</div>
                    <div className="text-sm text-[#4A5568]">12 members discussing...</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-[#4A5568]">Active now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A3A]">
            Everything you need
          </h2>
          <p className="text-[#4A5568] mt-3 max-w-2xl mx-auto">
            Marketplace • Reading tracker • Community — seamlessly integrated
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E2D9] hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#2C3E50]/10 rounded-xl flex items-center justify-center text-2xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-[#1A2A3A] mb-2">Marketplace</h3>
            <p className="text-[#4A5568] text-sm leading-relaxed">
              10,000+ books in PDF & audio. Pay once, read forever. Direct from authors.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E2D9] hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#2C3E50]/10 rounded-xl flex items-center justify-center text-2xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-[#1A2A3A] mb-2">Track progress</h3>
            <p className="text-[#4A5568] text-sm leading-relaxed">
              Reading streaks, achievements, and detailed analytics of your journey.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E2D9] hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-[#2C3E50]/10 rounded-xl flex items-center justify-center text-2xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-[#1A2A3A] mb-2">Community</h3>
            <p className="text-[#4A5568] text-sm leading-relaxed">
              Join book clubs, follow authors, share reviews, and discuss.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#2C3E50] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">10,000+</div>
              <div className="text-[#8E735B] text-sm mt-1">Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5,000+</div>
              <div className="text-[#8E735B] text-sm mt-1">Readers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-[#8E735B] text-sm mt-1">Authors</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50k+</div>
              <div className="text-[#8E735B] text-sm mt-1">Hours read</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-sm border border-[#E8E2D9]">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A2A3A] mb-3">
            Ready to start reading?
          </h2>
          <p className="text-[#4A5568] mb-6 max-w-md mx-auto">
            Join thousands of readers who discovered BookNest
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/register" 
              className="bg-[#2C3E50] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
            >
              Create free account
            </Link>
            <Link 
              href="/market" 
              className="border border-[#8E735B]/30 text-[#8E735B] px-6 py-2.5 rounded-lg font-medium hover:bg-[#8E735B]/5 transition-colors"
            >
              Browse as guest
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#1A2A3A] font-semibold">BookNest</div>
          <div className="flex gap-6 text-sm text-[#4A5568]">
            <Link href="/market" className="hover:text-[#B85C38]">Marketplace</Link>
            <Link href="/login" className="hover:text-[#B85C38]">Sign in</Link>
            <button onClick={() => alert('PWA')} className="hover:text-[#B85C38]">Install</button>
          </div>
        </div>
      </div>
    </div>
    </GuestLayout>
  );
}