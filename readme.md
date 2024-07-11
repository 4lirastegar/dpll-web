# DPLL SAT Solver Web Application

This project implements the DPLL (Davis-Putnam-Logemann-Loveland) algorithm in Node.js to solve the Boolean satisfiability problem (SAT). The DPLL algorithm is a backtracking-based search algorithm for deciding the satisfiability of propositional logic formulas in conjunctive normal form (CNF). The project provides a web interface for users to input CNF formulas and get the satisfiability result.

## Features

- Parses CNF formulas from a string input.
- Implements unit propagation and pure literal elimination.
- Performs recursive backtracking with branching and backtracking.
- Provides a web interface for inputting formulas and displaying results.

## Files

- `public/index.html`: The main HTML file for the web interface.
- `public/styles.css`: The CSS file for styling the web interface.
- `public/dpll.js`: The JavaScript file implementing the DPLL algorithm.
- `server.js`: The Express server file for serving the web application.

## Usage

1. **Clone the repository:**

   ```sh
   git clone https://github.com/4lirastegar/dpll-web.git
   cd dpll-web

   ```

2. **Install dependencies:**

   ```sh
   npm install

   ```

3. **Run the server:**

   ```sh
   node server.js

   ```

4. **Open the web application:**

Open your web browser and navigate to http://localhost:3000. You should see the interface where you can input a CNF formula and get the output from the DPLL algorithm.
