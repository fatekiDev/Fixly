import 'package:flutter/material.dart';

class AppTheme {
  static const Color seed = Color(0xFF1E6FD9);

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: seed,
      );
}