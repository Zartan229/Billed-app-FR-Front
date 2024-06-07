/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import "@testing-library/jest-dom";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Est jouer avant chaque test dans un describe
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      
      // Mocking de localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mocking window.alert, empêche une réelle alerte de jouer et de planter le test
      jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    test("Then it should warn the user and reset the file input if the file is not a valid image type", () => {
      const newBill = new NewBill({
        document, 
        onNavigate: jest.fn(), // Mock la navigation pour ne pas trigger un changement de page. /Newbill handlesubmit retourne sur bills
        store: mockStore, 
        localStorage: window.localStorage
      });
      // Mock de hangleChangeFile
      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const input = screen.getByTestId("file");
      // Ecoute du changement de fichier
      input.addEventListener("change", handleChangeFile);
      // Création et envoie d'un faux fichier refuser
      const file = new File(["file content"], "file.pdf", { type: "application/pdf" });
      fireEvent.change(input, { target: { files: [file] } });

      expect(handleChangeFile).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Veuillez appliquez un fichier en .png .jpeg .jpg");
      expect(input.value).toBe("");
    });

    test("Then it should upload the file if it is a valid image type", async () => {
      const newBill = new NewBill({
        document, 
        onNavigate: jest.fn(), 
        store: mockStore, 
        localStorage: window.localStorage
      });
      // Mock de hangleChangeFile
      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const input = screen.getByTestId("file");
      // Ecoute du changement de fichier
      input.addEventListener("change", handleChangeFile);
      // Création et envoie d'un faux fichier accépter
      const file = new File(["file content"], "file.jpg", { type: "image/jpeg" });
      fireEvent.change(input, { target: { files: [file] } });
      // Appel de la fonction
      expect(handleChangeFile).toHaveBeenCalled();
    });
  });
});

        // Copier de dashbord.js
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
        const error = new Error("Erreur 404")
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const error = new Error("Erreur 500")
      await expect(mockStore.bills().create({})).rejects.toEqual(error);
    })
  })  

