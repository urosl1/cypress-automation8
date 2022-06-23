// import { createGallery } from "../page_objects/createGallery";
import { loginPage } from "../page_objects/loginPage";
import { editOrgPage } from "../page_objects/editOrgPage";

import "cypress-file-upload";

describe("login", () => {
  let validEmail = "urosletic03@gmail.com";
  let validPassword = "9214AZrQc";
  const fixtureName = "image";
  let avatar_crop_cords = {
    x: 135.44262295081967,
    y: 40.409836065573764,
    x2: 305.44262295081967,
    y2: 210.40983606557376,
    w: 169.99999999999997,
    h: 169.99999999999997,
  };
  let orgId;
  let name2 = "random";
  // let title = "naslov";
  // let description = "opis";
  // let images = "https://static.remove.bg/remove-bg-web/eb1bb48845c5007c3ec8d72ce7972fc8b76733b1/assets/start-1abfb4fe2980eabfbbaaa4365a0692539f7cd2725f324f904565a9a744f8e214.jpg";

  // before("visit login page", () => {
  //     // cy.loginViaBackend();
  //     cy.visit("/login");
  // });

  xit("valid login using POM", () => {
    cy.intercept({
      method: "POST",
      url: "https://cypress-api.vivifyscrum-stage.com/api/v2/login",
    }).as("validLogin");

    cy.visit("https://cypress.vivifyscrum-stage.com/login");
    loginPage.login(validEmail, validPassword);
    cy.wait(3000);
    cy.wait("@validLogin").then((interception) => {
      expect(interception.response.statusCode).to.exist;
      expect(interception.response.statusCode).eq(200);
    });

    cy.url().should("not.include", "/login");

    // cy.loginViaBackend();
    // cy.visit("/create");
  });

  beforeEach("visit login page", () => {
    cy.visit("https://cypress.vivifyscrum-stage.com/login");
    loginPage.login(validEmail, validPassword);
    cy.wait(3000);
  });
  it("Create organization", () => {
    cy.intercept("POST", "/api/v2/organizations").as("validOrgCreate");

    cy.visit("https://cypress.vivifyscrum-stage.com/my-organizations");
    loginPage.createOrg(name2);
    cy.wait(3000);

    cy.wait("@validOrgCreate").then((interception) => {
      orgId = interception.response.body.id;
      console.log(orgId);
      expect(interception.response.statusCode).to.exist;
      expect(interception.response.statusCode).eq(201);
    });
    // cy.loginViaBackend();
    // cy.visit("/create");
  });

  it("Organization edit", () => {
    cy.intercept(
      "GET",
      `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}/vacation-days`
    ).as("visitOrg");

    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/settings`
    );

    cy.wait("@visitOrg").then((interception) => {
      expect(interception.response.statusCode).to.exist;
      expect(interception.response.statusCode).eq(200);
    });
    // https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/18366
    cy.intercept(
      `PUT', 'https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}`
    ).as("editOrg");

    editOrgPage.nameChange(name2);
    cy.wait("@editOrg").then((interception) => {
      cy.visit(
        `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/settings`
      );
      expect(interception.response.statusCode).to.exist;
      expect(interception.response.statusCode).eq(200);
    });

    xit("Archive Org", () => {
      cy.intercept("PUT", `/api/v2/organizations/${orgId}/status`).as(
        "orgArch"
      );
      // , {
      //     body: {
      //         name: "S",
      //         avatar_crop_cords: { "x": 135.44262295081967, "y": 40.409836065573764, "x2": 305.44262295081967, "y2": 210.40983606557376, "w": 169.99999999999997, "h": 169.99999999999997 }
      //         // , url: "../fixtures/image.jpg"
      //     },
      // }

      cy.get(".vs-c-icon--archive")
        .first()
        .invoke("show")
        .click({ force: true });
      cy.get(".vs-u-text--right > button").last().click();
      cy.wait("@orgArch").then((interception) => {
        expect(interception.response.statusCode).eq(200);
      });
      // cy.loginViaBackend();
      // cy.visit("/create");
    });

    // xit("logout", () => {
    //     cy.intercept({
    //         method: "POST",
    //         url: "https://gallery-api.vivifyideas.com/api/auth/logout",
    //     }).as("logout");

    //     loginPage.logoutBtn.click();
    //     cy.wait("@logout").then((interception) => {
    //         expect(interception.response.statusCode).eq(200);
    //     });
    // });

    // it("Create Gallery", () => {
    //     cy.visit('/login');
    //     loginPage.login(validEmail, validPassword);
    //     cy.wait(3000);

    //     cy.visit('/create');
    //     cy.intercept({
    //         method: "Post",
    //         url: 'https://gallery-api.vivifyideas.com/api/galleries'
    //     }).as('createGallery')

    //     createGallery.createGall(
    //         title,
    //         description,
    //         images
    //     );

    //     cy.wait('@createGallery').then(interception => {
    //         let galleryId = interception.response.body.id
    //         cy.visit(`/galleries/$(galleryId)`)
    //         cy.visit('galleries/' + galleryId)
    //         cy.get('id').should('have.text', createGallery.title)
    //     })
  });
});
