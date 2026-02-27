import { useThemeState, useValidateTheme } from 'data/settings/Theme';
import { useEffect } from 'react';
import { DefaultTheme } from 'utils/localStorage';

const InitTheme = () => {
  const [theme, setTheme] = useThemeState();
  const validate = useValidateTheme();
  const valid = validate(theme);

  useEffect(() => {
    setTheme(valid ? theme : DefaultTheme);
  }, [valid, theme, setTheme]);

  return null;
};

export default InitTheme;
