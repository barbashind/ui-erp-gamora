import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkToken } from './services/AuthorizationService';
import Auth from './Auth';

const root = document.getElementById('root');
export const Main = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
      const checkUser = async () => {
          const resp = await checkToken();
          setIsValid(resp.valid);
      };

      checkUser();
  }, []);

  if (isValid === null) {
      // Можно добавить загрузочный экран
      return (
      <div
        style={{width: '100vw', justifyContent: 'center', alignContent: 'center'}}
      >
        <div style={{ justifySelf: 'center'}}>
          Loading...
        </div>
        
      </div>
      )
  }

  return (
      <BrowserRouter>
          {isValid ? <App /> : <Auth />}
      </BrowserRouter>
  );
};

if (root) {
  ReactDOM.createRoot(root).render(
      <React.StrictMode>
          <Main />
      </React.StrictMode>
  );
}