import React from 'react';
import { StyleSheet, PixelRatio, View } from 'react-native';

import DevMenuContext, { Context } from '../DevMenuContext';
import { DevMenuAppInfoType, DevMenuItemAnyType } from '../DevMenuInternal';
import ListFooter from '../components/ListFooter';
import MainOptions from '../components/MainOptions';
import DevMenuGroup from '../components/items/DevMenuGroup';
import DevMenuAppInfo from './DevMenuAppInfo';

type Props = {
  appInfo: DevMenuAppInfoType;
  uuid: string;
  devMenuItems: DevMenuItemAnyType[];
  enableDevelopmentTools: boolean;
  showOnboardingView: boolean;
};

class DevMenuView extends React.PureComponent<Props, undefined> {
  static contextType = DevMenuContext;

  context!: Context;

  collapse = () => {
    this.context?.collapse?.();
  };

  renderItems() {
    return (
      <View testID="DevMenuMainScreen">
        <DevMenuGroup items={this.context.devMenuItems} />
        <MainOptions />
        <ListFooter label="This development menu will not be present in any release builds of this project." />
      </View>
    );
  }

  renderContent() {
    const { appInfo } = this.props;

    return (
      <>
        <DevMenuAppInfo appInfo={appInfo} />
        {this.renderItems()}
      </>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderContent()}
        {/* Enable this to test scrolling
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()}
        {this.renderContent()} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appInfo: {
    borderBottomWidth: 2 / PixelRatio.get(),
  },
});

export default DevMenuView;
