import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';

import { MainText } from '../components/Text';
import Colors from '../constants/Colors';
import { useThemeName } from '../hooks/useThemeName';
import Button from './Button';

type Props = {
  onPress: (url: string) => void;
};

const urlPattern = new RegExp(
  '^((\\w+)?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+([a-z]{2,})?|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i'
);

function validateURL(str: string): boolean {
  return urlPattern.test(str);
}

export default ({ onPress }: Props) => {
  const themeName = useThemeName();
  const [textInputUrl, setTextInputUrl] = React.useState('');
  const [isValid, setIsValid] = React.useState(true);

  const borderColor = themeName === 'dark' ? Colors.dark.border : Colors.light.border;
  const textColorName = isValid ? 'text' : 'error';
  const color = themeName === 'dark' ? Colors.dark[textColorName] : Colors.light[textColorName];

  return (
    <View>
      <MainText style={styles.textMarginBottom}>
        Or, enter the URL of a local bundler manually:
      </MainText>
      <TextInput
        testID="DevLauncherURLInput"
        style={[styles.urlTextInput, { borderColor, color }]}
        placeholder="exp://192..."
        placeholderTextColor="#b0b0ba"
        autoCapitalize="none"
        autoCorrect={false}
        autoCompleteType="off"
        defaultValue={textInputUrl}
        onChangeText={text => {
          setTextInputUrl(text);
          setIsValid(validateURL(text));
        }}
      />
      <Button
        testID="DevLauncherLoadAppButton"
        disabled={!isValid || !textInputUrl}
        onPress={() => onPress(textInputUrl)}
        label="Connect to URL"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  urlTextInput: {
    width: '100%',

    fontSize: 16,
    padding: 8,

    borderWidth: 1,

    borderRadius: 4,
    marginBottom: 8,
  },

  textMarginBottom: {
    marginBottom: 8,
  },
});
