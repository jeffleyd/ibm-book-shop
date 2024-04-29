const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" }
];

const SECRET_KEY = "XPTO1234";

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

const generateToken = (username) => {
  return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const token = generateToken(username);
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  const bookId = parseInt(isbn, 10);
  const book = books[bookId];

  if (book) {
    book.reviews = book.reviews || {};
    book.reviews[req.user.username] = review;

    res.status(200).json({ message: "The review for the book with ISBN " + isbn + " has been add/updated" });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const { isbn } = req.params;

  const bookId = parseInt(isbn, 10);
  const book = books[bookId];

  if (book) {
    delete book.reviews[req.user.username];
    res.status(200).json({ message: "The review for the ISBN " + isbn + " posted by the user " + req.user.username + " deleted."});
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.secretKey = SECRET_KEY;
