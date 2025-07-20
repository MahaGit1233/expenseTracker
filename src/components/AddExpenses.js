import React, { useEffect, useState } from "react";
import { Button, Card, Form, Navbar } from "react-bootstrap";
import { load } from "@cashfreepayments/cashfree-js";
import "./signup.css";

const AddExpenses = (props) => {
  const [enteredAmount, setEnteredAmount] = useState("");
  const [enteredDescription, setEnteredDescription] = useState("");
  const [selectedOption, SetSelectedOption] = useState("");
  const [showForm, setShowForm] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [header, setHeader] = useState(false);
  const [leaderboardValues, setLeaderboardValues] = useState([]);

  const token = localStorage.getItem("token");

  const amountChangeHandler = (event) => {
    setEnteredAmount(event.target.value);
  };

  const descriptionChangeHandler = (event) => {
    setEnteredDescription(event.target.value);
  };

  const optionChangeHandler = (event) => {
    SetSelectedOption(event.target.value);
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  useEffect(() => {
    fetch(`http://localhost:4000/expenses/get`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch expenses");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setExpenses(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const addExpenseHandler = async (event) => {
    event.preventDefault();
    toggleForm();

    const Expenses = {
      amountSpent: enteredAmount,
      description: enteredDescription,
      category: selectedOption,
    };

    if (!enteredAmount || !enteredDescription || !selectedOption) {
      alert("Please fill all the fields");
    } else {
      const response = await fetch(`http://localhost:4000/expenses/add`, {
        method: "POST",
        body: JSON.stringify(Expenses),
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });
      const data = await response.json();
      console.log(data);
      setExpenses((prev) => [...prev, data]);
    }

    setEnteredAmount("");
    setEnteredDescription("");
    SetSelectedOption("");
  };

  const deleteHandler = async (id) => {
    const response = await fetch(
      `http://localhost:4000/expenses/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    );
    if (response.ok) {
      console.log("Expense successfully deleted");
    }
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id)
    );
  };

  const premiumHandler = async () => {
    const response = await fetch("http://localhost:4000/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await response.json();

    if (data && data.payment_session_id) {
      const cashfree = await load({
        mode: "sandbox",
      });

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_blank",
      });

      setTimeout(async () => {
        try {
          console.log("data.order_id:", data.order_id);
          const res = await fetch(
            `http://localhost:4000/payment/status/${data.order_id}`,
            {
              headers: {
                Authorization: token,
              },
            }
          );

          const statusData = await res.json();
          console.log(statusData);
          if (statusData.status === "Success") {
            setHeader(true);
          }

          alert(statusData.message);
        } catch (error) {
          alert("Something went wrong while checking payment status.");
        }
      }, 40000);
    }
  };

  const leaderboardExpensesHandler = async () => {
    try {
      const res = await fetch("http://localhost:4000/premium/leaderboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const data = await res.json();
      console.log("Leaderboard:", data);
      setLeaderboardValues(data);
    } catch (error) {
      console.log("Error fetching leaderboard:", error.message);
    }
  };

  return (
    <div>
      {header && (
        <Navbar
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "green",
            color: "white",
            marginBottom: "1rem",
          }}
        >
          <i style={{ paddingLeft: "15px" }}>
            Congratulations! you're a premium user now.
          </i>
          <div
            style={{
              paddingRight: "30px",
              display: "flex",
              gap: "5px",
            }}
          >
            <Button
              onClick={leaderboardExpensesHandler}
              variant="outline-light"
            >
              Click here to see Leaderboard
            </Button>
          </div>
        </Navbar>
      )}
      <Navbar
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "ButtonFace",
          marginBottom: "1rem",
        }}
      >
        <i style={{ paddingLeft: "15px" }}>Welcome to Expense Tracker!</i>

        <div
          style={{
            paddingRight: "30px",
            display: "flex",
            gap: "5px",
          }}
        >
          <Button onClick={premiumHandler} variant="outline-dark">
            Premium
          </Button>
          <Button onClick={props.onLogout} variant="outline-dark">
            Logout
          </Button>
        </div>
      </Navbar>
      <div className="signup">
        <Card className="card">
          {showForm ? (
            <Form className="form" onSubmit={addExpenseHandler}>
              <Form.Group>
                <Form.Label className="formlabel">Amount Spent:</Form.Label>
                <Form.Control
                  className="forminput"
                  type="number"
                  placeholder="Enter amount"
                  value={enteredAmount}
                  onChange={amountChangeHandler}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="formlabel">Description:</Form.Label>
                <Form.Control
                  className="forminput"
                  type="text"
                  placeholder="Describe your expense"
                  value={enteredDescription}
                  onChange={descriptionChangeHandler}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="formlabel">Category:</Form.Label>
                <Form.Select
                  className="forminput"
                  value={selectedOption}
                  onChange={optionChangeHandler}
                >
                  <option value="">--Select Category--</option>
                  <option>Food</option>
                  <option>Cloths</option>
                  <option>Fuel</option>
                  <option>Electricity</option>
                  <option>Groceries</option>
                </Form.Select>
              </Form.Group>
              <div style={{ textAlign: "center", paddingBottom: "0.5rem" }}>
                <Button type="submit" variant="outline-dark">
                  Add
                </Button>
              </div>
            </Form>
          ) : (
            <div style={{ textAlign: "center", paddingTop: "1rem" }}>
              <Button onClick={toggleForm} variant="outline-dark">
                Add Expenses
              </Button>
            </div>
          )}
        </Card>

        {expenses.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h3>Your Expenses</h3>
            {expenses.map((expense, index) => (
              <Card
                key={index}
                className="card"
                style={{ marginBottom: "1rem" }}
              >
                <Card.Body>
                  <p>
                    <strong>Amount:</strong> ₹{expense.amountSpent}
                  </p>
                  <p>
                    <strong>Description:</strong> {expense.description}
                  </p>
                  <p>
                    <strong>Category:</strong> {expense.category}
                  </p>
                  <Button
                    variant="outline-dark"
                    onClick={() => deleteHandler(expense.id)}
                  >
                    Delete
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {leaderboardValues.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Leaderboard</h4>
            {leaderboardValues.map((entry, index) => (
              <Card
                key={index}
                className="card"
                style={{ marginBottom: "0.5rem" }}
              >
                <Card.Body>
                  <p>
                    <strong>Name:</strong> {entry.User?.Name}
                  </p>
                  <p>
                    <strong>Total Spent:</strong> ₹{entry.totalSpent}
                  </p>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpenses;
