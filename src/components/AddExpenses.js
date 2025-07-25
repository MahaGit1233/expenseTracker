import React, { useEffect, useState } from "react";
import { Button, Card, Form, Navbar, Table } from "react-bootstrap";
import { load } from "@cashfreepayments/cashfree-js";
import "./signup.css";

const AddExpenses = (props) => {
  const [enteredAmount, setEnteredAmount] = useState("");
  const [enteredDescription, setEnteredDescription] = useState("");
  const [selectedOption, SetSelectedOption] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [enteredDate, setEnteredDate] = useState(today);
  const [showForm, setShowForm] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [header, setHeader] = useState(false);
  const [leaderboardValues, setLeaderboardValues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    return parseInt(localStorage.getItem("itemsPerPage")) || 10;
  });

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

  const dateChangeHandler = (event) => {
    setEnteredDate(event.target.value);
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const fetchExpenses = () => {
    fetch(
      `http://localhost:4000/expenses/get?page=${currentPage}&limit=${itemsPerPage}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch expenses");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setExpenses(data.expense);
        setPaginationData(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  useEffect(() => {
    if (!token) return;

    localStorage.setItem("itemsPerPage", itemsPerPage);
    fetchExpenses();
  }, [token, currentPage, itemsPerPage]);

  const addExpenseHandler = async (event) => {
    event.preventDefault();
    toggleForm();

    const Expenses = {
      amountSpent: enteredAmount,
      description: enteredDescription,
      category: selectedOption,
      date: enteredDate,
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
      setExpenses((prev) => [...prev, data.expense]);
    }

    setEnteredAmount("");
    setEnteredDescription("");
    SetSelectedOption("");
    setEnteredDate("");
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

    if (!response.ok) {
      throw new Error("Failed to delete expense");
    }

    console.log("Expense deleted successfully");

    if (expenses.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else {
      fetchExpenses();
    }
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

  const groupByDateThenMonth = (expenses) => {
    const grouped = {};

    expenses.forEach((expense) => {
      const dateObj = new Date(expense.date);

      const dateKey = new Intl.DateTimeFormat("en-GB").format(dateObj);
      const monthKey = dateObj.toLocaleString("en-GB", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthKey]) grouped[monthKey] = {};
      if (!grouped[monthKey][dateKey]) grouped[monthKey][dateKey] = [];

      grouped[monthKey][dateKey].push(expense);
    });

    return grouped;
  };

  const groupedExpenses = groupByDateThenMonth(expenses);

  const handleDownload = () => {
    if (expenses.length === 0) return;

    const headers = ["Date", "Amount", "Description", "Category"];
    const rows = [];

    Object.entries(groupedExpenses).forEach(([month, dates]) => {
      Object.entries(dates).forEach(([date, expenseList]) => {
        expenseList.forEach((expense) => {
          rows.push([
            date,
            expense.amountSpent,
            expense.description,
            expense.category,
          ]);
        });
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            marginBottom: "0.3rem",
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
              <Form.Group>
                <Form.Label className="formlabel">Date:</Form.Label>
                <Form.Control
                  className="forminput"
                  type="date"
                  value={enteredDate}
                  onChange={dateChangeHandler}
                />
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
      </div>

      {expenses.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ marginLeft: "20%" }}>Your Expenses:</h3>
          <Table
            hover
            responsive
            className="mt-4 shadow-sm rouded"
            style={{ width: "50%", marginLeft: "25%", textAlign: "center" }}
          >
            <thead className="table-success">
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedExpenses).map(([month, dates]) => (
                <React.Fragment>
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        backgroundColor: "#93C572",
                      }}
                    >
                      {month}
                    </td>
                  </tr>
                  {Object.entries(dates).map(([date, expensebydate]) => (
                    <React.Fragment>
                      <tr>
                        <td
                          style={{
                            fontStyle: "italic",
                            color: "#555",
                            fontWeight: "700",
                            backgroundColor: "#9FE2BF",
                          }}
                        >
                          {date}
                        </td>
                      </tr>
                      {expensebydate.map((expense) => (
                        <tr>
                          <td>{date}</td>
                          <td>₹{expense.amountSpent}</td>
                          <td>{expense.description}</td>
                          <td>{expense.category}</td>
                          <td>
                            <Button
                              variant="outline-dark"
                              size="sm"
                              onClick={() => deleteHandler(expense.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {paginationData && (
        <div>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <label htmlFor="itemsPerPageSelect" style={{ marginRight: "10px" }}>
              Show
            </label>
            <select
              id="itemsPerPageSelect"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="2">2</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
            <span> expenses per page</span>
          </div>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Button
              variant="outline-dark"
              disabled={!paginationData.hasPreviousPage}
              onClick={() => setCurrentPage(paginationData.previousPage)}
            >
              Previous
            </Button>{" "}
            <span>
              Page {paginationData.currentPage} of {paginationData.lastPage}
            </span>{" "}
            <Button
              variant="outline-dark"
              disabled={!paginationData.hasNextPage}
              onClick={() => setCurrentPage(paginationData.nextPage)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {leaderboardValues.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4 style={{ marginLeft: "20%" }}>Leaderboard</h4>
          <div style={{ textAlign: "center" }}>
            <Button variant="outline-danger" onClick={handleDownload}>
              Download Expenses
            </Button>
          </div>
          <Table
            striped
            hover
            responsive
            className="mt-4 shadow-sm rouded"
            style={{ width: "50%", marginLeft: "25%", textAlign: "center" }}
          >
            <thead className="table-success">
              <tr>
                <th>Name</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            {leaderboardValues.map((entry) => (
              <tbody>
                <td>{entry.name}</td>
                <td>₹{entry.totalAmount}</td>
              </tbody>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
};

export default AddExpenses;
