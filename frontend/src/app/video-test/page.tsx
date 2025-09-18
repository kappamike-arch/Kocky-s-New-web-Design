'use client';

export const dynamic = 'force-dynamic';

export default function VideoTest() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <h1 className="text-white text-2xl mb-8">Video Test Page</h1>
      
      {/* Test 1: Direct video URL */}
      <div className="mb-8 text-center">
        <h2 className="text-white text-lg mb-4">Test 1: Direct Video URL</h2>
        <video
          autoPlay
          loop
          muted
          playsInline
          controls
          className="w-96 h-64 object-cover border border-white"
        >
          <source src="https://staging.kockys.com/uploads/videos/happy-hour-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Test 2: API Data Display */}
      <div className="mb-8 text-center">
        <h2 className="text-white text-lg mb-4">Test 2: API Data</h2>
        <div className="text-white text-sm">
          <p>API URL: https://staging.kockys.com/api/hero-settings/happy-hour</p>
          <p>Expected Video: /uploads/videos/happy-hour-hero.mp4</p>
          <p>Full URL: https://staging.kockys.com/uploads/videos/happy-hour-hero.mp4</p>
        </div>
      </div>

      {/* Test 3: Background Video */}
      <div className="relative w-96 h-64 border border-white">
        <h2 className="text-white text-lg mb-4 relative z-10">Test 3: Background Video</h2>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="https://staging.kockys.com/uploads/videos/happy-hour-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-1"></div>
        <div className="relative z-10 text-white text-center p-4">
          <p>Content over background video</p>
        </div>
      </div>
    </div>
  );
}
