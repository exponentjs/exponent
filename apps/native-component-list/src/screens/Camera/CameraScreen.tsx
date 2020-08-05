import {
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
} from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import isIPhoneX from 'react-native-is-iphonex';

import { face, landmarks } from '../../components/Face';
import GalleryScreen from './GalleryScreen';

interface Picture {
  width: number;
  height: number;
  uri: string;
  base64?: string;
  exif?: any;
}

const flashModeOrder: { [key: string]: string } = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const flashIcons: { [key: string]: string } = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight',
};

const wbOrder: { [key: string]: string } = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const wbIcons: { [key: string]: string } = {
  auto: 'wb-auto',
  sunny: 'wb-sunny',
  cloudy: 'wb-cloudy',
  shadow: 'beach-access',
  fluorescent: 'wb-iridescent',
  incandescent: 'wb-incandescent',
};

const photos: Picture[] = [];

interface State {
  flash: string;
  zoom: number;
  autoFocus: string;
  type: string;
  depth: number;
  whiteBalance: string;
  ratio: string;
  ratios: any[];
  barcodeScanning: boolean;
  faceDetecting: boolean;
  faces: any[];
  newPhotos: boolean;
  permissionsGranted: boolean;
  permission?: Permissions.PermissionStatus;
  pictureSize?: any;
  pictureSizes: any[];
  pictureSizeId: number;
  showGallery: boolean;
  showMoreOptions: boolean;
}

export default class CameraScreen extends React.Component<{}, State> {
  readonly state: State = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    type: 'back',
    depth: 0,
    whiteBalance: 'auto',
    ratio: '16:9',
    ratios: [],
    barcodeScanning: false,
    faceDetecting: false,
    faces: [],
    newPhotos: false,
    permissionsGranted: false,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
    showMoreOptions: false,
  };

  camera?: Camera;

  async componentDidMount() {
    if (Platform.OS === 'web') {
      return;
    }

    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permission: status, permissionsGranted: status === 'granted' });

    try {
      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos');
    } catch (error) {
      // tslint:disable-next-line no-console
      console.log(error, 'Directory exists');
    }
  }

  getRatios = async () => this.camera!.getSupportedRatiosAsync();

  toggleView = () => this.setState({ showGallery: !this.state.showGallery, newPhotos: false });

  toggleMoreOptions = () => this.setState({ showMoreOptions: !this.state.showMoreOptions });

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  setRatio = (ratio: string) => this.setState({ ratio });

  toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

  toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

  zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

  zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

  setFocusDepth = (depth: number) => this.setState({ depth });

  toggleBarcodeScanning = () => this.setState({ barcodeScanning: !this.state.barcodeScanning });

  toggleFaceDetection = () => this.setState({ faceDetecting: !this.state.faceDetecting });

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  };

  // tslint:disable-next-line no-console
  handleMountError = ({ message }: { message: string }) => console.error(message);

  onPictureSaved = async (photo: Picture) => {
    if (Platform.OS === 'web') {
      photos.push(photo);
    } else {
      await FileSystem.moveAsync({
        from: photo.uri,
        to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
      });
    }
    this.setState({ newPhotos: true });
  };

  onBarCodeScanned = (code: { type: string; data: string }) => {
    this.setState({ barcodeScanning: !this.state.barcodeScanning }, () =>
      Alert.alert(`Barcode found: ${code.data}`)
    );
  };

  onFacesDetected = ({ faces }: { faces: any }) => this.setState({ faces });

  collectPictureSizes = async () => {
    if (this.camera) {
      const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
      let pictureSizeId = 0;
      if (Platform.OS === 'ios') {
        pictureSizeId = pictureSizes.indexOf('High');
      } else {
        // returned array is sorted in ascending order - default size is the largest one
        pictureSizeId = pictureSizes.length - 1;
      }
      this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
    }
  };

  previousPictureSize = () => this.changePictureSize(1);
  nextPictureSize = () => this.changePictureSize(-1);

  changePictureSize = (direction: number) => {
    let newId = this.state.pictureSizeId + direction;
    const length = this.state.pictureSizes.length;
    if (newId >= length) {
      newId = 0;
    } else if (newId < 0) {
      newId = length - 1;
    }
    this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
  };

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView} />;
  }

  renderFaces = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(face)}
    </View>
  );

  renderLandmarks = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(landmarks)}
    </View>
  );

  renderNoPermissions = () => (
    <View style={styles.noPermissions}>
      {this.state.permission && (
        <View>
          <Text style={{ color: '#4630ec', fontWeight: 'bold', textAlign: 'center', fontSize: 24 }}>
            Permission {this.state.permission.toLowerCase()}!
          </Text>
          <Text style={{ color: '#595959', textAlign: 'center', fontSize: 20 }}>
            You'll need to enable the camera permission to continue.
          </Text>
        </View>
      )}
    </View>
  );

  renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons name="ios-reverse-camera" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleWB}>
        <MaterialIcons name={wbIcons[this.state.whiteBalance]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
        <Text
          style={[
            styles.autoFocusLabel,
            { color: this.state.autoFocus === 'on' ? 'white' : '#6b6b6b' },
          ]}>
          AF
        </Text>
      </TouchableOpacity>
    </View>
  );

  renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleMoreOptions}>
        <Octicons name="kebab-horizontal" size={30} color="white" />
      </TouchableOpacity>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity onPress={this.takePicture} style={{ alignSelf: 'center' }}>
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
        <View>
          <Foundation name="thumbnails" size={30} color="white" />
          {this.state.newPhotos && <View style={styles.newPhotosDot} />}
        </View>
      </TouchableOpacity>
    </View>
  );

  renderMoreOptions = () => (
    <View style={styles.options}>
      <View style={styles.detectors}>
        <TouchableOpacity onPress={this.toggleFaceDetection}>
          <MaterialIcons
            name="tag-faces"
            size={32}
            color={this.state.faceDetecting ? 'white' : '#858585'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.toggleBarcodeScanning}>
          <MaterialCommunityIcons
            name="barcode-scan"
            size={32}
            color={this.state.barcodeScanning ? 'white' : '#858585'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.pictureSizeContainer}>
        <Text style={styles.pictureQualityLabel}>Picture quality</Text>
        <View style={styles.pictureSizeChooser}>
          <TouchableOpacity onPress={this.previousPictureSize} style={{ padding: 6 }}>
            <Ionicons name="md-arrow-dropleft" size={14} color="white" />
          </TouchableOpacity>
          <View style={styles.pictureSizeLabel}>
            <Text style={{ color: 'white' }}>{this.state.pictureSize}</Text>
          </View>
          <TouchableOpacity onPress={this.nextPictureSize} style={{ padding: 6 }}>
            <Ionicons name="md-arrow-dropright" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  renderCamera = () => (
    <View style={{ flex: 1 }}>
      <Camera
        ref={ref => (this.camera = ref!)}
        style={styles.camera}
        onCameraReady={this.collectPictureSizes}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        pictureSize={this.state.pictureSize}
        onMountError={this.handleMountError}
        onFacesDetected={this.state.faceDetecting ? this.onFacesDetected : undefined}
        faceDetectorSettings={{
          tracking: true,
        }}
        barCodeScannerSettings={{
          barCodeTypes: [
            BarCodeScanner.Constants.BarCodeType.qr,
            BarCodeScanner.Constants.BarCodeType.pdf417,
          ],
        }}
        onBarCodeScanError={({ nativeEvent }) => console.warn(nativeEvent)}
        onBarCodeScanned={this.state.barcodeScanning ? this.onBarCodeScanned : undefined}>
        {this.renderTopBar()}
        {this.renderBottomBar()}
      </Camera>
      {this.state.faceDetecting && this.renderFaces()}
      {this.state.faceDetecting && this.renderLandmarks()}
      {this.state.showMoreOptions && this.renderMoreOptions()}
    </View>
  );

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return <View style={styles.container}>{content}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight / 2,
  },
  bottomBar: {
    paddingBottom: isIPhoneX ? 25 : 5,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  noPermissions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f8fdff',
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomButton: {
    flex: 0.3,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPhotosDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4630EB',
  },
  options: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: '#000000BA',
    borderRadius: 4,
    padding: 10,
  },
  detectors: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pictureQualityLabel: {
    fontSize: 10,
    marginVertical: 3,
    color: 'white',
  },
  pictureSizeContainer: {
    flex: 0.5,
    alignItems: 'center',
    paddingTop: 10,
  },
  pictureSizeChooser: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  pictureSizeLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  row: {
    flexDirection: 'row',
  },
});
