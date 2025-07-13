import React, { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import "./signup.css";

const Signup = () => {
  const [enteredName, setEnteredName] = useState("");
  const [enteredMail, setEnteredMail] = useState("");
  const [enteredPass, setEnteredPass] = useState("");
  const [error, setError] = useState("");

  const nameChangeHandler = (event) => {
    setEnteredName(event.target.value);
  };

  const mailChangeHandler = (event) => {
    setEnteredMail(event.target.value);
  };

  const passChangeHandler = (event) => {
    setEnteredPass(event.target.value);
  };

  const formSubmitHandler = (event) => {
    event.preventDefault();

    if (!enteredName || !enteredMail || !enteredPass) {
      setError("All the fields are required to be filled");
      return;
    }

    fetch("http://localhost:4000/users/signup", {
      method: "POST",
      body: JSON.stringify({
        name: enteredName,
        email: enteredMail,
        password: enteredPass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          console.log("User has successfully signed up");
          return res.json();
        } else {
          return res.json().then((data) => {
            console.log(data.error.message);
          });
        }
      })
      .catch((err) => {
        console.log(err.message);
      });

    setEnteredName("");
    setEnteredMail("");
    setEnteredPass("");
    setError("");
  };

  return (
    <div className="signup">
      <Card className="card">
        <Form className="form" onSubmit={formSubmitHandler}>
          <h1 style={{ textAlign: "center", paddingTop: "0.6rem" }}>
            Register
          </h1>
          <Form.Group>
            <Form.Label className="formlabel">Name:</Form.Label>
            <Form.Control
              className="forminput"
              type="text"
              placeholder="Enter your name"
              value={enteredName}
              onChange={nameChangeHandler}
            />
          </Form.Group>
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
              Sign Up
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
