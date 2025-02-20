import { useState } from "react";
import { auth } from "../services/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import '../Login.css'; 
import googleLogo from "../assets/google_logo.png";
import { createAuthor } from '../services/api';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const provider = new GoogleAuthProvider();

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const authorData = {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          location: location
        };
        await createAuthor(authorData);

        alert("Account created and author profile successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
  
      // Extract first and last name from displayName
      let firstName = "";
      let lastName = "";
      if (user.displayName) {
        const nameParts = user.displayName.split(" ");
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      }
  
      const authorData = {
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        location: "",
      };
  
      await createAuthor(authorData);
  
      alert("Google sign-in successful and author profile created!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Chaptre</h1>
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            className="toggle-link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </p>
        <form onSubmit={handleEmailPasswordAuth}>
          {isSignUp && (
            <>
              <div className="input-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="primary-button" type="submit">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>
        <button className="google-button" onClick={handleGoogleSignIn}>
         <img src={googleLogo} alt="Google logo" />
         {isSignUp ? "Sign up with Google" : "Log in with Google"}
         </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
