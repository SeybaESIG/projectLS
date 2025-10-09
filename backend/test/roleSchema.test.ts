import { roleSchema } from '../schemas/roleSchema.js';

describe('Role Schema Validation', () => {
  describe('Valid role data', () => {
    it('should validate a valid role name', () => {
      const validRole = { nom_role: 'Admin' };
      const { error } = roleSchema.validate(validRole);
      expect(error).toBeUndefined();
    });

    it('should validate a role name with 100 characters', () => {
      const validRole = { nom_role: 'A'.repeat(100) };
      const { error } = roleSchema.validate(validRole);
      expect(error).toBeUndefined();
    });

    it('should validate a role name with spaces', () => {
      const validRole = { nom_role: 'Super Admin' };
      const { error } = roleSchema.validate(validRole);
      expect(error).toBeUndefined();
    });

    it('should validate a role name with special characters', () => {
      const validRole = { nom_role: 'Admin-User_Test' };
      const { error } = roleSchema.validate(validRole);
      expect(error).toBeUndefined();
    });

    it('should validate a role name with minimum length', () => {
      const validRole = { nom_role: 'A' };
      const { error } = roleSchema.validate(validRole);
      expect(error).toBeUndefined();
    });
  });

  describe('Invalid role data', () => {
    it('should reject missing nom_role', () => {
      const invalidRole = {};
      const { error } = roleSchema.validate(invalidRole);
      expect(error).toBeDefined();
      expect(error?.message).toContain('nom_role');
    });

    it('should reject empty nom_role', () => {
      const invalidRole = { nom_role: '' };
      const { error } = roleSchema.validate(invalidRole);
      expect(error).toBeDefined();
      expect(error?.message).toContain('empty');
    });

    it('should trim nom_role with spaces around valid text', () => {
      const validRole = { nom_role: '  Admin  ' };
      const { value, error } = roleSchema.validate(validRole);
      expect(error).toBeUndefined();
      expect(value).toBeDefined();
      // The value should have the trimmed nom_role
      expect(value).toHaveProperty('nom_role');
    });

    it('should reject nom_role longer than 100 characters', () => {
      const invalidRole = { nom_role: 'A'.repeat(101) };
      const { error } = roleSchema.validate(invalidRole);
      expect(error).toBeDefined();
      expect(error?.message).toContain('100');
    });

    it('should reject non-string nom_role', () => {
      const invalidRole = { nom_role: 123 };
      const { error } = roleSchema.validate(invalidRole);
      expect(error).toBeDefined();
      expect(error?.message).toContain('string');
    });

    it('should reject null nom_role', () => {
      const invalidRole = { nom_role: null };
      const { error } = roleSchema.validate(invalidRole);
      expect(error).toBeDefined();
    });

    it('should reject array as nom_role', () => {
      const invalidRole = { nom_role: ['Admin', 'User'] };
      const { error } = roleSchema.validate(invalidRole);
      expect(error).toBeDefined();
      expect(error?.message).toContain('string');
    });
  });

  describe('Extra fields', () => {
    it('should reject unknown fields', () => {
      const roleWithExtra = { nom_role: 'Admin', extra_field: 'should be removed' };
      const { error } = roleSchema.validate(roleWithExtra);
      expect(error).toBeDefined();
      expect(error?.message).toContain('not allowed');
    });

    it('should reject id_role if provided', () => {
      const roleWithId = { nom_role: 'Admin', id_role: 999 };
      const { error } = roleSchema.validate(roleWithId);
      expect(error).toBeDefined();
      expect(error?.message).toContain('not allowed');
    });
  });
});
