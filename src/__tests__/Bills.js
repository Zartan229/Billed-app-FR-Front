/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

// Mock du store pour récupérer les donnée test
jest.mock("../app/store", () => mockStore)

// Test, quand je suis connecter en tant qu'employé
describe("Given I am connected as an employee", () => {
  // Test sur la page bills
  describe("When I am on Bills Page", () => {


    // Test sur la surbrillance d'une icône
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      // Quand on navigue vers bills (après la page login par exemple)
      window.onNavigate(ROUTES_PATH.Bills);
      // On attend que icon-window soit disponible
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // Puis on teste si icon-window est bien en surbrillance après l'avoir attribuer a une variable
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then I can open the eye to see the data", async () => {

      // On configure l'interface BillsUi avec les donnée test de bills
      document.body.innerHTML = BillsUI({ data: bills });
      // Permet de naviguer vers d'autre page ? Pas sûr que ce soit obligatoire pour un overlay
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // On instancie Bills
      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      // Mock de la fonction modal de jQuery et espionnage de la méthode handleClickIconEye
      // le spyOn plante si on ajoute pas $.fn.modal = jest.fn(); il faut mock la modale sinon sa marche pas
      // Lorsque vous utilisez jest.fn(), Jest crée une fonction simulée qui enregistre automatiquement
      // toutes les informations sur ses appels (combien de fois elle a été appelée, avec quels 
      // arguments, etc.).
      $.fn.modal = jest.fn();
      const handleClickIconEyeSpy = jest.spyOn(billsInstance, "handleClickIconEye");
      // On attend que le ou les oeils soit dispo dans le DOM.
      // On les attribue a iconEyes
      await waitFor(() => expect(screen.getAllByTestId("icon-eye")).not.toHaveLength(0));
      const iconEyes = screen.getAllByTestId("icon-eye");
      // On clique sur chaque Oeil et on vérifie bien que la méthode espion a bien été appeler
      iconEyes.forEach((iconEye) => {
        userEvent.click(iconEye);
      });
      expect(handleClickIconEyeSpy).toHaveBeenCalled();
      // Test bonus, on vérifie que la modal est appeler.
      expect($.fn.modal).toHaveBeenCalled(); // Si on utilise .not on obtient les "show" donc sa marche
    });
    
    test("Then clicking on newBill will move use to the newBill page", async () => {
      // On instancie on Navigate car on veut vérifier le changement de page.
      const onNavigate = jest.fn();

      // On crée une instance de Bills car c'est notre page de départ
      const billsInstance = new Bills({
        document: document, // Permet de manipuler la page
        onNavigate: onNavigate, // Permet de simuler la navigation
        ROUTES_PATH: ROUTES_PATH,
      });
      // On récupère le bouton pour changer de page vers NewVill
      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
      // On génère le click
      buttonNewBill.click();
      // On teste si onNavigate va correctement nous amener vers la page NewBill
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
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
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
  
      test("fetches messages from an API and fails with 500 message error", async () => {
  
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
  
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
    })
  })