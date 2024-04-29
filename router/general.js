const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already taken" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const simplifiedBooks = Object.keys(books).map(key => ({
    author: books[key].author,
    title: books[key].title,
    reviews: books[key].reviews,
  }));
  res.status(200).json(simplifiedBooks);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn, 10);
  const book = books[isbn];
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const foundBooks = Object.values(books).filter(book => book.author === author);
  if (foundBooks.length > 0) {
    res.status(200).json({ booksbyauthor: foundBooks});
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const foundBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
  if (foundBooks.length > 0) {
    res.status(200).json({ booksbytitle: foundBooks });
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn, 10);
  const book = books[isbn];
  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ message: "No reviews available for this book" });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
