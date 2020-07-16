
import chai from 'chai';
import { runServer, close } from '../src/server';
import chaihttp from 'chai-http';
import fs from 'fs';
import chaiSpies from 'chai-spies';
const { expect } = chai;
chai.use(chaiSpies);
chai.use(chaihttp);
describe('RunServer tests', function () {
  before(function () {
    fs.writeFileSync(
      './tests/test_schema.json',
      JSON.stringify({
        port: 3000,
        routes: [
          {
            path: '/app',
            statusCode: 401,
            fixture: './test_fixture.json',
            methods: ['get', 'post'],
          },
          {
            path: '/app',
            statusCode: 200,
            fixture: { john: 'doe' },
            methods: ['delete', 'head'],
          },
          {
            path: '*',
            statusCode: 301,
            headers: {
              'X-My-Custom-Header': 'custom header',
            },
          },
        ],
      })
    );
    fs.writeFileSync(
      './tests/test_fixture.json',
      JSON.stringify({
        example: 'response',
      })
    );
  });
  after(function () {
    fs.unlinkSync('./tests/test_schema.json');
    fs.unlinkSync('./tests/test_fixture.json');
  });
  afterEach(function () {
    close();
  });
  it('should run a server if a valid definition has been specified', function (done) {
    chai
      .request(runServer({ routePath: '/' }))
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('should load the correct fixture path', function (done) {
    expect(() =>
      chai
        .request(runServer({ inputFile: './tests/test_schema.json' }))
        .get('/')
        .end()
    ).to.not.throw();
    done();
  });
  it('should call a request interceptor plugin', function (done) {
    const requestInterceptor = chai.spy((_, __, next) => next());
    chai
      .request(runServer({
        routePath: '/', plugins: [{
          requestInterceptor
        }]
      }))
      .get('/')
      .end(() => {

        expect(requestInterceptor).to.have.been.called();
      });
    done();
  });
});
