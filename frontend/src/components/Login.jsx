import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const provider = new GoogleAuthProvider();

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      alert('Google sign-in successful!');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="login">
      <h1>{isSignUp ? 'Sign Up' : 'Log In'}</h1>
      <form onSubmit={handleEmailPasswordAuth}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</button>
      </form>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        Switch to {isSignUp ? 'Log In' : 'Sign Up'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
