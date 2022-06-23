const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://cypress.vivifyscrum-stage.com",
    env: {
      VALID_USER_EMAIL: "urosletic03@gmail.com",
      VALID_USER_PASSWORD: "9214AZrQc",
    },

    // implement node event listeners here
  },
});
