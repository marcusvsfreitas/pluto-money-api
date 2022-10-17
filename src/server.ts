import express from "express";

const app = express();

app.get("/", (request, response) => {
  response.json("Olá mundo");
});

app.listen(3333);
