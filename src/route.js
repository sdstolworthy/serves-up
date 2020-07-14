const express = require("express");
import { checkIfFileExists, getTruePath, loadFile } from "./files";
export function createRoute(route) {
  const router = express.Router();
  const requestHandler = createRequestHandler(route);
  if (route && route.methods && !Array.isArray(route.methods)) {
    throw Error(
      "A route's methods must be a list of HTTP methods or undefined"
    );
  }
  if (!route.methods.length) {
    router.all("/", requestHandler);
  }
  for (let method of route.methods) {
    if (typeof method !== "string") {
      throw Error(`invalid method specified: ${JSON.stringify(method)}`);
    }
    let cleanedMethod = method.toLowerCase().trim();
    if (validateHttpMethod(cleanedMethod)) {
      router[cleanedMethod]("/", requestHandler);
    }
  }
  return router;
}

function loadFixture(fixturePath) {
  try {
    const truePath = getTruePath(fixturePath);
    if (checkIfFileExists(truePath)) {
      const fixtureBuffer = loadFile(truePath);
      try {
        return JSON.parse(fixtureBuffer);
      } catch (e) {
        throw Error("Fixture could not be parsed to JSON");
      }
    } else {
      throw Error(`Fixture does not exist at path ${fixturePath}`);
    }
  } catch (e) {
    throw Error(`There was an error while loading a fixture: ${fixturePath}`);
  }
}

function createRequestHandler(route) {
  return (request, response) => {
    if ("fixture" in route) {
      const fixtureJson = loadFixture(route.fixture);
      response.json(fixtureJson);
    } else {
      response.json({ fixture: "false" });
    }
  };
}

function validateHttpMethod(method) {
  const VALID_METHODS = [
    "head",
    "get",
    "options",
    "post",
    "put",
    "patch",
    "delete",
  ];

  return VALID_METHODS.includes(method);
}
