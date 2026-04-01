import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react'; // Importing a menu icon
import { jwtDecode } from 'jwt-decode';

const AccountNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState('')
  const nav = useNavigate();
  const jwt = localStorage.getItem("jwt")
  

  useEffect(() => {
    if(jwt) {
      setUser(jwtDecode(jwt))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    nav('/');
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden flex items-center p-2 bg-pink-200 rounded-lg shadow ml-auto mr-auto mt-5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Navigation Menu */}
      <nav
        className={`${
          isOpen ? 'flex' : 'hidden'
        } md:flex flex-col md:flex-row items-center justify-center gap-6 bg-pink-100 p-4 rounded-xl shadow-lg md:w-3/4 mx-auto mt-4 absolute md:relative w-full`}
      >
        <Link
          to="/account/settings"
          className="text-lg font-semibold text-gray-800 hover:text-pink-500 transition duration-300"
        >
          Settings
        </Link>
        <Link
          to="/account/payment-history"
          className="text-lg font-semibold text-gray-800 hover:text-pink-500 transition duration-300"
        >
          Payment History
        </Link>
        
        {user.role === 'ROLE_ADMIN' ? (
          <>
            <Link
              to="/account/admin"
              className="text-lg font-semibold text-gray-800 hover:text-pink-500 transition duration-300"
            >
              Admin
            </Link>
            <Link
              to="/account/sales"
              className="text-lg font-semibold text-gray-800 hover:text-pink-500 transition duration-300"
            >
              Sales
            </Link>
          </>
        ) : null}
        
        <button
          onClick={handleLogout}
          className="text-lg font-semibold text-red-600 hover:text-red-800 transition duration-300"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default AccountNav;
