import { useState } from "react";
import Signup from "./components/signup";
import Login from "./components/login";
import AddExpenses from "./components/AddExpenses";

function App() {
  const [isLogin, serIsLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleAuth = () => {
    serIsLogin((prev) => !prev);
  };

  return (
    <div style={{ paddingTop: "7%" }}>
      {!isLoggedIn ? (
        <>
          <p
            style={{
              textAlign: "center",
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
            onClick={toggleAuth}
          >
            {isLogin
              ? "Don't have an account? Sign up now!"
              : "Already signed up? Login now!"}
          </p>
          {isLogin ? (
            <Login onLoginSuccess={() => setIsLoggedIn(true)} />
          ) : (
            <Signup />
          )}
        </>
      ) : (
        <AddExpenses />
      )}
    </div>
  );
}

export default App;
