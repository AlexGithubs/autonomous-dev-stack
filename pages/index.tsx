import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

interface HomeProps {
  message: string;
  timestamp: string;
}

const Home: React.FC<HomeProps> = ({ message, timestamp }) => {
  const [loading, setLoading] = React.useState(false);
  const [apiResponse, setApiResponse] = React.useState<string>('');

  const handleApiCall = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hello');
      const data = await response.json();
      setApiResponse(data.message);
    } catch (error) {
      setApiResponse('Error calling API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Autonomous Dev Stack</title>
        <meta name="description" content="Multi-agent auto-dev pipeline for freelancers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-white">DevStack</h2>
              </div>
              <div className="flex space-x-4">
                <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#docs" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Docs
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Welcome to Autonomous Dev Stack
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {message}
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last updated: {timestamp}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-purple-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Agent System</h3>
              <p className="text-gray-400">
                AutoGen agents convert job descriptions into fully scaffolded applications automatically.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-green-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Automated QA</h3>
              <p className="text-gray-400">
                Playwright, Percy, and Browserbase ensure quality with automated testing and visual regression.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="text-red-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cost Controls</h3>
              <p className="text-gray-400">
                Real-time monitoring with budget caps and kill switches to prevent overspending.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={handleApiCall}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Test API Endpoint'}
            </button>
            
            {apiResponse && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 max-w-md mx-auto">
                <p className="text-white font-mono">{apiResponse}</p>
              </div>
            )}
          </div>

          <form className="mt-16 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </form>
        </main>

        <footer className="mt-24 border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p>&copy; 2025 Autonomous Dev Stack. Built for developers, by developers.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return {
    props: {
      message: 'Build production-ready applications with AI-powered development',
      timestamp: new Date().toISOString(),
    },
  };
};

export default Home;