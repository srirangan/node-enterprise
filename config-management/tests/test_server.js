const fetch = require('node-fetch');
const assert = require('assert');
const config_management = require('../lib');
const server = require('../server/server');

let body;
const failed = message => {
    console.error('Failed:', message);
    console.error(body);
    process.exit(1);
};

const reset_timeout = () => {
    if (reset_timeout.timer) clearTimeout(reset_timeout.timer);
    reset_timeout.timer = setTimeout(() => process.exit(0), 500);
};

config_management.initialize('/tmp/config_management_test_server.json', {});
const instance = server(config_management);

instance.listen(3000, () => {

    reset_timeout();

    // should initialize
    fetch('http://localhost:3000')
        .then(res => res.text())
        .then(res => body = res)
        .then(() => assert(body === '{}'))
        .then(() => reset_timeout())
        .catch(() => failed('should initialize'));

    // should add hello world
    fetch('http://localhost:3000/hello', { method: 'post', body: 'world' })
        .then(res => res.json())
        .then(res => body = res)
        .then(() => assert(body))
        .then(() => reset_timeout())
        .catch(() => failed('should add hello world'));

    // should read hello world
    fetch('http://localhost:3000/hello')
        .then(res => res.json())
        .then(res => body = res)
        .then(() => assert(body === 'world'))
        .then(() => reset_timeout())
        .catch(() => failed('should read hello world'));

    // should update foo bar
    fetch('http://localhost:3000/foo', { method: 'put', body: 'bar' })
        .then(res => res.json())
        .then(res => body = res)
        .then(() => assert(body))
        .then(() => reset_timeout())
        .catch(() => failed('should update foo bar'));

    // should read hello world and foo bar
    fetch('http://localhost:3000')
        .then(res => res.text())
        .then(res => body = res)
        .then(() => assert(body === '{"hello":"world","foo":"bar"}'))
        .then(() => reset_timeout())
        .catch(() => failed('should read hello world and foo bar'));

    // should remove foo bar
    fetch('http://localhost:3000/foo', { method: 'delete' })
        .then(res => res.json())
        .then(res => body = res)
        .then(() => assert(body))
        .then(() => reset_timeout())
        .catch(() => failed('should remove foo bar'));

    // foo bar must be removed
    fetch('http://localhost:3000')
        .then(res => res.text())
        .then(res => body = res)
        .then(() => assert(body === '{"hello":"world","foo":null}'))
        .then(() => reset_timeout())
        .catch(() => failed('foo bar must be removed'));
});
