import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import SalesSummary from '../components/account/SalesSummary';

const SalesSummaryPage = () => {
  const jwt = localStorage.getItem('jwt');
  const nav = useNavigate();

  useEffect(() => {
    if (!jwt) {
      nav('/account/login');
      return;
    }
    const decoded = jwtDecode(jwt);
    if (decoded.role !== 'ROLE_ADMIN') {
      nav('/forbidden');
    }
  }, []);

  return <SalesSummary jwt={jwt} />;
};

export default SalesSummaryPage;
