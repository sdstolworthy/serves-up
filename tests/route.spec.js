import express from 'express';
import { addRouteToApp } from '../src/route';
import { expect } from 'chai';
describe('Route tests:', function() {
  it('should throw an error when adding a route to the server that does not have a path', function() {
    expect(() => addRouteToApp(express(), {})).to.throw(
      '`path` is a required key in every route'
    );
  });
  it('should throw an error if the route methods is not undefined or an array', function() {
    expect(() =>
      addRouteToApp(express(), { methods: 'asdf', path: '/' })
    ).to.throw('A route\'s methods must be a list of HTTP methods or undefined');
  });
  it('should throw an error if one of the methods in the methods array is not a string', function() {
    expect(() =>
      addRouteToApp(express(), { methods: [0], path: '/' })
    ).to.throw('invalid method specified: 0');
  });
  it('should throw an error if one of the methods in the methods array is not a valid HTTP verb', function() {
    expect(() =>
      addRouteToApp(express(), { methods: ['asdf'], path: '/' })
    ).to.throw('methods must be valid HTTP verbs');
  });
  it('should throw an error if a route statusCode is not a number', function() {
    expect(() =>
      addRouteToApp(express(), { path: '/', statusCode: 'asdf' })
    ).to.throw('Status code must be a number, not asdf');
  });
});
