const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const files = ['index.tsx', 'dashboard.tsx', 'orders-invoices.tsx', 'surat-jalan.tsx', 'invoice.tsx', 'customer-profile.tsx'];

const themePath = path.join(__dirname, 'constants', 'Theme.ts');
const themeCode = `export const DarkColors = {
  primary: '#ffe2aa',
  primaryContainer: '#fbc02d',
  surface: '#131313',
  surfaceBright: '#393939',
  surfaceVariant: 'rgba(53, 53, 53, 0.4)',
  onSurfaceVariant: '#d3c5ad',
  surfaceContainerHighest: '#353535',
  surfaceContainerLowest: '#0e0e0e',
  secondary: '#bbc8d0',
  outlineVariant: '#4f4633',
  outline: '#9c8f79',
  onSurface: '#e5e2e1',
  onPrimary: '#402d00',
  error: '#ffb4ab',
  blurTint: 'dark' as const
};

export const LightColors = {
  primary: '#d69400',
  primaryContainer: '#ffca58',
  surface: '#f6f7f9',
  surfaceBright: '#ffffff',
  surfaceVariant: 'rgba(255, 255, 255, 0.8)',
  onSurfaceVariant: '#5e5a52',
  surfaceContainerHighest: '#e8ecef',
  surfaceContainerLowest: '#ffffff',
  secondary: '#4b6574',
  outlineVariant: '#c4bcae',
  outline: '#9e9481',
  onSurface: '#121212',
  onPrimary: '#ffffff',
  error: '#ba1a1a',
  blurTint: 'light' as const
};

export const Typography = {
  fontFamily: 'Inter',
  sizes: {
    xs: 10, sm: 12, base: 14, lg: 16, xl: 20, title: 24, display: 36,
  }
};
`;

fs.writeFileSync(themePath, themeCode);

files.forEach(f => {
  const filePath = path.join(dir, f);
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf-8');

  // Insert useColorScheme / useMemo
  if (!code.includes('useColorScheme')) {
    code = code.replace("import { View,", "import { View, useColorScheme,");
    if (!code.includes('useColorScheme')) {
      code = code.replace("import { BlurView", "import { useColorScheme } from 'react-native';\\nimport { BlurView");
    }
  }
  if (!code.includes('useMemo(')) {
    code = code.replace("import React", "import React, { useMemo }");
    if (!code.includes('useMemo') && !code.includes('import React')) {
         code = "import React, { useMemo } from 'react';\n" + code;
    }
  }

  // Update Theme imports using string replace
  code = code.replace("import { Colors, Typography } from '../constants/Theme';", "import { DarkColors, LightColors, Typography } from '../constants/Theme';");
  code = code.replace("import { Colors } from '../constants/Theme';", "import { DarkColors, LightColors } from '../constants/Theme';");

  // Inject useColorScheme hook
  const componentRegex = new RegExp("export default function ([A-Za-z0-9_]+)\\\(\\)\\s*\\{");
  const match = code.match(componentRegex);
  if (match) {
    const compName = match[1];
    code = code.replace(
      match[0], 
      "export default function " + compName + "() {\\n  const colorScheme = useColorScheme();\\n  const Colors = colorScheme === 'light' ? LightColors : DarkColors;\\n  const styles = useMemo(() => getStyles(Colors), [colorScheme]);"
    );
  }

  // Rewrite StyleSheet.create to getStyles
  code = code.replace("const styles = StyleSheet.create({", "const getStyles = (Colors: any) => StyleSheet.create({");

  // Transform tint
  code = code.split('tint="dark"').join('tint={Colors.blurTint}');

  fs.writeFileSync(filePath, code);
});
console.log('Migration complete!');
