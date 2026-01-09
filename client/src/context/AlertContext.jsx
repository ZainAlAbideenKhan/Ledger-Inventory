import { createContext, useContext, useState } from 'react';
import Alert from '../components/Alert/Alert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'error', timeout = 4000) => {
    setAlert({ message, type });

    if (timeout) {
      setTimeout(() => {
        setAlert(null);
      }, timeout);
    }
  };

  const hideAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
