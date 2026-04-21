import { LightColors, DarkColors } from '../constants/Theme';
import { useTheme } from '../context/ThemeContext';

export function useThemeColors() {
  const { theme } = useTheme();
  return theme === 'light' ? LightColors : DarkColors;
}
