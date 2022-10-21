import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
const customers:Array<ICustomer> = [];

interface IOperation {
  description: string; 
  amount: number;
  created_at: string;
  type: string;
}

interface ICustomer {
  name: string;
  email: string;
  id: string;
  statement: Array<IOperation>
};

// Middleware
function verifyIfExistAccount(request: Request, response: Response, next: NextFunction){
  const { customerid } = request.headers;
  const customer = customers.find(customer => customer.id == customerid);

  if(!customer){
    return response.status(400).json({ error: "Customer not found" });
  }

  // @ts-ignore
  request.customer = customer;

  return next();
}

function getBalance(statement: Array<IOperation>) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post("/account", (request, response) => {
  const { email, name } = request.body;

  const customerAlreadyExists = customers.some((customer) => customer.email === email);

  if(customerAlreadyExists){
    response.status(400).json({ error: "Customer already exists!" });
  }
  
  const customer = {
    email,
    name,
    id: uuidv4(),
    statement: []
  };

  customers.push(customer);

  response.status(201).json(customer);
});

app.get("/statement", verifyIfExistAccount, (request, response) => {
  // @ts-ignore
  const { customer } = request;

  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistAccount, (request, response) => {
  // @ts-ignore
  const { customer } = request;
  const { description, amount } = request.body;

  const statementOperation = {
    description, 
    amount,
    created_at: new Date(),
    type: "credit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistAccount, (request, response) => {
  // @ts-ignore
  const { customer } = request;
  const { description, amount } = request.body;

  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return response.status(400).json({error: "Insufficient funds!"})
  }

  const statementOperation = {
    description, 
    amount,
    created_at: new Date(),
    type: "debit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.listen(3333);
