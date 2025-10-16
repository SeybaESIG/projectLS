import { annonceSchemas } from '../schemas/annonceSchemas.js';

// Données de test valides
const validAnnonce = {
  id_util: 1,
  id_ville_dep: 1,
  id_aerodep: 1,
  id_ville_arr: 2,
  id_aeroarr: 2,
  description: 'Voyage avec 2 valises de 23kg chacune',
  prix: 150.50,
  datedepart: new Date('2025-12-01T10:00:00Z'),
  datearrivee: new Date('2025-12-01T18:00:00Z'),
  titre: 'Paris - New York',
  statut: 'active',
};

describe('Annonce Schemas Validation', () => {
  describe('Create Schema', () => {
    describe('Valid data', () => {
      it('devrait valider une annonce complète', () => {
        const { error } = annonceSchemas.create.validate(validAnnonce);
        expect(error).toBeUndefined();
      });

      it('devrait accepter une description optionnelle', () => {
        const { description, ...annonceWithoutDesc } = validAnnonce;
        const { error } = annonceSchemas.create.validate(annonceWithoutDesc);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un titre optionnel', () => {
        const { titre, ...annonceWithoutTitle } = validAnnonce;
        const { error } = annonceSchemas.create.validate(annonceWithoutTitle);
        expect(error).toBeUndefined();
      });

      it('devrait utiliser "active" comme statut par défaut', () => {
        const { statut, ...annonceWithoutStatus } = validAnnonce;
        const { error, value } = annonceSchemas.create.validate(annonceWithoutStatus);
        expect(error).toBeUndefined();
        expect(value.statut).toBe('active');
      });
    });

    describe('Statut validation', () => {
      it('devrait accepter statut "active"', () => {
        const annonce = { ...validAnnonce, statut: 'active' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait accepter statut "vendue"', () => {
        const annonce = { ...validAnnonce, statut: 'vendue' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un statut invalide', () => {
        const annonce = { ...validAnnonce, statut: 'inactive' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/active|vendue/i);
      });

      it('devrait rejeter statut "completed"', () => {
        const annonce = { ...validAnnonce, statut: 'completed' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
      });

      it('devrait rejeter statut "cancelled"', () => {
        const annonce = { ...validAnnonce, statut: 'cancelled' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
      });
    });

    describe('Prix validation', () => {
      it('devrait accepter un prix positif', () => {
        const annonce = { ...validAnnonce, prix: 100.50 };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un prix avec 2 décimales', () => {
        const annonce = { ...validAnnonce, prix: 99.99 };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un prix négatif', () => {
        const annonce = { ...validAnnonce, prix: -50 };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/positif/i);
      });

      it('devrait rejeter un prix à zéro', () => {
        const annonce = { ...validAnnonce, prix: 0 };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/positif/i);
      });
    });

    describe('Description validation', () => {
      it('devrait accepter une description de 10 caractères minimum', () => {
        const annonce = { ...validAnnonce, description: 'Texte valide' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter une description trop courte', () => {
        const annonce = { ...validAnnonce, description: 'Court' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/10 caractères/i);
      });

      it('devrait rejeter une description trop longue', () => {
        const annonce = { ...validAnnonce, description: 'a'.repeat(1001) };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/1000 caractères/i);
      });

      describe('Validation anti-liens', () => {
        it('devrait rejeter une description avec http://', () => {
          const annonce = { ...validAnnonce, description: 'Visitez http://example.com pour plus d\'infos' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait rejeter une description avec https://', () => {
          const annonce = { ...validAnnonce, description: 'Site sécurisé https://secure.example.com' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait rejeter une description avec www.', () => {
          const annonce = { ...validAnnonce, description: 'Allez sur www.monsite.com pour voir' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.com)', () => {
          const annonce = { ...validAnnonce, description: 'Mon site est sur monsite.com' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.fr)', () => {
          const annonce = { ...validAnnonce, description: 'Site français sur monsite.fr' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.org)', () => {
          const annonce = { ...validAnnonce, description: 'Organisation sur monorg.org' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.net)', () => {
          const annonce = { ...validAnnonce, description: 'Réseau sur monreseau.net' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.io)', () => {
          const annonce = { ...validAnnonce, description: 'Tech startup sur monstartup.io' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.app)', () => {
          const annonce = { ...validAnnonce, description: 'Application sur monapp.app' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.dev)', () => {
          const annonce = { ...validAnnonce, description: 'Développement sur mondev.dev' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait bloquer les domaines simples (.co.uk)', () => {
          const annonce = { ...validAnnonce, description: 'Site UK sur monsite.co.uk' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeDefined();
          expect(error?.message).toMatch(/liens.*autorisés/i);
        });

        it('devrait accepter une description sans liens', () => {
          const annonce = { ...validAnnonce, description: 'Description normale sans aucun lien web' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeUndefined();
        });

        it('devrait accepter une description avec "com" dans un mot normal', () => {
          const annonce = { ...validAnnonce, description: 'Je communique avec mes amis' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeUndefined();
        });

        it('devrait accepter une description avec "www" dans un mot normal', () => {
          const annonce = { ...validAnnonce, description: 'Je suis très créatif et inventif' };
          const { error } = annonceSchemas.create.validate(annonce);
          expect(error).toBeUndefined();
        });
      });
    });

    describe('Titre validation', () => {
      it('devrait accepter un titre de 5 caractères minimum', () => {
        const annonce = { ...validAnnonce, titre: 'Titre' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un titre trop court', () => {
        const annonce = { ...validAnnonce, titre: 'AB' };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/5 caractères/i);
      });

      it('devrait rejeter un titre trop long', () => {
        const annonce = { ...validAnnonce, titre: 'a'.repeat(101) };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/100 caractères/i);
      });
    });

    describe('Date validation', () => {
      it('devrait accepter des dates valides', () => {
        const annonce = {
          ...validAnnonce,
          datedepart: new Date('2025-12-01T10:00:00Z'),
          datearrivee: new Date('2025-12-01T18:00:00Z'),
        };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter si datearrivee est avant datedepart', () => {
        const annonce = {
          ...validAnnonce,
          datedepart: new Date('2025-12-01T18:00:00Z'),
          datearrivee: new Date('2025-12-01T10:00:00Z'),
        };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date d'arrivée|postérieure/i);
      });

      it('devrait rejeter si datearrivee égale datedepart', () => {
        const annonce = {
          ...validAnnonce,
          datedepart: new Date('2025-12-01T10:00:00Z'),
          datearrivee: new Date('2025-12-01T10:00:00Z'),
        };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/date d'arrivée|postérieure/i);
      });

      it('devrait accepter des dates ISO string', () => {
        const annonce = {
          ...validAnnonce,
          datedepart: '2025-12-01T10:00:00Z',
          datearrivee: '2025-12-01T18:00:00Z',
        };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });
    });

    describe('Villes validation', () => {
      it('devrait rejeter si ville_dep et ville_arr sont identiques', () => {
        const annonce = {
          ...validAnnonce,
          id_ville_dep: 1,
          id_ville_arr: 1,
        };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/villes.*différentes/i);
      });

      it('devrait accepter des villes différentes', () => {
        const annonce = {
          ...validAnnonce,
          id_ville_dep: 1,
          id_ville_arr: 2,
        };
        const { error } = annonceSchemas.create.validate(annonce);
        expect(error).toBeUndefined();
      });
    });

    describe('Champs requis', () => {
      it('devrait rejeter si id_util manquant', () => {
        const { id_util, ...annonceWithoutUser } = validAnnonce;
        const { error } = annonceSchemas.create.validate(annonceWithoutUser);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/id_util/i);
      });

      it('devrait rejeter si prix manquant', () => {
        const { prix, ...annonceWithoutPrice } = validAnnonce;
        const { error } = annonceSchemas.create.validate(annonceWithoutPrice);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/prix/i);
      });

      it('devrait rejeter si datedepart manquante', () => {
        const { datedepart, ...annonceWithoutDep } = validAnnonce;
        const { error } = annonceSchemas.create.validate(annonceWithoutDep);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/datedepart/i);
      });

      it('devrait rejeter si datearrivee manquante', () => {
        const { datearrivee, ...annonceWithoutArr } = validAnnonce;
        const { error } = annonceSchemas.create.validate(annonceWithoutArr);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/datearrivee/i);
      });
    });
  });

  describe('Update Schema', () => {
    it('devrait accepter une mise à jour partielle', () => {
      const update = { prix: 200 };
      const { error } = annonceSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait accepter plusieurs champs à mettre à jour', () => {
      const update = {
        prix: 150,
        titre: 'Nouveau titre',
        description: 'Nouvelle description longue',
        statut: 'vendue',
      };
      const { error } = annonceSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un objet vide', () => {
      const update = {};
      const { error } = annonceSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/at least 1 key|au moins/i);
    });

    it('devrait valider la cohérence des dates si les deux sont fournies', () => {
      const update = {
        datedepart: new Date('2025-12-01T18:00:00Z'),
        datearrivee: new Date('2025-12-01T10:00:00Z'),
      };
      const { error } = annonceSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date d'arrivée|postérieure/i);
    });

    it('devrait accepter statut "active" ou "vendue" uniquement', () => {
      const updateActive = { statut: 'active' };
      const updateVendue = { statut: 'vendue' };
      
      const { error: error1 } = annonceSchemas.update.validate(updateActive);
      const { error: error2 } = annonceSchemas.update.validate(updateVendue);
      
      expect(error1).toBeUndefined();
      expect(error2).toBeUndefined();
    });

    it('devrait rejeter un statut invalide', () => {
      const update = { statut: 'completed' };
      const { error } = annonceSchemas.update.validate(update);
      expect(error).toBeDefined();
    });

    describe('Validation anti-liens dans les mises à jour', () => {
      it('devrait rejeter une mise à jour avec http://', () => {
        const update = { description: 'Visitez http://example.com pour plus d\'infos' };
        const { error } = annonceSchemas.update.validate(update);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/liens.*autorisés/i);
      });

      it('devrait rejeter une mise à jour avec www.', () => {
        const update = { description: 'Allez sur www.monsite.com pour voir' };
        const { error } = annonceSchemas.update.validate(update);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/liens.*autorisés/i);
      });

      it('devrait bloquer une mise à jour avec .com', () => {
        const update = { description: 'Mon site est sur monsite.com' };
        const { error } = annonceSchemas.update.validate(update);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/liens.*autorisés/i);
      });

      it('devrait bloquer une mise à jour avec .fr', () => {
        const update = { description: 'Site français sur monsite.fr' };
        const { error } = annonceSchemas.update.validate(update);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/liens.*autorisés/i);
      });

      it('devrait accepter une mise à jour sans liens', () => {
        const update = { description: 'Nouvelle description sans liens' };
        const { error } = annonceSchemas.update.validate(update);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = annonceSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = annonceSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un ID à zéro', () => {
      const params = { id: 0 };
      const { error } = annonceSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema', () => {
    it('devrait accepter des paramètres de pagination', () => {
      const query = { page: 1, limit: 10 };
      const { error } = annonceSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter des filtres optionnels', () => {
      const query = {
        utilisateur: 1,
        ville_dep: 2,
        ville_arr: 3,
        statut: 'active',
        minPrice: 50,
        maxPrice: 200,
      };
      const { error } = annonceSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait valider la plage de dates', () => {
      const query = {
        dateFrom: new Date('2025-12-01'),
        dateTo: new Date('2025-11-01'),
      };
      const { error } = annonceSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/date de début.*antérieure/i);
    });

    it('devrait valider la plage de prix', () => {
      const query = {
        minPrice: 200,
        maxPrice: 100,
      };
      const { error } = annonceSchemas.query.validate(query);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/prix minimum.*inférieur/i);
    });

    it('devrait accepter sortBy valides', () => {
      const validSortFields = ['prix', 'datedepart', 'datearrivee', 'datepublication'];
      
      validSortFields.forEach(field => {
        const query = { sortBy: field };
        const { error } = annonceSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });
    });

    it('devrait utiliser "datepublication" comme sortBy par défaut', () => {
      const query = {};
      const { value } = annonceSchemas.query.validate(query);
      expect(value.sortBy).toBe('datepublication');
    });
  });

  describe('Edge cases', () => {
    it('devrait rejeter des champs supplémentaires', () => {
      const annonce = {
        ...validAnnonce,
        unknown_field: 'should fail',
      };
      const { error } = annonceSchemas.create.validate(annonce);
      expect(error).toBeDefined();
      expect(error?.message).toContain('not allowed');
    });

    it('devrait accepter prix avec 1 décimale', () => {
      const annonce = { ...validAnnonce, prix: 99.5 };
      const { error } = annonceSchemas.create.validate(annonce);
      expect(error).toBeUndefined();
    });

    it('devrait accepter prix entier', () => {
      const annonce = { ...validAnnonce, prix: 100 };
      const { error } = annonceSchemas.create.validate(annonce);
      expect(error).toBeUndefined();
    });
  });
});




