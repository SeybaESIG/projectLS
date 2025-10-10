import { userSchemas } from '../schemas/userSchemas.js';

// Données de test valides pour toutes les suites
const validUser = {
  id_ville: 1,
  id_role: 2,
  username: 'john.doe',
  nom: 'Doe',
  prenom: 'John',
  email: 'john@example.com',
  tel: '+33601020304',
  mot_de_passe: 'SecurePass123!',
  adresse: '123 Rue de Paris',
};

describe('User Schemas Validation', () => {
  describe('Create Schema', () => {

    describe('Valid data', () => {
      it('devrait valider un utilisateur complet', () => {
        const { error } = userSchemas.create.validate(validUser);
        expect(error).toBeUndefined();
      });

      it('devrait accepter username avec points et tirets', () => {
        const user = { ...validUser, username: 'john.doe-123' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter username avec underscores', () => {
        const user = { ...validUser, username: 'john_doe' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter detail_adresse optionnel', () => {
        const user = { ...validUser, detail_adresse: 'Apt 4B' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter piece_id et photo optionnels', () => {
        const user = { 
          ...validUser, 
          piece_id: 'ID123456',
          photo: 'https://example.com/photo.jpg'
        };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });
    });

    describe('Username validation', () => {
      it('devrait rejeter username trop court (moins de 3 caractères)', () => {
        const user = { ...validUser, username: 'ab' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/3 caractères/);
      });

      it('devrait rejeter username trop long (plus de 30 caractères)', () => {
        const user = { ...validUser, username: 'a'.repeat(31) };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/30 caractères/);
      });

      it('devrait rejeter username avec caractères spéciaux interdits', () => {
        const user = { ...validUser, username: 'john@doe' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/alphanum|lettres/i);
      });

      it('devrait rejeter username avec espaces', () => {
        const user = { ...validUser, username: 'john doe' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
      });

      it('devrait rejeter username vide', () => {
        const user = { ...validUser, username: '' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
      });
    });

    describe('Nom et Prénom validation', () => {
      it('devrait rejeter nom trop court', () => {
        const user = { ...validUser, nom: 'D' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/2 caractères/);
      });

      it('devrait rejeter prenom trop court', () => {
        const user = { ...validUser, prenom: 'J' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/2 caractères/);
      });

      it('devrait accepter nom avec accents', () => {
        const user = { ...validUser, nom: 'Dùpont' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter nom avec tirets', () => {
        const user = { ...validUser, nom: 'Martin-Dupont' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter nom avec espaces', () => {
        const user = { ...validUser, nom: 'De La Fontaine' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter nom avec chiffres', () => {
        const user = { ...validUser, nom: 'Doe123' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/lettres/);
      });
    });

    describe('Email validation', () => {
      it('devrait accepter un email valide', () => {
        const user = { ...validUser, email: 'test@example.com' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un email invalide', () => {
        const user = { ...validUser, email: 'invalid-email' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
      });

      it('devrait rejeter un email sans @', () => {
        const user = { ...validUser, email: 'testexample.com' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
      });
    });

    describe('Téléphone validation', () => {
      it('devrait accepter un numéro français valide', () => {
        const user = { ...validUser, tel: '+33601020304' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un numéro international', () => {
        const user = { ...validUser, tel: '+12125551234' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait accepter un numéro UK valide', () => {
        const user = { ...validUser, tel: '+447911123456' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un numéro invalide', () => {
        const user = { ...validUser, tel: '0612345678' }; // Missing + prefix
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/téléphone|international/i);
      });

      it('devrait rejeter un numéro trop long', () => {
        const user = { ...validUser, tel: '+3361234567890123456' }; // Too many digits
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/téléphone|international/i);
      });
    });

    describe('Mot de passe validation', () => {
      it('devrait accepter un mot de passe fort', () => {
        const user = { ...validUser, mot_de_passe: 'StrongP@ss123!' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeUndefined();
      });

      it('devrait rejeter un mot de passe trop court', () => {
        const user = { ...validUser, mot_de_passe: 'Short1!' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
      });
    });

    describe('Champs requis', () => {
      it('devrait rejeter si id_ville manquant', () => {
        const { id_ville, ...userWithoutVille } = validUser;
        const { error } = userSchemas.create.validate(userWithoutVille);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/id_ville/);
      });

      it('devrait rejeter si id_role manquant', () => {
        const { id_role, ...userWithoutRole } = validUser;
        const { error } = userSchemas.create.validate(userWithoutRole);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/id_role/);
      });

      it('devrait rejeter si username manquant', () => {
        const { username, ...userWithoutUsername } = validUser;
        const { error } = userSchemas.create.validate(userWithoutUsername);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/username/);
      });

      it('devrait rejeter si mot_de_passe manquant', () => {
        const { mot_de_passe, ...userWithoutPassword } = validUser;
        const { error } = userSchemas.create.validate(userWithoutPassword);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/mot_de_passe/);
      });

      it('devrait rejeter si adresse manquante', () => {
        const { adresse, ...userWithoutAdresse } = validUser;
        const { error } = userSchemas.create.validate(userWithoutAdresse);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/adresse/);
      });
    });

    describe('Adresse validation', () => {
      it('devrait rejeter une adresse trop courte', () => {
        const user = { ...validUser, adresse: '123' };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/5 characters|5 caractères/i);
      });

      it('devrait rejeter une adresse trop longue', () => {
        const user = { ...validUser, adresse: 'A'.repeat(256) };
        const { error } = userSchemas.create.validate(user);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/255 characters|255 caractères/i);
      });
    });
  });

  describe('Update Schema', () => {
    it('devrait accepter une mise à jour partielle', () => {
      const update = { nom: 'NewName' };
      const { error } = userSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait accepter plusieurs champs à mettre à jour', () => {
      const update = { 
        nom: 'NewName', 
        prenom: 'NewFirstName',
        email: 'newemail@example.com'
      };
      const { error } = userSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un objet vide', () => {
      const update = {};
      const { error } = userSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/at least 1 key|au moins/i);
    });

    it('devrait valider username avec caractères spéciaux', () => {
      const update = { username: 'new.user_name' };
      const { error } = userSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('devrait accepter tous les champs optionnels dans update', () => {
      const update = {
        id_ville: 2,
        id_role: 1,
        username: 'updated',
        nom: 'Updated',
        prenom: 'User',
        email: 'updated@example.com',
        tel: '+33602030405',
        piece_id: 'NEWID',
        photo: 'newphoto.jpg',
        adresse: 'New Address',
        detail_adresse: 'New Detail',
      };
      const { error } = userSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });
  });

  describe('Login Schema', () => {
    it('devrait valider des identifiants de connexion valides', () => {
      const login = { 
        username: 'john.doe', 
        mot_de_passe: 'password123' 
      };
      const { error } = userSchemas.login.validate(login);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter si username manquant', () => {
      const login = { mot_de_passe: 'password123' };
      const { error } = userSchemas.login.validate(login);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/username/);
    });

    it('devrait rejeter si mot_de_passe manquant', () => {
      const login = { username: 'john.doe' };
      const { error } = userSchemas.login.validate(login);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/mot_de_passe/);
    });

    it('devrait rejeter des champs supplémentaires', () => {
      const login = { 
        username: 'john.doe', 
        mot_de_passe: 'password123',
        extra: 'field'
      };
      const { error } = userSchemas.login.validate(login);
      expect(error).toBeDefined();
      expect(error?.message).toContain('not allowed');
    });
  });

  describe('Change Password Schema', () => {
    it('devrait valider un changement de mot de passe valide', () => {
      const changePassword = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewStrongP@ss123!',
      };
      const { error } = userSchemas.changePassword.validate(changePassword);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter si currentPassword manquant', () => {
      const changePassword = { newPassword: 'NewStrongP@ss123!' };
      const { error } = userSchemas.changePassword.validate(changePassword);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/currentPassword/);
    });

    it('devrait rejeter si newPassword manquant', () => {
      const changePassword = { currentPassword: 'OldPass123!' };
      const { error } = userSchemas.changePassword.validate(changePassword);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/newPassword/);
    });

    it('devrait rejeter un nouveau mot de passe faible', () => {
      const changePassword = {
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
      };
      const { error } = userSchemas.changePassword.validate(changePassword);
      expect(error).toBeDefined();
    });
  });

  describe('Params Schema', () => {
    it('devrait valider un ID numérique', () => {
      const params = { id: 123 };
      const { error } = userSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('devrait rejeter un ID négatif', () => {
      const params = { id: -1 };
      const { error } = userSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('devrait rejeter un ID à zéro', () => {
      const params = { id: 0 };
      const { error } = userSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });

  describe('Query Schema (Pagination)', () => {
    it('devrait valider des paramètres de pagination valides', () => {
      const query = { page: 1, limit: 50 };
      const { error } = userSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter search optionnel', () => {
      const query = { search: 'john', page: 1, limit: 20 };
      const { error } = userSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter ville et role optionnels', () => {
      const query = { ville: 123, role: 2, page: 1 };
      const { error } = userSchemas.query.validate(query);
      expect(error).toBeUndefined();
    });

    it('devrait accepter sortBy valide', () => {
      const validSortFields = ['nom', 'prenom', 'username', 'email', 'date_inscription'];
      
      validSortFields.forEach(field => {
        const query = { sortBy: field };
        const { error } = userSchemas.query.validate(query);
        expect(error).toBeUndefined();
      });
    });

    it('devrait rejeter sortBy invalide', () => {
      const query = { sortBy: 'invalid_field' };
      const { error } = userSchemas.query.validate(query);
      expect(error).toBeDefined();
    });

    it('devrait utiliser "nom" comme sortBy par défaut', () => {
      const query = {};
      const { value } = userSchemas.query.validate(query);
      expect(value.sortBy).toBe('nom');
    });
  });

  describe('Edge cases', () => {
    it('devrait rejeter des champs supplémentaires dans create', () => {
      const user = { 
        ...validUser, 
        unknown_field: 'should fail' 
      };
      const { error } = userSchemas.create.validate(user);
      expect(error).toBeDefined();
      expect(error?.message).toContain('not allowed');
    });

    it('devrait valider les limites de longueur pour piece_id', () => {
      const user = { ...validUser, piece_id: 'ID12' };
      const { error } = userSchemas.create.validate(user);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/5 characters|5 caractères/i);
    });

    it('devrait valider les limites de longueur pour photo', () => {
      const user = { ...validUser, photo: 'ph' };
      const { error } = userSchemas.create.validate(user);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/5 characters|5 caractères/i);
    });

    it('devrait valider les limites de longueur pour detail_adresse', () => {
      const user = { ...validUser, detail_adresse: 'Apt' };
      const { error } = userSchemas.create.validate(user);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/5 characters|5 caractères/i);
    });
  });
});

