const packageVersion = require('../package.json').version;
const prevaledNavigationData = require('./navigation-data');

// Groups of sections: these groups are exclusively expressed below, there is no
// representation of them in the filesystem!
// Groups -> Sections -> Pages
const GROUPS = {
  'The Basics': ['Conceptual Overview', 'Get Started', 'Tutorial', 'Next Steps'],
  Fundamentals: ['Fundamentals'],
  'UI Programming': ['UI Programming'],
  'Assorted Guides': ['Assorted Guides'],
  'Push Notifications': ['Push Notifications'],
  'Distributing Your App': ['Distributing Your App'],
  'Expo Accounts': ['Expo Accounts'],
  'Regulatory Compliance': ['Regulatory Compliance'],
  Deprecated: ['ExpoKit', 'Archived'],
  'Bare Workflow': ['Bare Workflow'],
  'Expo SDK': ['Expo SDK'],
  'Configuration Files': ['Configuration Files'],
  'React Native': ['React Native'],
  Preview: ['Preview'],
  'EAS Build': ['Start Building', 'App Signing', 'Reference'],
  'EAS Submit': ['EAS Submit'],
  'Technical Specs': ['Technical Specs'],
  'Development Clients': ['Development Clients'],
};

// This array provides the **ordering** for pages within each section
const sections = [
  {
    name: 'Preview',
    reference: ['Introduction', 'Support and feedback'],
  },
  {
    name: 'Start Building',
    reference: [
      'EAS Build',
      'Creating your first build',
      'Configuration with eas.json',
      'Over-the-air updates',
      'Internal distribution',
      'Triggering builds from CI',
    ],
  },
  {
    name: 'Archived',
    reference: [
      // Order doesn't matter probably, but put something here if you want to order it
    ],
  },
  {
    name: 'App Signing',
    reference: [
      'Using automatically managed credentials',
      'Using local credentials',
      'Using existing credentials',
      'Syncing credentials between remote and local sources',
    ],
  },
  {
    name: 'Reference',
    reference: [
      'Migrating from "expo build"',
      'Integrating with JavaScript tooling',
      'Environment variables and secrets',
      'Server infrastructure',
      'Caching dependencies',
      'Running builds on your own infrastructure',
      'Build webhooks',
      'Building APKs for Android emulators and devices',
      'Building for iOS simulators',
      'Configuration process',
      'Android build process',
      'iOS build process',
      'Limitations',
    ],
  },
  {
    name: 'EAS Submit',
    reference: [
      'EAS Submit',
      'Submitting to the Google Play Store',
      'Submitting to the Apple App Store',
    ],
  },
  {
    name: 'Technical Specs',
    reference: ['Expo Updates', 'Expo Structured Field Values'],
  },
  {
    name: 'Development Clients',
    reference: [
      'Introduction',
      'Getting Started',
      'Installation in React Native and Bare workflow projects',
      'Building with EAS',
      'Extending the Development Menu',
    ],
  },
  {
    name: 'Get Started',
    reference: ['Installation', 'Create a new app', 'Errors and debugging'],
  },
  {
    name: 'Conceptual Overview',
    reference: [
      'Workflows',
      'Walkthrough',
      'Limitations',
      'Frequently asked questions',
      'Common Questions',
    ],
  },
  {
    name: 'Tutorial',
    reference: [
      'First steps',
      'Styling text',
      'Adding an image',
      'Creating a button',
      'Picking an image',
      'Sharing the image',
      'Handling platform differences',
      'Configuring a splash screen and app icon',
      'Learning more',
    ],
  },
  {
    name: 'Next Steps',
    reference: ['Using the documentation', 'Join the community', 'Additional resources'],
  },
  {
    name: 'Expo Accounts',
    reference: [
      'Account Types',
      'Two-Factor Authentication',
      'Programmatic Access',
      'Working Together',
    ],
  },
  {
    name: 'Regulatory Compliance',
    reference: ['Data Privacy & Protection', 'Privacy Shield', 'HIPAA', 'GDPR'],
  },
  {
    name: 'Distributing Your App',
    reference: [
      'Overview',
      'Building Standalone Apps',
      'App Signing',
      'Deploying to App Stores',
      'Release Channels',
      'Advanced Release Channels',
      'Build Webhooks',
      'Hosting Updates on Your Servers',
      'Building Standalone Apps on Your CI',
      'Uploading Apps to the Apple App Store and Google Play',
      'App Transfers',
      'Security',
      'Data and Privacy Protection',
    ],
  },
  {
    name: 'ExpoKit',
    reference: [
      'Overview',
      'Detaching to ExpoKit',
      'Ejecting to ExpoKit',
      'Developing With ExpoKit',
      'Advanced ExpoKit Topics',
      'Universal Modules and ExpoKit',
    ],
  },
  {
    name: 'Fundamentals',
    reference: [
      'Expo CLI',
      'Using libraries',
      'Viewing logs',
      'Development and Production Mode',
      'iOS Simulator',
      'Android Studio Emulator',
      'Debugging',
      'Common Development Errors',
      'Configuration with app.json / app.config.js',
      'Publishing updates',
      'Upgrading Expo SDK',
      'Developing for Web',
      'Snack: a playground in your browser',
      'Adding custom native code',
      'Glossary of terms',
    ],
  },
  {
    name: 'UI Programming',
    reference: [
      'Styling a React Native Button',
      "Setting a component's background image",
      'Implementing a checkbox for Expo and React Native apps',
      'Stacking overlapping views with zIndex in Expo and React Native apps',
      'Using SVGs',
      'How to display a popup toast',
    ],
  },
  {
    name: 'Assorted Guides',
    reference: [
      'Assets',
      'Fonts',
      'Icons',
      'Routing & Navigation',
      'Permissions',
      'App Icons',
      'Create a Splash Screen',
      'Configuring the Status Bar',
      'Light and Dark modes',
      'TypeScript',
      'Authentication',
      'User Interface Component Libraries',
      'Asset Caching',
      'Environment variables in Expo',
      'Configuring OTA Updates',
      'Customizing Metro',
      'Customizing Webpack',
      'Offline Support',
      'Progressive Web Apps',
      'Web Performance',
      'Notification Channels',
      'Delaying Your Code To Run Later',
      'Error Handling',
      'Testing with Jest',
      'Account Permissions',
      'Crafting Educational Materials',
      'How Expo Works',
      'Linking',
      'Running in the Browser',
      'Setting up Continuous Integration',
      'Native Firebase',
      'Testing on physical devices',
      'Troubleshooting Proxies',
      'Custom Expo Go builds',
      'Using Firebase',
      'Using Sentry',
      'Using Bugsnag',
      'Using Modern JavaScript',
      'Using ClojureScript',
      'Using GraphQL',
      'Using Electron',
      'Using Gatsby',
      'Using Next.js',
      'Using Preact',
      'Using Styled Components',
    ],
  },
  {
    name: 'Bare Workflow',
    reference: [
      'Walkthrough',
      'Up and Running',
      'Using Libraries',
      'Existing Apps',
      'Installing react-native-unimodules',
      'Installing expo-updates',
      'Supported Expo SDK APIs',
      'Using Expo client',
      'Using Expo for web',
      'Ejecting from Managed Workflow',
      'Migrating from ExpoKit',
      'Updating your App',
    ],
  },
  {
    name: 'Push Notifications',
    reference: [
      'Push Notifications Overview',
      'Push Notifications Setup',
      "Sending Notifications with Expo's Push API",
      'Sending Notifications with APNs & FCM',
      'Receiving Notifications',
      'Using FCM for Push Notifications',
      'Troubleshooting and FAQ',
    ],
  },
  {
    name: 'Configuration Files',
    reference: ['app.json / app.config.js', 'metro.config.js'],
  },
  {
    name: 'React Native',
    reference: [
      'Learn the Basics',
      'Props',
      'State',
      'Style',
      'Height and Width',
      'Layout with Flexbox',
      'Handling Text Input',
      'Handling Touches',
      'Using a ScrollView',
      'Using List Views',
      'Networking',
      'Platform Specific Code',
      'Navigating Between Screens',
      'Images',
      'Animations',
      'Accessibility',
      'Timers',
      'Performance',
      'Gesture Responder System',
      'JavaScript Environment',
      'Direct Manipulation',
      'Color Reference',
      'ActivityIndicator',
      'Button',
      'DatePickerIOS',
      'DrawerLayoutAndroid',
      'FlatList',
      'Image',
      'InputAccessoryView',
      'KeyboardAvoidingView',
      'ListView',
      'MaskedViewIOS',
      'Modal',
      'NavigatorIOS',
      'Picker',
      'PickerIOS',
      'ProgressBarAndroid',
      'ProgressViewIOS',
      'RefreshControl',
      'SafeAreaView',
      'ScrollView',
      'SectionList',
      'SegmentedControl',
      'SegmentedControlIOS',
      'Slider',
      'SnapshotViewIOS',
      'StatusBar',
      'Switch',
      'TabBarIOS.Item',
      'TabBarIOS',
      'Text',
      'TextInput',
      'ToolbarAndroid',
      'TouchableHighlight',
      'TouchableNativeFeedback',
      'TouchableOpacity',
      'TouchableWithoutFeedback',
      'View',
      'ViewPagerAndroid',
      'VirtualizedList',
      'WebView',
      'AccessibilityInfo',
      'ActionSheetIOS',
      'Alert',
      'AlertIOS',
      'Animated',
      'AppState',
      'AsyncStorage',
      'BackAndroid',
      'BackHandler',
      'Clipboard',
      'DatePickerAndroid',
      'Dimensions',
      'Easing',
      'Image Style Props',
      'ImageStore',
      'InteractionManager',
      'Keyboard',
      'Layout Props',
      'LayoutAnimation',
      'ListViewDataSource',
      'NetInfo',
      'PanResponder',
      'PixelRatio',
      'Settings',
      'Shadow Props',
      'Share',
      'StatusBarIOS',
      'StyleSheet',
      'Systrace',
      'Text Style Props',
      'TimePickerAndroid',
      'ToastAndroid',
      'Transforms',
      'Vibration',
      'VibrationIOS',
      'View Style Props',
    ],
  },
];

// Order of sections (mapped from directory names in navigation-data.js DIR_MAPPING)
// TODO(brentvatne): this doesn't make too much sense because of higher level groupings, should
// move this logic to GROUPS instead
const ROOT = [
  'Get Started',
  'Tutorial',
  'Conceptual Overview',
  'Fundamentals',
  'Distributing Your App',
  'Assorted Guides',
  'Expo Accounts',
  'Bare Workflow',
  'Push Notifications',
  'UI Programming',
  'Regulatory Compliance',
  'Configuration Files',
  'Expo SDK',
  'React Native',
  'Technical Specs',
  'ExpoKit',
];

// These directories will not be placed in the sidebar, but will still be searchable
const hiddenSections = ['FAQ', 'Troubleshooting'];

//These sections will NOT be expanded by default in the sidebar
const unexpandedSections = ['Deprecated', 'Regulatory Compliance', 'UI Programming'];

const sortAccordingToReference = (arr, reference) => {
  reference = Array.from(reference).reverse();

  const subSort = (arr, i) => arr.slice(0, i).concat(arr.slice(i).sort());

  arr.forEach(category => {
    category.weight = reference.indexOf(category.name) * -1;
  });

  const arrSortedByWeight = arr.sort((a, b) => a.weight - b.weight);
  return subSort(
    arrSortedByWeight,
    arrSortedByWeight.findIndex(o => o.weight === 1)
  );
};

const sortNav = nav => {
  nav = sortAccordingToReference(nav, ROOT);

  sections.forEach(({ name, reference }) => {
    const section = nav.find(o => {
      return o.name.toLowerCase() === name.toLowerCase();
    });

    if (section) {
      section.posts = sortAccordingToReference(section.posts, reference);
    }
  });

  return nav;
};

// Get the name of the group that a section belongs to
function getGroupForSectionName(sectionName) {
  return Object.keys(GROUPS).find(groupName => GROUPS[groupName].includes(sectionName));
}

// Yikes, this groups together multiple sections under one heading
const groupNav = nav => {
  const sections = [];
  const groupNameToSectionIndex = {};
  nav.forEach(section => {
    // If it's grouped then we add it
    const groupName = getGroupForSectionName(section.name);
    if (groupName) {
      if (groupNameToSectionIndex.hasOwnProperty(groupName)) {
        const existingSectionIndex = groupNameToSectionIndex[groupName];
        sections[existingSectionIndex].children.push(section);
      } else {
        groupNameToSectionIndex[groupName] = sections.length;
        sections.push({
          name: groupName,
          children: [section],
        });
      }
      // If it's not grouped then it just gets added to the root
    } else {
      sections.push(section);
    }
  });

  return sections;
};

const sortedReference = Object.assign(
  ...Object.entries(prevaledNavigationData.reference).map(([version, versionNavigation]) => ({
    [version]: groupNav(sortNav(versionNavigation)),
  }))
);

const sortedGeneral = groupNav(sortNav(prevaledNavigationData.general));
const sortedStarting = groupNav(sortNav(prevaledNavigationData.starting));
const sortedPreview = groupNav(sortNav(prevaledNavigationData.preview));
const sortedFeaturePreview = groupNav(sortNav(prevaledNavigationData.featurePreview));

module.exports = {
  generalDirectories: prevaledNavigationData.generalDirectories,
  startingDirectories: prevaledNavigationData.startingDirectories,
  previewDirectories: prevaledNavigationData.previewDirectories,
  featurePreviewDirectories: prevaledNavigationData.featurePreviewDirectories,
  starting: sortedStarting,
  general: sortedGeneral,
  preview: sortedPreview,
  featurePreview: sortedFeaturePreview,
  reference: { ...sortedReference, latest: sortedReference['v' + packageVersion] },
  hiddenSections,
  unexpandedSections,
};
