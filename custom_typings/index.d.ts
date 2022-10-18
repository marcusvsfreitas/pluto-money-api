interface ICustomer {
    name: string;
    email: string;
    id: string;
    statement: Array<any>
};

declare namespace Express {
    interface Request {
        customer: ICustomer;
    }
  }