import logo from './logo.svg';
import './App.css';

function App() {
  return (
  <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">ChapterConnect</h1>
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">
        <p className="text-lg mb-4">Welcome to the ChapterConnect portal!</p>
        <button className="w-full bg-blue-600 text-white py-2 rounded-xl mb-2 hover:bg-blue-700">
          Join a Chapter
        </button>
        <button className="w-full border border-blue-600 text-blue-600 py-2 rounded-xl hover:bg-blue-50">
          Create a Chapter
        </button>
      </div>
    </div>
  );
}

export default App;
