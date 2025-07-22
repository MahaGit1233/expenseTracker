import { useEffect, useState } from "react";
import Signup from "./components/signup";
import Login from "./components/login";
import AddExpenses from "./components/AddExpenses";
import { BrowserRouter } from "react-router-dom";
import { Switch } from "react-router-dom";
import { Route } from "react-router-dom";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  const [isLogin, serIsLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const toggleAuth = () => {
    serIsLogin((prev) => !prev);
  };

  const logoutHandler = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
  };

  return (
    <BrowserRouter>
      <div>
        <Switch>
          <Route exact path="/">
            {!isLoggedIn ? (
              <>
                <p
                  style={{
                    textAlign: "center",
                    cursor: "pointer",
                    color: "blue",
                    textDecoration: "underline",
                    paddingTop: "5%",
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
              <AddExpenses onLogout={logoutHandler} />
            )}
          </Route>
          <Route path="/forgot-password" component={ForgotPassword} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
