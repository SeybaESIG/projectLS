import { roleSchemas } from '../schemas/roleSchemas.js';

describe('Role Schemas Validation', () => {
  describe('Create Schema', () => {
    describe('Valid role data', () => {
      it('should validate a valid role name', () => {
        const validRole = { nom_role: 'Admin' };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should validate a role name with 100 characters', () => {
        const validRole = { nom_role: 'A'.repeat(100) };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should validate a role name with spaces', () => {
        const validRole = { nom_role: 'Super Admin' };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should validate a role name with special characters', () => {
        const validRole = { nom_role: 'Admin-User_Test' };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should validate a role name with minimum length', () => {
        const validRole = { nom_role: 'A' };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should accept description_role', () => {
        const validRole = { nom_role: 'Admin', description_role: 'Administrator role' };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should accept null description_role', () => {
        const validRole = { nom_role: 'Admin', description_role: null };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });

      it('should accept empty description_role', () => {
        const validRole = { nom_role: 'Admin', description_role: '' };
        const { error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
      });
    });

    describe('Invalid role data', () => {
      it('should reject missing nom_role', () => {
        const invalidRole = {};
        const { error } = roleSchemas.create.validate(invalidRole);
        expect(error).toBeDefined();
        expect(error?.message).toContain('nom_role');
      });

      it('should reject empty nom_role', () => {
        const invalidRole = { nom_role: '' };
        const { error } = roleSchemas.create.validate(invalidRole);
        expect(error).toBeDefined();
        expect(error?.message).toContain('empty');
      });

      it('should trim nom_role with spaces around valid text', () => {
        const validRole = { nom_role: '  Admin  ' };
        const { value, error } = roleSchemas.create.validate(validRole);
        expect(error).toBeUndefined();
        expect(value).toBeDefined();
        expect(value).toHaveProperty('nom_role');
      });

      it('should reject nom_role longer than 100 characters', () => {
        const invalidRole = { nom_role: 'A'.repeat(101) };
        const { error } = roleSchemas.create.validate(invalidRole);
        expect(error).toBeDefined();
        expect(error?.message).toContain('100');
      });

      it('should reject non-string nom_role', () => {
        const invalidRole = { nom_role: 123 };
        const { error } = roleSchemas.create.validate(invalidRole);
        expect(error).toBeDefined();
        expect(error?.message).toContain('string');
      });

      it('should reject null nom_role', () => {
        const invalidRole = { nom_role: null };
        const { error } = roleSchemas.create.validate(invalidRole);
        expect(error).toBeDefined();
      });

      it('should reject array as nom_role', () => {
        const invalidRole = { nom_role: ['Admin', 'User'] };
        const { error } = roleSchemas.create.validate(invalidRole);
        expect(error).toBeDefined();
        expect(error?.message).toContain('string');
      });
    });
  });

  describe('Update Schema', () => {
    it('should accept partial update with nom_role', () => {
      const update = { nom_role: 'New Role' };
      const { error } = roleSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('should accept partial update with description_role', () => {
      const update = { description_role: 'New description' };
      const { error } = roleSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('should accept update with both fields', () => {
      const update = { nom_role: 'Updated', description_role: 'Updated description' };
      const { error } = roleSchemas.update.validate(update);
      expect(error).toBeUndefined();
    });

    it('should reject empty update', () => {
      const update = {};
      const { error } = roleSchemas.update.validate(update);
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/at least 1 key|au moins/i);
    });

    it('should reject empty nom_role in update', () => {
      const update = { nom_role: '' };
      const { error } = roleSchemas.update.validate(update);
      expect(error).toBeDefined();
    });
  });

  describe('Params Schema', () => {
    it('should validate a numeric ID', () => {
      const params = { id: 1 };
      const { error } = roleSchemas.params.validate(params);
      expect(error).toBeUndefined();
    });

    it('should reject negative ID', () => {
      const params = { id: -1 };
      const { error } = roleSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('should reject zero ID', () => {
      const params = { id: 0 };
      const { error } = roleSchemas.params.validate(params);
      expect(error).toBeDefined();
    });

    it('should reject non-numeric ID', () => {
      const params = { id: 'abc' };
      const { error } = roleSchemas.params.validate(params);
      expect(error).toBeDefined();
    });
  });
});




