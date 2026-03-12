import React, { createContext, useContext, useState } from 'react';

const BrokerContext = createContext(null);

export function BrokerProvider({ children }) {
  const [activeBrokerAccount, setActiveBrokerAccount] = useState(null);
  const [brokerAccounts, setBrokerAccounts] = useState([]);

  return (
    <BrokerContext.Provider value={{
      activeBrokerAccount, setActiveBrokerAccount,
      brokerAccounts, setBrokerAccounts,
    }}>
      {children}
    </BrokerContext.Provider>
  );
}

export const useBroker = () => useContext(BrokerContext);
