import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useActivateAccountMutation } from '../features/auth/authSlice';

function Activate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activationStatus, setActivationStatus] = useState('pending'); // 'pending', 'activating', 'success', 'error'
  const [message, setMessage] = useState('');

  const [activateAccount, { isLoading }] = useActivateAccountMutation();

  useEffect(() => {
    const token = searchParams.get('token'); // Get token from URL query params
    if (token) {
      const activate = async () => {
        setActivationStatus('activating');
        try {
          await activateAccount({ token }).unwrap();
          setActivationStatus('success');
          setMessage('Account activated successfully! You can now log in.');
          setTimeout(() => {
            navigate('/login'); // Redirect to login after activation
          }, 3000);
        } catch (err) {
          setActivationStatus('error');
          setMessage(err?.data?.message || 'Account activation failed. Invalid or expired token.');
          console.error('Activation Error:', err);
        }
      };
      activate();
    } else {
      setActivationStatus('error');
      setMessage('Activation token missing from URL.');
    }
  }, [searchParams, activateAccount, navigate]);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h2>Account Activation</h2>
      {activationStatus === 'pending' && <p>Looking for activation token...</p>}
      {activationStatus === 'activating' && <p>Activating your account...</p>}
      {activationStatus === 'success' && <p style={{ color: 'green' }}>{message}</p>}
      {activationStatus === 'error' && <p style={{ color: 'red' }}>{message}</p>}
      {isLoading && <p>Loading...</p>}
    </div>
  );
}

export default Activate;
