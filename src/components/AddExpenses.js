import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import "./signup.css";

const AddExpenses = () => {
  const [enteredAmount, setEnteredAmount] = useState("");
  const [enteredDescription, setEnteredDescription] = useState("");
  const [selectedOption, SetSelectedOption] = useState("");
  const [showForm, setShowForm] = useState("");
  const [expenses, setExpenses] = useState([]);

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
        },
      });
      const data = await response.json();
      console.log(data);
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

  return (
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
          <h4 style={{ textAlign: "center" }}>Your Expenses</h4>
          {expenses.map((expense, index) => (
            <Card key={index} className="card" style={{ marginBottom: "1rem" }}>
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
    </div>
  );
};

export default AddExpenses;
