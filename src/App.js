import { useState } from "react";
import Signup from "./components/signup";
import Login from "./components/login";

function App() {
  const [isLogin, serIsLogin] = useState(false);

  const toggleAuth = () => {
    serIsLogin((prev) => !prev);
  };

  return (
    <div style={{ paddingTop: "7%" }}>
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
      {isLogin ? <Login /> : <Signup />}
    </div>
  );
}

export default App;
