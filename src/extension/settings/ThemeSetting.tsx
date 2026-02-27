import { capitalize } from '@mui/material';
import { RadioGroup } from 'components/form';
import { useFindTheme, useThemeState } from 'data/settings/Theme';
import themes from 'styles/themes/themes';

const ThemeSetting = () => {
  const [theme, setTheme] = useThemeState();
  const find = useFindTheme();

  return (
    <RadioGroup
      options={themes.map(({ name }) => {
        return { value: name, label: capitalize(name) };
      })}
      value={theme.name}
      onChange={(name) => setTheme(find(name))}
    />
  );
};

export default ThemeSetting;
