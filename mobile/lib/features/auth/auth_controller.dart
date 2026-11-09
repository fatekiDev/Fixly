import 'package:flutter/foundation.dart';
import '../../core/models/user_role.dart';

class AppUser {
  final String name;
  final String email;
  final UserRole role;

  const AppUser({
    required this.name,
    required this.email,
    required this.role,
  });
}

class AuthController extends ChangeNotifier {
  // Usuarios de prueba: se reemplazan por el backend más adelante.
  static const Map<String, AppUser> _fakeUsers = {
    'miembro@fixly.cl': AppUser(
      name: 'Ana Miembro',
      email: 'miembro@fixly.cl',
      role: UserRole.miembro,
    ),
    'encargado@fixly.cl': AppUser(
      name: 'Luis Encargado',
      email: 'encargado@fixly.cl',
      role: UserRole.encargado,
    ),
    'admin@fixly.cl': AppUser(
      name: 'Carla Admin',
      email: 'admin@fixly.cl',
      role: UserRole.admin,
    ),
  };

  AppUser? _user;

  AppUser? get user => _user;
  bool get isLoggedIn => _user != null;

  bool login(String email, String password) {
    final found = _fakeUsers[email.trim().toLowerCase()];
    if (found == null || password != '1234') return false;
    _user = found;
    notifyListeners();
    return true;
  }

  void logout() {
    _user = null;
    notifyListeners();
  }
}