const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const useFixture = name => process.chdir(path.join(__dirname, 'fixtures', name));

['custom', 'npm'].forEach((registry) => {
  describe(`with ${registry} registry and no issues`, () => {
    beforeEach(() => {
      useFixture(`${registry}-registry-pass`);
    });

    it('passes', async () => {
      await expect(exec('node ../../../index.js'))
        .resolves.toEqual(expect.any(Object));
    });
  });

  describe(`with ${registry} registry and issues`, () => {
    beforeEach(() => {
      useFixture(`${registry}-registry-fail`);
    });

    it('fails', async () => {
      await expect(exec('node ../../../index.js'))
        .rejects.toEqual(expect.any(Object));
    });
  });
});
