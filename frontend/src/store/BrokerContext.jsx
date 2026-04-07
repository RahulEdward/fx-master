import React, { createContext, useContext, useState, useEffect } from 'react';
import { brokerAPI } from '../services/api';
import { useAuth } from './AuthContext';

const BrokerContext = createContext(null);

export function BrokerProvider({ children }) {
  const { user } = useAuth();
  const [activeBrokerAccount, setActiveBrokerAccount] = useState(null);
  const [brokerAccounts, setBrokerAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Auto-fetch saved accounts when user logs in
  const fetchAccounts = async () => {
    if (!user) return;
    setLoadingAccounts(true);
    try {
      const res = await brokerAPI.getAccounts();
      const accounts = res.data || [];
      setBrokerAccounts(accounts);
      // Auto-set active if one is connected
      const connected = accounts.find(a => a.is_connected);
      if (connected && !activeBrokerAccount) {
        setActiveBrokerAccount(connected);
      }
    } catch (e) {
      // User might not have any accounts yet
      console.log('No broker accounts found');
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  return (
    <BrokerContext.Provider value={{
      activeBrokerAccount, setActiveBrokerAccount,
      brokerAccounts, setBrokerAccounts,
      loadingAccounts, fetchAccounts,
    }}>
      {children}
    </BrokerContext.Provider>
  );
}

export const useBroker = () => useContext(BrokerContext);
