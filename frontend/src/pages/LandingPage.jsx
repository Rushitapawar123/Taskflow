import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <nav className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl font-bold text-blue-600">📋 TaskFlow</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-gray-600 hover:text-blue-600 px-3 py-2"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4 max-w-2xl">
          Organize work. Together. In real-time.
        </h2>
        <p className="text-gray-500 max-w-xl mb-8">
          TaskFlow is a collaborative task board where teams create boards, organize tasks, and see every update instantly — no refresh needed.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Create Your First Board →
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-2xl mb-2">⚡</p>
            <h3 className="font-semibold text-gray-800 mb-1">Real-Time Sync</h3>
            <p className="text-sm text-gray-500">See changes from teammates instantly, no refresh needed.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-2xl mb-2">🖱️</p>
            <h3 className="font-semibold text-gray-800 mb-1">Drag & Drop</h3>
            <p className="text-sm text-gray-500">Move cards between lists with a simple drag.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-2xl mb-2">🔒</p>
            <h3 className="font-semibold text-gray-800 mb-1">Secure & Private</h3>
            <p className="text-sm text-gray-500">Your boards are protected with secure authentication.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;