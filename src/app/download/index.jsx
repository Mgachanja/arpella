import React, { useState } from 'react';
import { Download, Smartphone, Apple, Chrome, CheckCircle, Menu, X, AlertCircle, ExternalLink } from 'lucide-react';

export default function ArpellaDownloadPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Update these with your actual EAS build URLs
  const ANDROID_DOWNLOAD_URL = 'YOUR_ANDROID_BUILD_URL_HERE';
  const IOS_DOWNLOAD_URL = 'YOUR_IOS_BUILD_URL_HERE';
  const TESTFLIGHT_URL = 'YOUR_TESTFLIGHT_URL_HERE';

  const features = [
    'Seamless shopping experience',
    'Secure M-Pesa payments',
    'Real-time order tracking',
    'Live location delivery',
    'Easy product discovery',
    'Fast checkout process'
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-orange-500">
                Arpella
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-orange-500 transition">Features</a>
              <a href="#download" className="text-gray-700 hover:text-orange-500 transition">Download</a>
              <a href="#instructions" className="text-gray-700 hover:text-orange-500 transition">Instructions</a>
              <a href="https://arpellastore.com" className="text-gray-700 hover:text-orange-500 transition">Website</a>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Features</a>
              <a href="#download" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Download</a>
              <a href="#instructions" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Instructions</a>
              <a href="https://arpellastore.com" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Website</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block p-4 bg-orange-500 rounded-3xl mb-6 shadow-lg">
            <Smartphone size={64} className="text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Download <span className="text-orange-500">Arpella</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto" style={{ lineHeight: 1.8 }}>
            Experience seamless shopping on your mobile device. Download the beta version now and be among the first to try it!
          </p>

          {/* Beta Badge */}
          <div className="mb-12">
            <span className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              🚀 Beta Version 1.0.1 • Pre-Release
            </span>
          </div>

          {/* Important Notice */}
          <div className="max-w-2xl mx-auto mb-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div className="text-left">
                <p className="text-sm text-gray-700" style={{ lineHeight: 1.6 }}>
                  <strong>Note:</strong> This is a pre-release beta version. The app is not yet available on the App Store or Google Play Store. 
                  Follow the installation instructions below for your device.
                </p>
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div id="download" className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowIOSInstructions(true)}
              className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition shadow-md hover:shadow-lg w-72"
            >
              <Apple size={32} />
              <div className="text-left">
                <div className="text-xs">Download for</div>
                <div className="text-lg font-semibold">iOS (Beta)</div>
              </div>
            </button>

            <button
              onClick={() => setShowAndroidInstructions(true)}
              className="flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition shadow-md hover:shadow-lg w-72"
            >
              <Chrome size={32} />
              <div className="text-left">
                <div className="text-xs">Download for</div>
                <div className="text-lg font-semibold">Android (Beta)</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Why Choose Arpella?</h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect shopping experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-6 rounded-lg bg-gray-50 hover:shadow-md transition border"
              >
                <CheckCircle className="text-orange-500 flex-shrink-0 mt-1" size={24} />
                <span className="text-lg text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <div id="instructions" className="py-16 border-t">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Installation Instructions</h2>
            <p className="text-xl text-gray-600">Follow these steps to install Arpella on your device</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Android Instructions */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Chrome size={24} className="text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Android</h3>
              </div>
              <ol className="space-y-3 text-gray-700" style={{ lineHeight: 1.8 }}>
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Click the "Download for Android" button above</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>When prompted, allow installation from unknown sources in your device settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Download the APK file to your device</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Open the downloaded file and tap "Install"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">5.</span>
                  <span>Launch Arpella and start shopping!</span>
                </li>
              </ol>
            </div>

            {/* iOS Instructions */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Apple size={24} className="text-gray-900" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">iOS</h3>
              </div>
              <ol className="space-y-3 text-gray-700" style={{ lineHeight: 1.8 }}>
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Install TestFlight from the App Store (if not already installed)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Click the "Download for iOS" button above</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>You'll be redirected to TestFlight</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Tap "Accept" to join the beta</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">5.</span>
                  <span>Install Arpella through TestFlight and start shopping!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Need Help?</h2>
          <p className="text-xl mb-8 opacity-90" style={{ lineHeight: 1.8 }}>
            If you encounter any issues during installation or have questions about the app, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:arpellastoressystems@gmail.com"
              className="bg-white text-orange-500 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md inline-flex items-center justify-center gap-2"
            >
              Email Support
              <ExternalLink size={18} />
            </a>
            <a
              href="https://arpellastore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition inline-flex items-center justify-center gap-2"
            >
              Visit Website
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Arpella</h3>
              <p className="text-sm" style={{ lineHeight: 1.6 }}>Your trusted mobile shopping companion</p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://arpellastore.com/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="https://arpellastore.com" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="mailto:arpellastoressystems@gmail.com" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>Email: arpellastoressystems@gmail.com</li>
                <li>Website: arpellastore.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Arpella Stores. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Android Instructions Modal */}
      {showAndroidInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Download Arpella for Android</h3>
              <button onClick={() => setShowAndroidInstructions(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700" style={{ lineHeight: 1.6 }}>
                  <strong>Important:</strong> You'll need to enable "Install from Unknown Sources" in your Android settings to install this app.
                </p>
              </div>
              
              <h4 className="font-bold text-lg mb-3">Installation Steps:</h4>
              <ol className="space-y-4 mb-6 text-gray-700" style={{ lineHeight: 1.8 }}>
                <li><strong>1.</strong> Click the download button below to get the APK file</li>
                <li><strong>2.</strong> Go to Settings → Security → Enable "Unknown Sources" or "Install Unknown Apps"</li>
                <li><strong>3.</strong> Open the downloaded APK file from your notifications or Downloads folder</li>
                <li><strong>4.</strong> Tap "Install" and wait for the installation to complete</li>
                <li><strong>5.</strong> Open Arpella and start shopping!</li>
              </ol>

              <a
                href={ANDROID_DOWNLOAD_URL}
                className="block w-full bg-orange-500 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                <Download className="inline mr-2" size={20} />
                Download APK (Beta)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">Download Arpella for iOS</h3>
              <button onClick={() => setShowIOSInstructions(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700" style={{ lineHeight: 1.6 }}>
                  <strong>Note:</strong> You'll need TestFlight (Apple's beta testing app) to install Arpella on iOS.
                </p>
              </div>
              
              <h4 className="font-bold text-lg mb-3">Installation Steps:</h4>
              <ol className="space-y-4 mb-6 text-gray-700" style={{ lineHeight: 1.8 }}>
                <li><strong>1.</strong> Install TestFlight from the App Store (if you haven't already)</li>
                <li><strong>2.</strong> Click the button below to open the TestFlight invitation</li>
                <li><strong>3.</strong> Tap "Accept" to join the Arpella beta program</li>
                <li><strong>4.</strong> Tap "Install" in TestFlight</li>
                <li><strong>5.</strong> Open Arpella from your home screen and start shopping!</li>
              </ol>

              <a
                href={TESTFLIGHT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-900 text-white text-center px-6 py-4 rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                <Apple className="inline mr-2" size={20} />
                Open in TestFlight
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}