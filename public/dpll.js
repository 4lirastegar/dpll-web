document.getElementById('dpll-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const formula = document.getElementById('formula').value;
  const [clauses, literalsMap] = parseFormula(formula);
  const assignment = {};
  const result = isSatisfiable(clauses, literalsMap, 0, assignment);
  document.getElementById('result').textContent = `Satisfiable: ${result}\nAssignment: ${JSON.stringify(assignment, null, 2)}`;
});

function parseFormula(formula) {
  let literals = {};
  let literalId = 1;
  let clauses = [];

  function getLiteralId(literal) {
      if (!(literal in literals)) {
          literals[literal] = literalId;
          literalId += 1;
      }
      return literals[literal];
  }

  formula.split(')(').forEach(clause => {
      clause = clause.replace('(', '').replace(')', '');
      if (clause === '') {
          clauses.push(new Set());  // Add an empty clause
          return;
      }
      let literalsInClause = new Set();
      clause.split('|').forEach(literal => {
          if (literal.startsWith('!')) {
              literalsInClause.add(-getLiteralId(literal.slice(1)));
          } else {
              literalsInClause.add(getLiteralId(literal));
          }
      });
      clauses.push(literalsInClause);
  });

  return [clauses, Object.fromEntries(Object.entries(literals).map(([k, v]) => [v, k]))];
}

function convertClauseToLiterals(clause, literalsMap) {
  return new Set([...clause].map(lit => lit > 0 ? literalsMap[lit] : `!${literalsMap[-lit]}`));
}

function printClauses(clauses, literalsMap, message) {
  console.log(`${message} : `, clauses.map(clause => [...convertClauseToLiterals(clause, literalsMap)]));
}

function unitLiteral(clauses, literalsMap, step, assignment) {
  let unitClauses = clauses.filter(c => c.size === 1);
  printClauses(unitClauses, literalsMap, "Unit Clauses");

  while (unitClauses.length) {
      step += 1;
      let unitClause = unitClauses[0];
      let literal = [...unitClause][0];
      console.log("STEP= ", step);
      if (literal > 0) {
          console.log(`The Unit Clause Chosen: (${literalsMap[literal]})`);
          assignment[literalsMap[literal]] = true;
      } else {
          console.log(`The Unit Clause Chosen: (!${literalsMap[-literal]})`);
          assignment[literalsMap[-literal]] = false;
      }
      let newClauses = [];
      clauses.forEach(clause => {
          if (clause.has(literal)) return;
          let newClause = new Set([...clause].filter(l => l !== -literal));
          newClauses.push(newClause);
      });
      clauses = newClauses;
      printClauses(clauses, literalsMap, "New Clauses");
      unitClauses = clauses.filter(c => c.size === 1);
  }

  console.log("No Unit Clauses Left");
  return [clauses, step];
}

function pureLiteral(clauses, literalsMap, step, assignment) {
  console.log("*********************************");
  console.log("Pure Literal Elimination");
  printClauses(clauses, literalsMap, "Clauses");
  while (true) {
      console.log(`STEP= ${step + 1}`);
      let literals = new Set();
      clauses.forEach(clause => literals = new Set([...literals, ...clause]));

      let pureLiterals = new Set();
      literals.forEach(literal => {
          if (!literals.has(-literal)) {
              pureLiterals.add(literal);
          }
      });

      if (!pureLiterals.size) break;

      let pureLiteralsAlpha = new Set([...pureLiterals].map(literal => literal > 0 ? literalsMap[literal] : `!${literalsMap[-literal]}`));
      console.log(`Pure Literals: ${[...pureLiteralsAlpha]}`);
      pureLiterals.forEach(literal => {
          if (literal > 0) {
              assignment[literalsMap[literal]] = true;
          } else {
              assignment[literalsMap[-literal]] = false;
          }
      });

      step += 1;

      let newClauses = [];
      clauses.forEach(clause => {
          if (![...clause].some(lit => pureLiterals.has(lit))) {
              newClauses.push(clause);
          }
      });

      clauses = newClauses;
      printClauses(clauses, literalsMap, "New Clauses");
  }

  return [clauses, step];
}

function chooseLiteral(clauses) {
  for (let clause of clauses) {
      for (let literal of clause) {
          return literal;
      }
  }
  return null;
}

function isSatisfiable(clauses, literalsMap, step, assignment) {
  console.log(`STEP ${step} - `);
  printClauses(clauses, literalsMap, "Formula");

  if (!clauses.length) {
      console.log("Final Assignment: ", assignment);
      return true;
  }
  if (clauses.some(clause => !clause.size)) {
      console.log("Final Assignment: ", assignment);
      return false;
  }

  let oldClauses = clauses.slice();
  [clauses, step] = unitLiteral(clauses, literalsMap, step, assignment);
  [clauses, step] = pureLiteral(clauses, literalsMap, step, assignment);
  console.log("*********************************");

  if (JSON.stringify(clauses) === JSON.stringify(oldClauses)) {
      let literal = chooseLiteral(clauses);
      if (literal === null) {
          return false;
      }

      console.log(`Branching on literal: ${literalsMap[Math.abs(literal)]}`);

      // Branch where literal is True
      console.log(`Trying ${literalsMap[Math.abs(literal)]} = True`);
      let newClausesTrue = [];
      clauses.forEach(clause => {
          if (clause.has(literal)) return;
          let newClause = new Set([...clause].filter(l => l !== -literal));
          newClausesTrue.push(newClause);
      });
      let assignmentTrue = { ...assignment };
      if (literal > 0) {
          assignmentTrue[literalsMap[literal]] = true;
      } else {
          assignmentTrue[literalsMap[-literal]] = false;
      }
      if (isSatisfiable(newClausesTrue, literalsMap, step + 1, assignmentTrue)) {
          return true;
      }

      // Branch where literal is False
      console.log(`Trying ${literalsMap[Math.abs(literal)]} = False`);
      let newClausesFalse = [];
      clauses.forEach(clause => {
          if (clause.has(-literal)) return;
          let newClause = new Set([...clause].filter(l => l !== literal));
          newClausesFalse.push(newClause);
      });
      let assignmentFalse = { ...assignment };
      if (literal > 0) {
          assignmentFalse[literalsMap[literal]] = false;
      } else {
          assignmentFalse[literalsMap[-literal]] = true;
      }
      return isSatisfiable(newClausesFalse, literalsMap, step + 1, assignmentFalse);
  }

  return isSatisfiable(clauses, literalsMap, step + 1, assignment);
}
