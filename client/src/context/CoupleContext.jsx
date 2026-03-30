import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const CoupleContext = createContext(null);

export function CoupleProvider({ children }) {
  const [couple, setCouple] = useState(null);
  const [isCouple, setIsCouple] = useState(false);

  const refresh = async () => {
    try {
      const res = await api.get('/couple/status');
      if (res.data && res.data.status !== 'None') {
        setCouple(res.data);
        setIsCouple(res.data.status === 'Active');
      } else {
        setCouple(null);
        setIsCouple(false);
      }
    } catch (error) {
      setCouple(null);
      setIsCouple(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <CoupleContext.Provider value={{ couple, isCouple, refresh }}>
      {children}
    </CoupleContext.Provider>
  );
}
