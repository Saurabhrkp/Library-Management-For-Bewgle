# Library-Management-For-Bewgle

Question Statement

Library Management
Stories
1. User can view books in library
Scenario: As a user, I want to see the books present in the library so that I can chose which book to borrow.

Given, there are no books in the library

When, I view the books in the library

Then, I see an empty library


Given, there are books in the library

When, I view the books in the library

Then, I see the list of books in the library

2. User can borrow a book from the library

Given, there are books in the library

When, I choose a book to add to my borrowed list

Then, the book is added to my borrowed list

And, the book is removed from the library

Note:
Each User has a borrowing limit of 2 books at any point of time

---

## Getting Started

Install Node.js form [Official Site](https://nodejs.org/en/download/).

Install [MongoDB](https://www.mongodb.com/) locally or Set [Atlas online](https://www.mongodb.com/cloud/atlas/signup). And put Database URI and Bucket name in `.env` file as example given in .`sample.env`

Git clone or Download the Zip and unzip it.

### Prerequisites

Install Dependencies by running

```bash
npm install
```

## Running the programs

Navigate to folder of program

```bash
cd folder/

npm run start
```
---

## Model-View-Controller(MVC) architecture

I have use Model-View-Controller architecture for the above. Here I have model of users and books. Views folder has all view pages using EJS templating engine. Every routes in app has Controller for handling it logics.

---
