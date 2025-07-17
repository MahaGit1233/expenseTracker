import React, { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import "./signup.css";

const Login = ({ onLoginSuccess }) => {
  const [enteredMail, setEnteredMail] = useState("");
  const [enteredPass, setEnteredPass] = useState("");
  const [error, setError] = useState("");

  const mailChangeHandler = (event) => {
    setEnteredMail(event.target.value);
  };

  const passChangeHandler = (event) => {
    setEnteredPass(event.target.value);
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();

    if (!enteredMail || !enteredPass) {
      setError("All the fields are required to be filled");
      return;
    }

    fetch("http://localhost:4000/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: enteredMail,
        password: enteredPass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          console.log("User has successfully logged in");
          return res.json();
        } else {
          return res.json().then((data) => {
            throw new Error(data.message || "Login failed");
          });
        }
      })
      .then((data) => {
        onLoginSuccess();
        localStorage.setItem("token", data.token);
      })
      .catch((err) => {
        alert(err.message);
        console.log(err.message);
      });

    setEnteredMail("");
    setEnteredPass("");
    setError("");
  };

  return (
    <div className="signup">
      <Card className="card">
        <Form className="form" onSubmit={formSubmitHandler}>
          <h1 style={{ textAlign: "center", paddingTop: "0.6rem" }}>Login</h1>
          <Form.Group>
            <Form.Label className="formlabel">Email ID:</Form.Label>
            <Form.Control
              className="forminput"
              type="email"
              placeholder="Enter your mail id"
              value={enteredMail}
              onChange={mailChangeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="formlabel">Password:</Form.Label>
            <Form.Control
              className="forminput"
              type="password"
              placeholder="Enter your password"
              value={enteredPass}
              onChange={passChangeHandler}
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          <div
            style={{
              textAlign: "center",
              paddingBottom: "0.7rem",
              paddingTop: "0.3rem",
            }}
          >
            <Button type="submit" variant="outline-dark">
              Login
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
