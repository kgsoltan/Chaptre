import { useState } from "react";
import { auth } from "../services/firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import googleLogo from "../assets/google_logo.png";
import { createAuthor } from "../services/api";
import { useNavigate } from "react-router-dom";


import './LoginPage.css'

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();

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
        };
        await createAuthor(authorData);

        console.log("Account created and author profile successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in successfully!");
      }
      navigate("/");
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

      let firstName = "";
      let lastName = "";
      if (user.displayName) {
        const nameParts = user.displayName.split(" ");
        firstName = nameParts[0];
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      }

      if (isSignUp) {
        const authorData = {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        };

        await createAuthor(authorData);
        console.log("Google sign-up successful and author profile created!");
      } else {
        console.log("Logged in successfully!");
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="bg login-container">
      <div className="login-box">
        <h1>Chaptre</h1>
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"} {" "}
          <span className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </p>
        <form onSubmit={handleEmailPasswordAuth}>
          {isSignUp && (
            <>
              <div className="input-group">
                <label>First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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

export default LoginPage;
