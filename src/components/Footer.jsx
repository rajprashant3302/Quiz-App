// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 p-4 text-center">
      © {new Date().getFullYear()} Quiz App. All rights reserved.
    </footer>
  );
}
