import 'package:go_router/go_router.dart';
import '../../features/auth/auth_controller.dart';
import '../../features/auth/login_page.dart';
import '../../features/home/home_page.dart';

GoRouter buildRouter(AuthController auth) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: auth,
    redirect: (context, state) {
      final goingToLogin = state.matchedLocation == '/login';
      if (!auth.isLoggedIn) return goingToLogin ? null : '/login';
      if (goingToLogin) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(path: '/home', builder: (context, state) => const HomePage()),
    ],
  );
}