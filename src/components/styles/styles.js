import {StyleSheet} from 'react-native';
import {screenWidth} from '../utils/constants';

export const styles = StyleSheet.create({
  homeSafeArea: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  homeScreenContainer: {
    flex: 1,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: screenWidth < 800 ? 50 : 70,
    right: 15,
  },
  fixedButtonLayoutContainer: {
    position: 'absolute',
    bottom: screenWidth < 800 ? 90 : 100,
    right: 22,
  },
  fixedButton: {
    backgroundColor: '#1B3C55',
    paddingVertical: screenWidth < 800 ? 10 : 15,
    paddingHorizontal: screenWidth < 800 ? 3 : 7,
    borderRadius: 12,
    alignItems: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: screenWidth < 800 ? 75 : 100,
  },
  fixedButtonImage: {
    width: 21,
    height: 21,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  scrollableText: {
    fontSize: 16,
    marginBottom: 10,
  },
  navBarContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  backBtn: {
    width: 35,
    height: 35,
  },
  navBarText: {
    fontSize: 18,
    fontWeight: '500',
  },
  navBarAddBtn: {
    width: 35,
    height: 35,
  },
});
