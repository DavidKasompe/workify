import Link from 'next/link';
import { Button } from '@/app/components/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">
              Welcome to{' '}
              <span className="text-indigo-600">Workify</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8">
              The ultimate task management tool for developers
            </p>
            <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
              Stay organized, track your progress, and boost your productivity with our 
              developer-focused task management solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Task Management
              </h3>
              <p className="text-gray-600">
                Organize your work with customizable task lists and priorities
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your progress with visual charts and statistics
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Developer Tools
              </h3>
              <p className="text-gray-600">
                Integrate with your development workflow and tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
