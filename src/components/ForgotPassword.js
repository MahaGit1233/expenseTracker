import React, { useState } from "react";
import { Button, Card, Form, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const ForgotPassword = () => {
  const [enteredMail, setEnteredMail] = useState("");

  const mailChangeHandler = (event) => {
    setEnteredMail(event.target.value);
  };

  const forgotPasswordHandler = (event) => {
    event.preventDefault();

    fetch("http://localhost:4000/password/forgotpassword", {
      method: "POST",
      body: JSON.stringify({
        email: enteredMail,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          console.log("ok");
          return res.json();
        } else {
          return res.json().then((data) => {
            alert(data.error.message);
            console.log(data.error.message);
          });
        }
      })
      .then((data) => {
        alert("Reset link sent to your email");
        console.log(data.email);
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <div>
      <Navbar
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          zIndex: "1000",
          backgroundColor: "gray",
          color: "whitesmoke",
        }}
      >
        <NavLink
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontSize: "30px",
            marginLeft: "1rem",
            marginTop: "-0.5rem",
          }}
        >
          ←
        </NavLink>
      </Navbar>
      <div className="signup" style={{ marginTop: "5rem" }}>
        <Card className="card">
          <Form className="form" onSubmit={forgotPasswordHandler}>
            <Form.Group>
              <Form.Label className="formlabel">
                Enter your Email Id:
              </Form.Label>
              <Form.Control
                className="forminput"
                style={{ backgroundColor: "#efebeb" }}
                type="email"
                placeholder="Enter your mail Id"
                value={enteredMail}
                onChange={mailChangeHandler}
              />
            </Form.Group>
            <div style={{ paddingBottom: "1rem" }}>
              <Button type="submit" variant="outline-dark">Send Link</Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
