import React from 'react';
import {
  Image,
  Platform,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as firebase from 'firebase';
import { WebBrowser } from 'expo';
var Dimensions = require('Dimensions');
import { MonoText } from '../components/StyledText';
import VideoPlayer from './VideoPlayer';
var {width, height} = Dimensions.get('window');
 const videoUrls = ["https://firebasestorage.googleapis.com/v0/b/longevity-4653f.appspot.com/o/videos%2FLongGev_Content_Ketogenic.mp4?alt=media&token=e667f343-618f-45a8-8460-227a210f6a4c", "https://player.vimeo.com/external/279994968.hd.mp4?s=a472af16ab5cb4886c7a8e50f19a729fd6fc92eb&profile_id=175&oauth2_token_id=57447761", "https://player.vimeo.com/external/265473491.hd.mp4?s=063cf2e7a64283730c49ff3b120ddc8b3f560206&profile_id=175&oauth2_token_id=57447761"]

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollPosition: 0,
      videos: null
    };
  }

  static navigationOptions = {
    header: null,
  };

  renderVideoItem = ({ item }) => {
		return (
      <View style={{height: height}}><VideoPlayer title= {'You\'re going to live longer!'} path={item} /></View>
		);
	}

  handleScroll(event) {
    console.warn(event.nativeEvent);
    this.setState({ scrollPosition: event.nativeEvent.contentOffset.y != undefined ? event.nativeEvent.contentOffset.y : 0 });
  }

  async componentDidMount() {
    firebase.database().ref(`videos/`).on('value', videos => {
      const videoUrls = videos.val()
      const videoArr = []

      for (const video in videoUrls) {
        //console.warn(video)
          videoArr.push(videoUrls[video].URL+','+videoUrls[video].title)
      }

      //console.warn(formatted)
      this.setState({videos: videoArr})
    })
  }

  render() {
    return (
      <View style={styles.container}>
      <FlatList
          data={this.state.videos}
          keyExtractor={item => item}
          renderItem={this.renderVideoItem}
          style={styles.list}
          //onScroll={this.handleScroll}
        >
        </FlatList>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    flexDirection: 'column',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    height: 3000,
    justifyContent: 'flex-start'
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 0)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
