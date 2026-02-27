import { useAuth } from 'auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearStoredPassword } from '../storage';

const Disconnect = () => {
  const navigate = useNavigate();
  const { disconnect } = useAuth();

  useEffect(() => {
    disconnect();
    clearStoredPassword();
    navigate('/', { replace: true });
  }, [disconnect, navigate]);

  return null;
};

export default Disconnect;
