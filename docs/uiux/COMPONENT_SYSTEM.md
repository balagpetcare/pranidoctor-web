# COMPONENT SYSTEM — Prani Doctor Mobile

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** Reusable UI components, component architecture, Flutter implementation

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Atomic Design Structure](#2-atomic-design-structure)
3. [Core Components](#3-core-components)
4. [Form Components](#4-form-components)
5. [Display Components](#5-display-components)
6. [Navigation Components](#6-navigation-components)
7. [Feedback Components](#7-feedback-components)
8. [Domain Components](#8-domain-components)
9. [Loading & Error UX](#9-loading--error-ux)
10. [Component Documentation](#10-component-documentation)

---

## 1. Component Architecture

### 1.1 Component Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT PRINCIPLES                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. SINGLE RESPONSIBILITY                                                       │
│     • Each component does one thing well                                        │
│     • Clear input/output contract                                               │
│     • No side effects in presentation layer                                     │
│                                                                                  │
│  2. COMPOSITION OVER INHERITANCE                                                │
│     • Build complex UI by combining simple components                           │
│     • Use slots/children for customization                                      │
│     • Avoid deep inheritance hierarchies                                        │
│                                                                                  │
│  3. CONSISTENT STYLING                                                          │
│     • Use design tokens, never hardcoded values                                 │
│     • Follow naming conventions                                                 │
│     • Support theme customization                                               │
│                                                                                  │
│  4. ACCESSIBILITY FIRST                                                         │
│     • Semantic labels on all interactive elements                               │
│     • Minimum touch targets (48dp)                                              │
│     • Color contrast compliance                                                 │
│                                                                                  │
│  5. OFFLINE-AWARE                                                               │
│     • Graceful degradation when offline                                         │
│     • Show cached state appropriately                                           │
│     • Clear offline indicators                                                  │
│                                                                                  │
│  6. BANGLA-FIRST                                                                │
│     • Default text in Bengali                                                   │
│     • Localization-ready                                                        │
│     • Proper Bangla typography                                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Folder Structure

```
lib/
├── components/
│   ├── atoms/                    # Smallest building blocks
│   │   ├── app_button.dart
│   │   ├── app_text.dart
│   │   ├── app_icon.dart
│   │   ├── app_avatar.dart
│   │   ├── app_badge.dart
│   │   ├── app_chip.dart
│   │   ├── app_divider.dart
│   │   └── app_spacer.dart
│   │
│   ├── molecules/                # Simple component groups
│   │   ├── app_input_field.dart
│   │   ├── app_dropdown.dart
│   │   ├── app_search_bar.dart
│   │   ├── app_list_tile.dart
│   │   ├── app_card.dart
│   │   ├── app_status_badge.dart
│   │   └── voice_input_button.dart
│   │
│   ├── organisms/                # Complex component assemblies
│   │   ├── app_app_bar.dart
│   │   ├── app_bottom_nav.dart
│   │   ├── app_bottom_sheet.dart
│   │   ├── app_dialog.dart
│   │   ├── app_form.dart
│   │   ├── app_list.dart
│   │   └── app_tab_bar.dart
│   │
│   ├── templates/                # Page-level layouts
│   │   ├── scroll_page_template.dart
│   │   ├── tab_page_template.dart
│   │   ├── form_page_template.dart
│   │   └── detail_page_template.dart
│   │
│   └── domain/                   # Business-specific components
│       ├── animal/
│       │   ├── animal_card.dart
│       │   ├── animal_list_item.dart
│       │   └── animal_avatar.dart
│       ├── request/
│       │   ├── request_card.dart
│       │   ├── request_status_badge.dart
│       │   └── request_timeline.dart
│       ├── doctor/
│       │   ├── doctor_card.dart
│       │   └── doctor_availability_badge.dart
│       ├── emergency/
│       │   ├── emergency_banner.dart
│       │   └── emergency_button.dart
│       └── ai/
│           ├── ai_chat_bubble.dart
│           └── ai_suggestion_chips.dart
│
└── shared/
    └── widgets/                  # Utility widgets
        ├── loading_indicator.dart
        ├── error_widget.dart
        ├── empty_state_widget.dart
        ├── offline_indicator.dart
        └── refresh_indicator.dart
```

---

## 2. Atomic Design Structure

### 2.1 Atomic Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ATOMIC DESIGN LEVELS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ATOMS (Basic HTML-like elements)                                               │
│  ─────────────────────────────────                                              │
│  • Buttons, Text, Icons, Images                                                 │
│  • Avatar, Badge, Chip, Divider                                                 │
│  • Cannot be broken down further                                                │
│                                                                                  │
│              ↓ Combine to form                                                  │
│                                                                                  │
│  MOLECULES (Simple component groups)                                            │
│  ─────────────────────────────────                                              │
│  • Input field = Label + Input + Icon                                           │
│  • List tile = Avatar + Title + Subtitle + Action                               │
│  • Card = Image + Title + Description                                           │
│                                                                                  │
│              ↓ Combine to form                                                  │
│                                                                                  │
│  ORGANISMS (Complex UI sections)                                                │
│  ─────────────────────────────                                                  │
│  • App bar = Logo + Title + Actions                                             │
│  • Form = Multiple inputs + Validation + Submit                                 │
│  • List = Multiple list tiles + Scroll + Load more                              │
│                                                                                  │
│              ↓ Placed in                                                        │
│                                                                                  │
│  TEMPLATES (Page layouts)                                                       │
│  ─────────────────────                                                          │
│  • Scroll page = AppBar + Content + FAB                                         │
│  • Tab page = AppBar + TabBar + Content                                         │
│  • Form page = AppBar + Form + Actions                                          │
│                                                                                  │
│              ↓ Filled with content to create                                    │
│                                                                                  │
│  PAGES (Actual screens)                                                         │
│  ─────────────────────                                                          │
│  • AnimalListPage, RequestDetailPage, etc.                                      │
│  • Feature-specific, in features/ folder                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Components

### 3.1 AppButton

```dart
// lib/components/atoms/app_button.dart

enum AppButtonVariant {
  primary,    // Filled green
  secondary,  // Outlined green
  tertiary,   // Text only
  danger,     // Red for destructive
  emergency,  // Red filled, prominent
}

enum AppButtonSize {
  small,      // Height: 36dp
  medium,     // Height: 44dp
  large,      // Height: 52dp
}

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final IconData? leadingIcon;
  final IconData? trailingIcon;
  final bool isLoading;
  final bool isFullWidth;
  
  const AppButton({
    Key? key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.medium,
    this.leadingIcon,
    this.trailingIcon,
    this.isLoading = false,
    this.isFullWidth = true,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final height = _getHeight();
    final padding = _getPadding();
    final textStyle = _getTextStyle();
    
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: height,
      child: _buildButton(context, padding, textStyle),
    );
  }
  
  double _getHeight() {
    switch (size) {
      case AppButtonSize.small: return 36;
      case AppButtonSize.medium: return 44;
      case AppButtonSize.large: return 52;
    }
  }
  
  Widget _buildButton(BuildContext context, EdgeInsets padding, TextStyle textStyle) {
    switch (variant) {
      case AppButtonVariant.primary:
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
            padding: padding,
          ),
          child: _buildContent(textStyle),
        );
      
      case AppButtonVariant.secondary:
        return OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: BorderSide(color: AppColors.primary),
            padding: padding,
          ),
          child: _buildContent(textStyle),
        );
      
      case AppButtonVariant.tertiary:
        return TextButton(
          onPressed: isLoading ? null : onPressed,
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            padding: padding,
          ),
          child: _buildContent(textStyle),
        );
      
      case AppButtonVariant.danger:
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
            foregroundColor: AppColors.white,
            padding: padding,
          ),
          child: _buildContent(textStyle),
        );
      
      case AppButtonVariant.emergency:
        return ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.emergency,
            foregroundColor: AppColors.white,
            padding: padding,
            elevation: 4,
          ),
          child: _buildContent(textStyle),
        );
    }
  }
  
  Widget _buildContent(TextStyle textStyle) {
    if (isLoading) {
      return const SizedBox(
        width: 20,
        height: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation(AppColors.white),
        ),
      );
    }
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (leadingIcon != null) ...[
          Icon(leadingIcon, size: 20),
          const SizedBox(width: 8),
        ],
        Text(label, style: textStyle),
        if (trailingIcon != null) ...[
          const SizedBox(width: 8),
          Icon(trailingIcon, size: 20),
        ],
      ],
    );
  }
}
```

### 3.2 AppText

```dart
// lib/components/atoms/app_text.dart

enum AppTextStyle {
  displayLarge,
  displayMedium,
  displaySmall,
  headlineLarge,
  headlineMedium,
  headlineSmall,
  titleLarge,
  titleMedium,
  titleSmall,
  bodyLarge,
  bodyMedium,
  bodySmall,
  labelLarge,
  labelMedium,
  labelSmall,
}

class AppText extends StatelessWidget {
  final String text;
  final AppTextStyle style;
  final Color? color;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  
  const AppText(
    this.text, {
    Key? key,
    this.style = AppTextStyle.bodyMedium,
    this.color,
    this.textAlign,
    this.maxLines,
    this.overflow,
  }) : super(key: key);
  
  // Named constructors for common styles
  const AppText.displayLarge(this.text, {Key? key, this.color, this.textAlign, this.maxLines, this.overflow})
      : style = AppTextStyle.displayLarge, super(key: key);
  
  const AppText.headline(this.text, {Key? key, this.color, this.textAlign, this.maxLines, this.overflow})
      : style = AppTextStyle.headlineMedium, super(key: key);
  
  const AppText.title(this.text, {Key? key, this.color, this.textAlign, this.maxLines, this.overflow})
      : style = AppTextStyle.titleMedium, super(key: key);
  
  const AppText.body(this.text, {Key? key, this.color, this.textAlign, this.maxLines, this.overflow})
      : style = AppTextStyle.bodyMedium, super(key: key);
  
  const AppText.label(this.text, {Key? key, this.color, this.textAlign, this.maxLines, this.overflow})
      : style = AppTextStyle.labelMedium, super(key: key);
  
  const AppText.caption(this.text, {Key? key, this.color, this.textAlign, this.maxLines, this.overflow})
      : style = AppTextStyle.bodySmall, super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: _getTextStyle().copyWith(color: color),
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow ?? (maxLines != null ? TextOverflow.ellipsis : null),
    );
  }
  
  TextStyle _getTextStyle() {
    switch (style) {
      case AppTextStyle.displayLarge: return AppTextStyles.displayLarge;
      case AppTextStyle.displayMedium: return AppTextStyles.displayMedium;
      case AppTextStyle.displaySmall: return AppTextStyles.displaySmall;
      case AppTextStyle.headlineLarge: return AppTextStyles.headlineLarge;
      case AppTextStyle.headlineMedium: return AppTextStyles.headlineMedium;
      case AppTextStyle.headlineSmall: return AppTextStyles.headlineSmall;
      case AppTextStyle.titleLarge: return AppTextStyles.titleLarge;
      case AppTextStyle.titleMedium: return AppTextStyles.titleMedium;
      case AppTextStyle.titleSmall: return AppTextStyles.titleSmall;
      case AppTextStyle.bodyLarge: return AppTextStyles.bodyLarge;
      case AppTextStyle.bodyMedium: return AppTextStyles.bodyMedium;
      case AppTextStyle.bodySmall: return AppTextStyles.bodySmall;
      case AppTextStyle.labelLarge: return AppTextStyles.labelLarge;
      case AppTextStyle.labelMedium: return AppTextStyles.labelMedium;
      case AppTextStyle.labelSmall: return AppTextStyles.labelSmall;
    }
  }
}
```

### 3.3 AppIcon

```dart
// lib/components/atoms/app_icon.dart

enum AppIconSize {
  xs,    // 16dp
  sm,    // 20dp
  md,    // 24dp
  lg,    // 32dp
  xl,    // 40dp
  xxl,   // 48dp
}

class AppIcon extends StatelessWidget {
  final IconData icon;
  final AppIconSize size;
  final Color? color;
  final String? semanticLabel;
  
  const AppIcon(
    this.icon, {
    Key? key,
    this.size = AppIconSize.md,
    this.color,
    this.semanticLabel,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Icon(
      icon,
      size: _getSize(),
      color: color ?? AppColors.textSecondary,
      semanticLabel: semanticLabel,
    );
  }
  
  double _getSize() {
    switch (size) {
      case AppIconSize.xs: return 16;
      case AppIconSize.sm: return 20;
      case AppIconSize.md: return 24;
      case AppIconSize.lg: return 32;
      case AppIconSize.xl: return 40;
      case AppIconSize.xxl: return 48;
    }
  }
}
```

### 3.4 AppAvatar

```dart
// lib/components/atoms/app_avatar.dart

enum AppAvatarSize {
  xs,    // 24dp
  sm,    // 32dp
  md,    // 40dp
  lg,    // 56dp
  xl,    // 72dp
  xxl,   // 96dp
}

class AppAvatar extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final AppAvatarSize size;
  final IconData? placeholderIcon;
  final Color? backgroundColor;
  final VoidCallback? onTap;
  
  const AppAvatar({
    Key? key,
    this.imageUrl,
    this.name,
    this.size = AppAvatarSize.md,
    this.placeholderIcon,
    this.backgroundColor,
    this.onTap,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final dimension = _getSize();
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: dimension,
        height: dimension,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: backgroundColor ?? AppColors.primaryLight,
        ),
        child: ClipOval(
          child: _buildContent(dimension),
        ),
      ),
    );
  }
  
  Widget _buildContent(double dimension) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return Image.network(
        imageUrl!,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _buildPlaceholder(dimension),
      );
    }
    return _buildPlaceholder(dimension);
  }
  
  Widget _buildPlaceholder(double dimension) {
    if (name != null && name!.isNotEmpty) {
      return Center(
        child: Text(
          _getInitials(name!),
          style: TextStyle(
            fontSize: dimension * 0.4,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
      );
    }
    return Icon(
      placeholderIcon ?? Icons.person_rounded,
      size: dimension * 0.5,
      color: AppColors.primary,
    );
  }
  
  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, min(2, name.length)).toUpperCase();
  }
  
  double _getSize() {
    switch (size) {
      case AppAvatarSize.xs: return 24;
      case AppAvatarSize.sm: return 32;
      case AppAvatarSize.md: return 40;
      case AppAvatarSize.lg: return 56;
      case AppAvatarSize.xl: return 72;
      case AppAvatarSize.xxl: return 96;
    }
  }
}
```

### 3.5 AppBadge

```dart
// lib/components/atoms/app_badge.dart

enum AppBadgeVariant {
  primary,
  secondary,
  success,
  warning,
  error,
  info,
  neutral,
}

class AppBadge extends StatelessWidget {
  final String label;
  final AppBadgeVariant variant;
  final IconData? icon;
  
  const AppBadge({
    Key? key,
    required this.label,
    this.variant = AppBadgeVariant.primary,
    this.icon,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final colors = _getColors();
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: colors.$1,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: colors.$2),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTextStyles.labelSmall.copyWith(color: colors.$2),
          ),
        ],
      ),
    );
  }
  
  (Color, Color) _getColors() {
    switch (variant) {
      case AppBadgeVariant.primary:
        return (AppColors.primaryLight, AppColors.primaryDark);
      case AppBadgeVariant.secondary:
        return (AppColors.secondaryLight, AppColors.secondaryDark);
      case AppBadgeVariant.success:
        return (Color(0xFFDCFCE7), AppColors.success);
      case AppBadgeVariant.warning:
        return (Color(0xFFFEF9C3), AppColors.warning);
      case AppBadgeVariant.error:
        return (Color(0xFFFEE2E2), AppColors.error);
      case AppBadgeVariant.info:
        return (Color(0xFFDBEAFE), AppColors.info);
      case AppBadgeVariant.neutral:
        return (AppColors.gray100, AppColors.gray600);
    }
  }
}
```

---

## 4. Form Components

### 4.1 AppTextField

```dart
// lib/components/molecules/app_text_field.dart

class AppTextField extends StatelessWidget {
  final String label;
  final String? hint;
  final String? value;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final bool obscureText;
  final TextInputType? keyboardType;
  final int? maxLines;
  final int? maxLength;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;
  final bool enabled;
  final bool showVoiceInput;
  final VoidCallback? onVoiceTap;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  
  const AppTextField({
    Key? key,
    required this.label,
    this.hint,
    this.value,
    this.onChanged,
    this.errorText,
    this.obscureText = false,
    this.keyboardType,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.enabled = true,
    this.showVoiceInput = false,
    this.onVoiceTap,
    this.controller,
    this.focusNode,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label
        Row(
          children: [
            AppText.label(label),
            if (showVoiceInput) ...[
              const Spacer(),
              _buildVoiceButton(),
            ],
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        
        // Input
        TextFormField(
          controller: controller,
          focusNode: focusNode,
          initialValue: controller == null ? value : null,
          onChanged: onChanged,
          obscureText: obscureText,
          keyboardType: keyboardType,
          maxLines: maxLines,
          maxLength: maxLength,
          enabled: enabled,
          style: AppTextStyles.bodyLarge,
          decoration: InputDecoration(
            hintText: hint,
            errorText: errorText,
            prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
            suffixIcon: _buildSuffix(),
            counterText: '',
          ),
        ),
      ],
    );
  }
  
  Widget _buildVoiceButton() {
    return GestureDetector(
      onTap: onVoiceTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(AppRadius.full),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.mic_rounded, size: 16, color: AppColors.primary),
            const SizedBox(width: 4),
            AppText.label('ভয়েসে বলুন', color: AppColors.primary),
          ],
        ),
      ),
    );
  }
  
  Widget? _buildSuffix() {
    if (suffixIcon == null) return null;
    return IconButton(
      icon: Icon(suffixIcon),
      onPressed: onSuffixTap,
    );
  }
}
```

### 4.2 AppDropdown

```dart
// lib/components/molecules/app_dropdown.dart

class AppDropdown<T> extends StatelessWidget {
  final String label;
  final String? hint;
  final T? value;
  final List<AppDropdownItem<T>> items;
  final ValueChanged<T?>? onChanged;
  final String? errorText;
  final bool enabled;
  final bool searchable;
  
  const AppDropdown({
    Key? key,
    required this.label,
    required this.items,
    this.hint,
    this.value,
    this.onChanged,
    this.errorText,
    this.enabled = true,
    this.searchable = false,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppText.label(label),
        const SizedBox(height: AppSpacing.xs),
        DropdownButtonFormField<T>(
          value: value,
          hint: hint != null ? Text(hint!) : null,
          items: items.map((item) => DropdownMenuItem<T>(
            value: item.value,
            child: Row(
              children: [
                if (item.icon != null) ...[
                  Icon(item.icon, size: 20),
                  const SizedBox(width: 8),
                ],
                Text(item.label),
              ],
            ),
          )).toList(),
          onChanged: enabled ? onChanged : null,
          decoration: InputDecoration(
            errorText: errorText,
          ),
        ),
      ],
    );
  }
}

class AppDropdownItem<T> {
  final T value;
  final String label;
  final IconData? icon;
  
  const AppDropdownItem({
    required this.value,
    required this.label,
    this.icon,
  });
}
```

### 4.3 AppPhoneInput

```dart
// lib/components/molecules/app_phone_input.dart

class AppPhoneInput extends StatelessWidget {
  final String label;
  final String? value;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  final bool enabled;
  final TextEditingController? controller;
  
  const AppPhoneInput({
    Key? key,
    this.label = 'ফোন নম্বর',
    this.value,
    this.onChanged,
    this.errorText,
    this.enabled = true,
    this.controller,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppText.label(label),
        const SizedBox(height: AppSpacing.xs),
        TextFormField(
          controller: controller,
          initialValue: controller == null ? value : null,
          onChanged: onChanged,
          enabled: enabled,
          keyboardType: TextInputType.phone,
          maxLength: 11,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            _PhoneNumberFormatter(),
          ],
          style: AppTextStyles.bodyLarge.copyWith(
            fontFamily: AppTypography.fontFamilyMono,
            letterSpacing: 1,
          ),
          decoration: InputDecoration(
            hintText: '01X-XXXX-XXXX',
            errorText: errorText,
            counterText: '',
            prefixIcon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Image.asset('assets/flags/bd.png', width: 24),
                  const SizedBox(width: 4),
                  AppText.body('+880'),
                ],
              ),
            ),
            prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
          ),
        ),
      ],
    );
  }
}

class _PhoneNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text.replaceAll('-', '');
    if (text.length <= 3) {
      return newValue.copyWith(text: text);
    } else if (text.length <= 7) {
      return newValue.copyWith(
        text: '${text.substring(0, 3)}-${text.substring(3)}',
      );
    } else {
      return newValue.copyWith(
        text: '${text.substring(0, 3)}-${text.substring(3, 7)}-${text.substring(7)}',
      );
    }
  }
}
```

### 4.4 AppOtpInput

```dart
// lib/components/molecules/app_otp_input.dart

class AppOtpInput extends StatefulWidget {
  final int length;
  final ValueChanged<String>? onCompleted;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  
  const AppOtpInput({
    Key? key,
    this.length = 6, // OTP_LENGTH — canonical system value
    this.onCompleted,
    this.onChanged,
    this.errorText,
  }) : super(key: key);
  
  @override
  State<AppOtpInput> createState() => _AppOtpInputState();
}

class _AppOtpInputState extends State<AppOtpInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  
  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
  }
  
  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.length, (index) => 
            Padding(
              padding: EdgeInsets.symmetric(horizontal: AppSpacing.xs),
              child: SizedBox(
                width: 56,
                height: 64,
                child: TextFormField(
                  controller: _controllers[index],
                  focusNode: _focusNodes[index],
                  textAlign: TextAlign.center,
                  keyboardType: TextInputType.number,
                  maxLength: 1,
                  style: AppTextStyles.displayMedium.copyWith(
                    fontFamily: AppTypography.fontFamilyMono,
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    border: OutlineInputBorder(
                      borderRadius: AppRadius.borderMd,
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: AppRadius.borderMd,
                      borderSide: BorderSide(color: AppColors.error),
                    ),
                  ),
                  onChanged: (value) => _onDigitChanged(index, value),
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                ),
              ),
            ),
          ),
        ),
        if (widget.errorText != null) ...[
          const SizedBox(height: AppSpacing.sm),
          AppText.caption(widget.errorText!, color: AppColors.error),
        ],
      ],
    );
  }
  
  void _onDigitChanged(int index, String value) {
    if (value.isNotEmpty && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    
    final otp = _controllers.map((c) => c.text).join();
    widget.onChanged?.call(otp);
    
    if (otp.length == widget.length) {
      widget.onCompleted?.call(otp);
    }
  }
}
```

### 4.5 VoiceInputButton

**Scope:** UI component documented for Phase 2+ voice assistant (`APP_FLOW.md`). MVP may ship the widget with `VoiceInputState.idle` only; speech-to-text pipeline is not MVP-critical (see `PHASE0_FINAL_REVIEW.md` CONF-M005).

```dart
// lib/components/molecules/voice_input_button.dart

enum VoiceInputState {
  idle,
  listening,
  processing,
  error,
}

class VoiceInputButton extends StatelessWidget {
  final VoiceInputState state;
  final VoidCallback? onTap;
  final VoidCallback? onLongPressStart;
  final VoidCallback? onLongPressEnd;
  final double size;
  
  const VoiceInputButton({
    Key? key,
    this.state = VoiceInputState.idle,
    this.onTap,
    this.onLongPressStart,
    this.onLongPressEnd,
    this.size = 56,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onLongPressStart: (_) => onLongPressStart?.call(),
      onLongPressEnd: (_) => onLongPressEnd?.call(),
      child: AnimatedContainer(
        duration: AppAnimation.fast,
        width: size,
        height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: _getBackgroundColor(),
          boxShadow: state == VoiceInputState.listening
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ]
              : AppElevation.level2,
        ),
        child: _buildContent(),
      ),
    );
  }
  
  Color _getBackgroundColor() {
    switch (state) {
      case VoiceInputState.idle:
        return AppColors.primary;
      case VoiceInputState.listening:
        return AppColors.error;
      case VoiceInputState.processing:
        return AppColors.primary;
      case VoiceInputState.error:
        return AppColors.error;
    }
  }
  
  Widget _buildContent() {
    switch (state) {
      case VoiceInputState.idle:
        return Icon(Icons.mic_rounded, color: AppColors.white, size: size * 0.5);
      case VoiceInputState.listening:
        return _buildPulsingMic();
      case VoiceInputState.processing:
        return SizedBox(
          width: size * 0.4,
          height: size * 0.4,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation(AppColors.white),
          ),
        );
      case VoiceInputState.error:
        return Icon(Icons.mic_off_rounded, color: AppColors.white, size: size * 0.5);
    }
  }
  
  Widget _buildPulsingMic() {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.8, end: 1.0),
      duration: const Duration(milliseconds: 500),
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Icon(Icons.mic_rounded, color: AppColors.white, size: size * 0.5),
        );
      },
      onEnd: () {
        // Repeat animation
      },
    );
  }
}
```

---

## 5. Display Components

### 5.1 AppCard

```dart
// lib/components/molecules/app_card.dart

enum AppCardVariant {
  elevated,    // With shadow
  outlined,    // With border
  filled,      // Filled background
}

class AppCard extends StatelessWidget {
  final Widget child;
  final AppCardVariant variant;
  final EdgeInsets? padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;
  final BorderRadius? borderRadius;
  
  const AppCard({
    Key? key,
    required this.child,
    this.variant = AppCardVariant.elevated,
    this.padding,
    this.onTap,
    this.backgroundColor,
    this.borderRadius,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final decoration = _getDecoration();
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding ?? AppSpacing.allMd,
        decoration: decoration,
        child: child,
      ),
    );
  }
  
  BoxDecoration _getDecoration() {
    final radius = borderRadius ?? AppRadius.borderMd;
    final bgColor = backgroundColor ?? AppColors.surfaceCard;
    
    switch (variant) {
      case AppCardVariant.elevated:
        return BoxDecoration(
          color: bgColor,
          borderRadius: radius,
          boxShadow: AppElevation.level1,
        );
      
      case AppCardVariant.outlined:
        return BoxDecoration(
          color: bgColor,
          borderRadius: radius,
          border: Border.all(color: AppColors.borderDefault),
        );
      
      case AppCardVariant.filled:
        return BoxDecoration(
          color: bgColor,
          borderRadius: radius,
        );
    }
  }
}
```

### 5.2 AppListTile

```dart
// lib/components/molecules/app_list_tile.dart

class AppListTile extends StatelessWidget {
  final Widget? leading;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final EdgeInsets? padding;
  final Color? backgroundColor;
  final bool showDivider;
  
  const AppListTile({
    Key? key,
    this.leading,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.padding,
    this.backgroundColor,
    this.showDivider = true,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          child: Container(
            padding: padding ?? AppSpacing.allMd,
            color: backgroundColor,
            child: Row(
              children: [
                if (leading != null) ...[
                  leading!,
                  const SizedBox(width: AppSpacing.md),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AppText.title(title, maxLines: 1),
                      if (subtitle != null) ...[
                        const SizedBox(height: AppSpacing.xxs),
                        AppText.caption(subtitle!, maxLines: 2),
                      ],
                    ],
                  ),
                ),
                if (trailing != null) ...[
                  const SizedBox(width: AppSpacing.md),
                  trailing!,
                ],
              ],
            ),
          ),
        ),
        if (showDivider)
          Divider(height: 1, indent: leading != null ? 72 : 16),
      ],
    );
  }
}
```

### 5.3 AppStatusBadge

```dart
// lib/components/molecules/app_status_badge.dart

class AppStatusBadge extends StatelessWidget {
  final RequestStatus status;
  final bool showIcon;
  final bool large;
  
  const AppStatusBadge({
    Key? key,
    required this.status,
    this.showIcon = true,
    this.large = false,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final config = _getConfig();
    
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: large ? 12 : 8,
        vertical: large ? 6 : 4,
      ),
      decoration: BoxDecoration(
        color: config.backgroundColor,
        borderRadius: BorderRadius.circular(AppRadius.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(
              config.icon,
              size: large ? 16 : 12,
              color: config.foregroundColor,
            ),
            SizedBox(width: large ? 6 : 4),
          ],
          Text(
            config.label,
            style: (large ? AppTextStyles.labelMedium : AppTextStyles.labelSmall)
                .copyWith(color: config.foregroundColor),
          ),
        ],
      ),
    );
  }
  
  _StatusConfig _getConfig() {
    switch (status) {
      case RequestStatus.pending:
        return _StatusConfig(
          label: 'অপেক্ষায়',
          icon: Icons.schedule_rounded,
          backgroundColor: Color(0xFFFEF9C3),
          foregroundColor: AppColors.warning,
        );
      case RequestStatus.processing:
        return _StatusConfig(
          label: 'প্রক্রিয়াধীন',
          icon: Icons.sync_rounded,
          backgroundColor: Color(0xFFDBEAFE),
          foregroundColor: AppColors.info,
        );
      case RequestStatus.assigned:
        return _StatusConfig(
          label: 'ডাক্তার পাওয়া গেছে',
          icon: Icons.person_rounded,
          backgroundColor: AppColors.primaryLight,
          foregroundColor: AppColors.primaryDark,
        );
      case RequestStatus.inProgress:
        return _StatusConfig(
          label: 'চলমান',
          icon: Icons.play_circle_rounded,
          backgroundColor: AppColors.primaryLight,
          foregroundColor: AppColors.primary,
        );
      case RequestStatus.completed:
        return _StatusConfig(
          label: 'সম্পন্ন',
          icon: Icons.check_circle_rounded,
          backgroundColor: Color(0xFFDCFCE7),
          foregroundColor: AppColors.success,
        );
      case RequestStatus.cancelled:
        return _StatusConfig(
          label: 'বাতিল',
          icon: Icons.cancel_rounded,
          backgroundColor: AppColors.gray100,
          foregroundColor: AppColors.gray600,
        );
      case RequestStatus.emergency:
        return _StatusConfig(
          label: 'জরুরি',
          icon: Icons.emergency_rounded,
          backgroundColor: Color(0xFFFEE2E2),
          foregroundColor: AppColors.emergency,
        );
    }
  }
}

class _StatusConfig {
  final String label;
  final IconData icon;
  final Color backgroundColor;
  final Color foregroundColor;
  
  const _StatusConfig({
    required this.label,
    required this.icon,
    required this.backgroundColor,
    required this.foregroundColor,
  });
}
```

---

## 6. Navigation Components

### 6.1 AppBottomNavBar

```dart
// lib/components/organisms/app_bottom_nav_bar.dart

class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final List<AppNavItem> items;
  final ValueChanged<int>? onTap;
  final Widget? floatingActionButton;
  
  const AppBottomNavBar({
    Key? key,
    required this.currentIndex,
    required this.items,
    this.onTap,
    this.floatingActionButton,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 64,
          child: Row(
            children: items.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              
              if (item.isFloating) {
                return Expanded(
                  child: Center(
                    child: floatingActionButton ?? _buildFAB(item, index),
                  ),
                );
              }
              
              return Expanded(
                child: _buildNavItem(item, index),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
  
  Widget _buildNavItem(AppNavItem item, int index) {
    final isSelected = index == currentIndex;
    
    return GestureDetector(
      onTap: () => onTap?.call(index),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(
                isSelected ? item.activeIcon ?? item.icon : item.icon,
                color: isSelected ? AppColors.primary : AppColors.gray400,
                size: 24,
              ),
              if (item.badge != null && item.badge! > 0)
                Positioned(
                  top: -4,
                  right: -8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.error,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    constraints: const BoxConstraints(minWidth: 16),
                    child: Text(
                      item.badge! > 99 ? '99+' : item.badge.toString(),
                      style: AppTextStyles.labelSmall.copyWith(
                        color: AppColors.white,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            item.label,
            style: AppTextStyles.labelSmall.copyWith(
              color: isSelected ? AppColors.primary : AppColors.gray400,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildFAB(AppNavItem item, int index) {
    return GestureDetector(
      onTap: () => onTap?.call(index),
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.primary,
          shape: BoxShape.circle,
          boxShadow: AppElevation.level3,
        ),
        child: Icon(
          item.icon,
          color: AppColors.white,
          size: 28,
        ),
      ),
    );
  }
}

class AppNavItem {
  final String label;
  final IconData icon;
  final IconData? activeIcon;
  final int? badge;
  final bool isFloating;
  
  const AppNavItem({
    required this.label,
    required this.icon,
    this.activeIcon,
    this.badge,
    this.isFloating = false,
  });
}
```

### 6.2 AppAppBar

```dart
// lib/components/organisms/app_app_bar.dart

class AppAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final Widget? titleWidget;
  final bool showBackButton;
  final VoidCallback? onBackPressed;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final bool centerTitle;
  final double elevation;
  
  const AppAppBar({
    Key? key,
    this.title,
    this.titleWidget,
    this.showBackButton = true,
    this.onBackPressed,
    this.actions,
    this.backgroundColor,
    this.centerTitle = true,
    this.elevation = 0,
  }) : super(key: key);
  
  @override
  Size get preferredSize => const Size.fromHeight(56);
  
  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: titleWidget ?? (title != null ? AppText.title(title!) : null),
      centerTitle: centerTitle,
      backgroundColor: backgroundColor ?? AppColors.bgPrimary,
      elevation: elevation,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back_rounded),
              onPressed: onBackPressed ?? () => Navigator.of(context).pop(),
              tooltip: 'পিছনে যান',
            )
          : null,
      actions: actions,
    );
  }
}
```

---

## 7. Feedback Components

### 7.1 AppDialog

```dart
// lib/components/organisms/app_dialog.dart

class AppDialog extends StatelessWidget {
  final String title;
  final String? message;
  final Widget? content;
  final String? primaryButtonLabel;
  final VoidCallback? onPrimaryPressed;
  final String? secondaryButtonLabel;
  final VoidCallback? onSecondaryPressed;
  final bool isDanger;
  final bool dismissible;
  
  const AppDialog({
    Key? key,
    required this.title,
    this.message,
    this.content,
    this.primaryButtonLabel,
    this.onPrimaryPressed,
    this.secondaryButtonLabel,
    this.onSecondaryPressed,
    this.isDanger = false,
    this.dismissible = true,
  }) : super(key: key);
  
  static Future<T?> show<T>(
    BuildContext context, {
    required String title,
    String? message,
    Widget? content,
    String? primaryButtonLabel,
    VoidCallback? onPrimaryPressed,
    String? secondaryButtonLabel,
    VoidCallback? onSecondaryPressed,
    bool isDanger = false,
    bool dismissible = true,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: dismissible,
      builder: (context) => AppDialog(
        title: title,
        message: message,
        content: content,
        primaryButtonLabel: primaryButtonLabel,
        onPrimaryPressed: onPrimaryPressed,
        secondaryButtonLabel: secondaryButtonLabel,
        onSecondaryPressed: onSecondaryPressed,
        isDanger: isDanger,
        dismissible: dismissible,
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: AppRadius.borderXl),
      child: Padding(
        padding: AppSpacing.allXl,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppText.headline(title, textAlign: TextAlign.center),
            if (message != null) ...[
              const SizedBox(height: AppSpacing.md),
              AppText.body(message!, textAlign: TextAlign.center),
            ],
            if (content != null) ...[
              const SizedBox(height: AppSpacing.md),
              content!,
            ],
            const SizedBox(height: AppSpacing.xl),
            Row(
              children: [
                if (secondaryButtonLabel != null) ...[
                  Expanded(
                    child: AppButton(
                      label: secondaryButtonLabel!,
                      variant: AppButtonVariant.secondary,
                      onPressed: () {
                        Navigator.of(context).pop();
                        onSecondaryPressed?.call();
                      },
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                ],
                Expanded(
                  child: AppButton(
                    label: primaryButtonLabel ?? 'ঠিক আছে',
                    variant: isDanger ? AppButtonVariant.danger : AppButtonVariant.primary,
                    onPressed: () {
                      Navigator.of(context).pop();
                      onPrimaryPressed?.call();
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

### 7.2 AppBottomSheet

```dart
// lib/components/organisms/app_bottom_sheet.dart

class AppBottomSheet extends StatelessWidget {
  final String? title;
  final Widget child;
  final bool showDragHandle;
  final bool showCloseButton;
  final double? maxHeight;
  
  const AppBottomSheet({
    Key? key,
    this.title,
    required this.child,
    this.showDragHandle = true,
    this.showCloseButton = false,
    this.maxHeight,
  }) : super(key: key);
  
  static Future<T?> show<T>(
    BuildContext context, {
    String? title,
    required Widget child,
    bool showDragHandle = true,
    bool showCloseButton = false,
    double? maxHeight,
    bool isScrollControlled = true,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: isScrollControlled,
      backgroundColor: Colors.transparent,
      builder: (context) => AppBottomSheet(
        title: title,
        showDragHandle: showDragHandle,
        showCloseButton: showCloseButton,
        maxHeight: maxHeight,
        child: child,
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: maxHeight ?? MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: BoxDecoration(
        color: AppColors.bgPrimary,
        borderRadius: AppRadius.topXxl,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showDragHandle) _buildDragHandle(),
          if (title != null || showCloseButton) _buildHeader(context),
          Flexible(child: child),
        ],
      ),
    );
  }
  
  Widget _buildDragHandle() {
    return Padding(
      padding: const EdgeInsets.only(top: 12, bottom: 8),
      child: Container(
        width: 40,
        height: 4,
        decoration: BoxDecoration(
          color: AppColors.gray300,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
  
  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: AppSpacing.horizontalMd,
      child: Row(
        children: [
          if (title != null) Expanded(child: AppText.headline(title!)),
          if (showCloseButton)
            IconButton(
              icon: const Icon(Icons.close_rounded),
              onPressed: () => Navigator.of(context).pop(),
            ),
        ],
      ),
    );
  }
}
```

### 7.3 AppSnackbar

```dart
// lib/components/feedback/app_snackbar.dart

enum AppSnackbarVariant {
  info,
  success,
  warning,
  error,
}

class AppSnackbar {
  static void show(
    BuildContext context, {
    required String message,
    AppSnackbarVariant variant = AppSnackbarVariant.info,
    String? actionLabel,
    VoidCallback? onAction,
    Duration duration = const Duration(seconds: 3),
  }) {
    final config = _getConfig(variant);
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(config.icon, color: AppColors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.white),
              ),
            ),
          ],
        ),
        backgroundColor: config.color,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.borderSm),
        action: actionLabel != null
            ? SnackBarAction(
                label: actionLabel,
                textColor: AppColors.white,
                onPressed: onAction ?? () {},
              )
            : null,
      ),
    );
  }
  
  static _SnackbarConfig _getConfig(AppSnackbarVariant variant) {
    switch (variant) {
      case AppSnackbarVariant.info:
        return _SnackbarConfig(Icons.info_rounded, AppColors.info);
      case AppSnackbarVariant.success:
        return _SnackbarConfig(Icons.check_circle_rounded, AppColors.success);
      case AppSnackbarVariant.warning:
        return _SnackbarConfig(Icons.warning_rounded, AppColors.warning);
      case AppSnackbarVariant.error:
        return _SnackbarConfig(Icons.error_rounded, AppColors.error);
    }
  }
}

class _SnackbarConfig {
  final IconData icon;
  final Color color;
  
  const _SnackbarConfig(this.icon, this.color);
}
```

---

## 8. Domain Components

### 8.1 AnimalCard

```dart
// lib/components/domain/animal/animal_card.dart

class AnimalCard extends StatelessWidget {
  final Animal animal;
  final VoidCallback? onTap;
  final bool selected;
  final bool showHealthStatus;
  
  const AnimalCard({
    Key? key,
    required this.animal,
    this.onTap,
    this.selected = false,
    this.showHealthStatus = true,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AppCard(
        variant: selected ? AppCardVariant.outlined : AppCardVariant.elevated,
        backgroundColor: selected ? AppColors.primaryLight : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Animal icon/image
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: _buildAnimalIcon(),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            
            // Name
            AppText.title(animal.name, maxLines: 1, textAlign: TextAlign.center),
            
            // Species
            AppText.caption(animal.species.label, textAlign: TextAlign.center),
            
            // Health status
            if (showHealthStatus && animal.lastHealthStatus != null) ...[
              const SizedBox(height: AppSpacing.xs),
              _buildHealthIndicator(),
            ],
            
            // Selected indicator
            if (selected) ...[
              const SizedBox(height: AppSpacing.xs),
              Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 20),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildAnimalIcon() {
    // Return appropriate animal icon based on species
    switch (animal.species) {
      case AnimalSpecies.cow:
        return Text('🐄', style: TextStyle(fontSize: 32));
      case AnimalSpecies.goat:
        return Text('🐐', style: TextStyle(fontSize: 32));
      case AnimalSpecies.chicken:
        return Text('🐔', style: TextStyle(fontSize: 32));
      case AnimalSpecies.duck:
        return Text('🦆', style: TextStyle(fontSize: 32));
      case AnimalSpecies.sheep:
        return Text('🐑', style: TextStyle(fontSize: 32));
      default:
        return Text('🐾', style: TextStyle(fontSize: 32));
    }
  }
  
  Widget _buildHealthIndicator() {
    final color = animal.lastHealthStatus == 'healthy'
        ? AppColors.success
        : AppColors.warning;
    
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        AppText.caption(
          animal.lastHealthStatus == 'healthy' ? 'সুস্থ' : 'চিকিৎসায়',
          color: color,
        ),
      ],
    );
  }
}
```

### 8.2 EmergencyBanner

```dart
// lib/components/domain/emergency/emergency_banner.dart

class EmergencyBanner extends StatelessWidget {
  final VoidCallback onTap;
  
  const EmergencyBanner({
    Key? key,
    required this.onTap,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: AppSpacing.allMd,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.emergency, Color(0xFFB91C1C)],
          ),
          borderRadius: AppRadius.borderMd,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.emergency_rounded,
                color: AppColors.white,
                size: 24,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppText.title(
                    'জরুরি সাহায্য প্রয়োজন?',
                    color: AppColors.white,
                  ),
                  AppText.caption(
                    'এখনই ডাক্তার কল করুন',
                    color: AppColors.white.withOpacity(0.8),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: AppRadius.borderFull,
              ),
              child: AppText.label('এখনই কল করুন', color: AppColors.emergency),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 9. Loading & Error UX

### 9.1 LoadingIndicator

```dart
// lib/shared/widgets/loading_indicator.dart

enum LoadingSize { small, medium, large }

class LoadingIndicator extends StatelessWidget {
  final LoadingSize size;
  final String? message;
  final Color? color;
  
  const LoadingIndicator({
    Key? key,
    this.size = LoadingSize.medium,
    this.message,
    this.color,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: _getSize(),
            height: _getSize(),
            child: CircularProgressIndicator(
              strokeWidth: size == LoadingSize.small ? 2 : 3,
              valueColor: AlwaysStoppedAnimation(color ?? AppColors.primary),
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: AppSpacing.md),
            AppText.body(message!, color: AppColors.textSecondary),
          ],
        ],
      ),
    );
  }
  
  double _getSize() {
    switch (size) {
      case LoadingSize.small: return 20;
      case LoadingSize.medium: return 36;
      case LoadingSize.large: return 48;
    }
  }
}
```

### 9.2 EmptyStateWidget

```dart
// lib/shared/widgets/empty_state_widget.dart

class EmptyStateWidget extends StatelessWidget {
  final String title;
  final String? message;
  final IconData? icon;
  final String? actionLabel;
  final VoidCallback? onAction;
  
  const EmptyStateWidget({
    Key? key,
    this.title = 'কোন তথ্য নেই',
    this.message,
    this.icon,
    this.actionLabel,
    this.onAction,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.allXl,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.gray100,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon ?? Icons.inbox_rounded,
                size: 48,
                color: AppColors.gray400,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppText.headline(title, textAlign: TextAlign.center),
            if (message != null) ...[
              const SizedBox(height: AppSpacing.sm),
              AppText.body(
                message!,
                textAlign: TextAlign.center,
                color: AppColors.textSecondary,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: AppSpacing.xl),
              AppButton(
                label: actionLabel!,
                onPressed: onAction,
                isFullWidth: false,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

### 9.3 ErrorStateWidget

```dart
// lib/shared/widgets/error_state_widget.dart

class ErrorStateWidget extends StatelessWidget {
  final String? title;
  final String? message;
  final VoidCallback? onRetry;
  final String retryLabel;
  
  const ErrorStateWidget({
    Key? key,
    this.title,
    this.message,
    this.onRetry,
    this.retryLabel = 'আবার চেষ্টা করুন',
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.allXl,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Color(0xFFFEE2E2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.error_outline_rounded,
                size: 48,
                color: AppColors.error,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            AppText.headline(
              title ?? 'কিছু ভুল হয়েছে',
              textAlign: TextAlign.center,
            ),
            if (message != null) ...[
              const SizedBox(height: AppSpacing.sm),
              AppText.body(
                message!,
                textAlign: TextAlign.center,
                color: AppColors.textSecondary,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: AppSpacing.xl),
              AppButton(
                label: retryLabel,
                onPressed: onRetry,
                leadingIcon: Icons.refresh_rounded,
                isFullWidth: false,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
```

### 9.4 OfflineIndicator

```dart
// lib/shared/widgets/offline_indicator.dart

class OfflineIndicator extends StatelessWidget {
  final VoidCallback? onRetry;
  
  const OfflineIndicator({
    Key? key,
    this.onRetry,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: AppSpacing.allMd,
      color: AppColors.warning,
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Icon(Icons.wifi_off_rounded, color: AppColors.white, size: 20),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: AppText.body(
                'অফলাইন • সীমিত সুবিধা',
                color: AppColors.white,
              ),
            ),
            if (onRetry != null)
              GestureDetector(
                onTap: onRetry,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.2),
                    borderRadius: AppRadius.borderFull,
                  ),
                  child: AppText.label('আবার চেষ্টা', color: AppColors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
```

---

## 10. Component Documentation

### 10.1 Documentation Template

```dart
/// A customizable button component following Prani Doctor design system.
/// 
/// ## Example
/// ```dart
/// AppButton(
///   label: 'সেভ করুন',
///   onPressed: () => saveData(),
///   variant: AppButtonVariant.primary,
///   size: AppButtonSize.large,
/// )
/// ```
/// 
/// ## Variants
/// - `primary`: Green filled button for main actions
/// - `secondary`: Outlined button for secondary actions
/// - `tertiary`: Text-only button for minimal emphasis
/// - `danger`: Red button for destructive actions
/// - `emergency`: Prominent red button for emergency actions
/// 
/// ## Accessibility
/// - Minimum touch target: 48dp
/// - Supports semantic labels
/// - Proper contrast ratios
/// 
/// See also:
/// - [AppButtonVariant] for available variants
/// - [AppButtonSize] for size options
class AppButton extends StatelessWidget { ... }
```

### 10.2 Component Checklist

| Requirement | Check |
|-------------|-------|
| Design tokens used (no hardcoded values) | ☐ |
| Proper semanticLabel for accessibility | ☐ |
| Minimum 48dp touch target | ☐ |
| Bangla label support | ☐ |
| Loading state handled | ☐ |
| Error state handled | ☐ |
| Disabled state handled | ☐ |
| Theme-aware colors | ☐ |
| Documentation complete | ☐ |
| Test coverage | ☐ |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Component Team | Initial release |

---

*End of COMPONENT_SYSTEM.md*
