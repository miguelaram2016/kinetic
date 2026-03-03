export function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Kinetic</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Kinetic. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
