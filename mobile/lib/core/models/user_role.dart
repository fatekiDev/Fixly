enum UserRole { miembro, encargado, admin }

extension UserRoleLabel on UserRole {
  String get label => switch (this) {
        UserRole.miembro => 'Miembro',
        UserRole.encargado => 'Encargado',
        UserRole.admin => 'Administrador',
      };
}