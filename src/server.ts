import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
const customers:Array<ICustomer> = [];

interface ICustomer {
  name: string;
  email: string;
  id: string;
  statement: Array<any>
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

  return response.json(customer?.statement);
});

app.listen(3333);
