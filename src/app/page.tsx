import { Container } from "@/components";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your AI{" "}
              <span className="text-primary">Personal Trainer</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Transform your fitness journey with adaptive, intelligent coaching that learns your body and pushes you further.
            </p>
            <button className="bg-primary hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
              Get Early Access
            </button>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-dark-800/50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Kinetic?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our AI-powered platform adapts to your unique fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Natural Language Coaching */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Natural Language Coaching</h3>
              <p className="text-gray-400">
                Chat with your AI trainer using plain English. Get real-time form corrections, workout modifications, and motivation tailored to your style.
              </p>
            </div>

            {/* Feature 2: Adaptive Workouts */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Adaptive Workouts</h3>
              <p className="text-gray-400">
                Our AI analyzes your performance daily, adjusting difficulty, volume, and exercise selection to match your recovery and progression.
              </p>
            </div>

            {/* Feature 3: Progress Tracking */}
            <div className="bg-dark-800 p-8 rounded-2xl border border-dark-700 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-gray-400">
                Visualize your gains with comprehensive analytics. Track strength, endurance, body metrics, and get AI insights on what&apos;s working.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container>
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl p-12 text-center border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of early adopters revolutionizing their workouts with AI-powered coaching.
            </p>
            <button className="bg-primary hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
              Get Early Access
            </button>
          </div>
        </Container>
      </section>
    </>
  );
}
