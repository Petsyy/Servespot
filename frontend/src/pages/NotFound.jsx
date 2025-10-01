import { Link } from "react-router-dom";
import monicaImg from "/public/images/monica.jpg";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">
      {/* Image */}
      <img
        src={monicaImg}
        alt="Confused Monica"
        className="w-64 h-auto mb-8 rounded-lg shadow-md"
      />

      {/* Text */}
      <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* Button */}
      <Link
        to="/"
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md"
      >
        Back to Home
      </Link>
    </div>
  );
}
