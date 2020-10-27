const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: uuidValidate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function checkIsValidId(request, response, next) {
  const { id } = request.params;



  if ( !uuidValidate(id) ) {
    return response.status(400).json({ error: "This ID is invalid!"});
  }

  return next();
}

function checkExistProject(request, response, next) {
  const { id } = request.params;

  let repository = repositories.find(repository => repository.id === id);

  if ( !repository ) {
    return response.status(404).json({ error: "Repository not found!"});
  }

  request.repository = repository;
  return next(); 
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { url, title, techs } = request.body;

  let repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", checkIsValidId, checkExistProject, (request, response) => {
  const { title, url, techs } = request.body;

  let repository = request.repository;

  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  repositories.map(repo => repo.id === repository.id).push(repository);

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", checkIsValidId, checkExistProject, (request, response) => {
  const repository = request.repository;

  repositories.map((repo, index) => {
    if (repo.id === repository.id) {
      return repositories.splice(index, 1);
    }
  });

  return response.status(204).send();
});

app.post("/repositories/:id/like", checkIsValidId, checkExistProject, (request, response) => {
  let repository = request.repository;

  repository.likes = ++repository.likes;

  repositories.map(repo => repo.id === repository.id).push(repository);

  return response.status(200).json(repository);
  
});

module.exports = app;
