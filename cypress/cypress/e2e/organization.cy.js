/// <reference types="Cypress" />

import { login } from "../page_objects/login";
import { createOrganization } from "../page_objects/createOrganization";
import { edit } from "../page_objects/edit";
import { profile } from "../page_objects/profile";
const faker = require("faker");

describe("Login test", () => {
  let loginData = {
    email: "urosletic03@gmail.com",
    password: "9214AZrQc",
    newPassword: "9214AZrQc2",
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  };
  let organizationData = {
    name: faker.name.firstName(),
    newName: faker.name.firstName(),
    projectName: faker.name.lastName(),
  };

  let token;
  let day = 0;
  let orgId;
  let boardType = 0;
  let number = 2;
  let number1 = 2;
  let number2 = 3;
  let number3 = 4;

  beforeEach("visit login page", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");
  });

  it("valid login", () => {
    cy.intercept({
      method: "POST",
      url: "https://cypress-api.vivifyscrum-stage.com/api/v2/login",
    }).as("login");
    login.login(loginData.email, loginData.password);
    cy.wait("@login").then((interception) => {
      cy.url().should("not.include", "/login");
      expect(interception.response.statusCode).eq(200);
      token = interception.response.body.token;
      expect(interception.response.body.token).to.exist;
      expect(interception.response.body.user.id).to.exist;
    });
  });

  it.only("create organization without image", () => {
    cy.intercept({
      method: "POST",
      url: "https://cypress-api.vivifyscrum-stage.com/api/v2/organizations",
    }).as("create");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit("/my-organizations");
    createOrganization.create(organizationData.name);
    cy.wait("@create").then((interception) => {
      orgId = interception.response.body.id;
      expect(interception.response.body.status).eq("active");
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.id).to.exist;
      expect(interception.response.body.name).to.eq(organizationData.name);
      console.log(interception.response.body);
      cy.url().should("include", "/boards");
    });
  });

  it.only("archive organization", () => {
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/status`,
    }).as("archive");

    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/settings`
    );

    edit.archive();
    cy.wait("@archive").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.status).eq("archived");
    });
  });

  it("add project", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/projects`,
    }).as("addProject");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/projects`
    );
    cy.wait(3000);

    edit.addProject(organizationData.projectName);
    cy.wait(3000);
    cy.wait("@addProject").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.name).eq(organizationData.projectName);
    });
  });

  it("add board", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/boards`,
    }).as("addBoard");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);

    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/boards`
    );
    edit.addBoard(boardType, organizationData.projectName);
    cy.wait(3000);
    cy.wait("@addBoard").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.name).eq(organizationData.projectName);
    });
  });

  it("edit organization", () => {
    cy.intercept({
      method: "GET",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/vacation-days`,
    }).as("editPage");

    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/settings`
    );
    // promena imena organizacije
    cy.wait("@editPage").then((interception) => {
      expect(interception.response.statusCode).eq(200);
    });
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}`,
    }).as("editName");

    edit.editName(organizationData.newName);

    cy.wait("@editName").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.name).eq(organizationData.newName);
    });

    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/workdays`,
    }).as("editWorkdays");

    edit.markCheckbox(number);
    cy.wait("@editWorkdays").then((interception) => {
      expect(interception.response.statusCode).eq(200);
    });
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/vacation-days`,
    }).as("editVacDays");

    edit.vacationDays(number1, number2, number3);
    cy.wait("@editVacDays").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.days_per_year).eq(number1);
      expect(interception.response.body.additional_months_for_days).eq(number2);
      expect(interception.response.body.additional_days).eq(number3);
    });
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}`,
    }).as("deleteOrg");
    edit.delete();
    cy.wait("@deleteOrg").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      cy.url().should("not.include", `organizations/${orgId}/settings`);
    });
  });

  it("delete archive org", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}`,
    }).as("deleteArchivedOrg");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/boards`
    );
    edit.archiveDelete();
    cy.wait("@deleteArchivedOrg").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      cy.url().should("not.include", `organizations/${orgId}/boards`);
    });
  });
  it("reopen org", () => {
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/status`,
    }).as("reopenOrg");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/boards`
    );
    edit.reopenOrg();
    cy.wait("@reopenOrg").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.status).eq("active");
    });
  });

  it("logout", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/logout`,
    }).as("logout");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(`https://cypress.vivifyscrum-stage.com/account/settings`);
    cy.wait(2000);
    profile.logout();
    cy.wait("@logout").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.message).eq("Successfully logged out");
    });
  });

  it("account name Edit", () => {
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/users`,
    }).as("nameEdit");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(`https://cypress.vivifyscrum-stage.com/my-organizations`);
    cy.wait(2000);
    profile.nameUpdate(loginData.firstName, loginData.lastName);
    cy.wait("@nameEdit").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.first_name).eq(loginData.firstName);
      expect(interception.response.body.last_name).eq(loginData.lastName);
    });
  });

  it("email Edit", () => {
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/users`,
    }).as("emailEdit");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(`https://cypress.vivifyscrum-stage.com/my-organizations`);
    cy.wait(2000);
    profile.emailUpdate(loginData.email, loginData.password);
    cy.wait("@emailEdit").then((interception) => {
      expect(interception.response.statusCode).eq(400);
    });
  });

  it("password Edit", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/update-password`,
    }).as("passEdit2");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(`https://cypress.vivifyscrum-stage.com/my-organizations`);
    cy.wait(2000);
    profile.passwordUpdate(
      loginData.password,
      loginData.newPassword,
      loginData.newPassword
    );
    cy.wait("@passEdit2").then((interception) => {
      expect(interception.response.statusCode).eq(200);
    });
  });

  it("password Revert", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/update-password`,
    }).as("passEdit2");
    login.login(loginData.email, loginData.newPassword);
    cy.wait(3000);
    cy.visit(`https://cypress.vivifyscrum-stage.com/my-organizations`);
    cy.wait(2000);
    profile.passwordUpdate(
      loginData.newPassword,
      loginData.password,
      loginData.password
    );
    cy.wait("@passEdit2").then((interception) => {
      expect(interception.response.statusCode).eq(200);
    });
  });

  it("calendar day change", () => {
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/calendar-starting-day`,
    }).as("calendarDay");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/settings`
    );
    cy.wait(2000);
    edit.changeCalendarStartDay();
    cy.wait("@calendarDay").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.calendar_starting_day).eq(1);
    });
  });

  it("change theme", () => {
    cy.intercept({
      method: "PUT",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/user-theme`,
    }).as("theme");

    login.login(loginData.email, loginData.password);
    cy.wait(3000);

    profile.changeTheme();

    cy.wait("@theme").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.theme).eq("dark");
    });
  });
});
