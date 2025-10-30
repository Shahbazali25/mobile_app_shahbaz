import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import errorMessage from '../../components/utils/errorMessage';
import {getDetectionStatus} from '../../components/apis/cameras/motionDetection/getStatus';
import {enableDetection} from '../../components/apis/cameras/motionDetection/enableDetection';
import {disableDetection} from '../../components/apis/cameras/motionDetection/disableDetection';
import {getLastFrame} from '../../components/apis/cameras/motionDetection/getLastFrame';
import {saveROI} from '../../components/apis/cameras/motionDetection/saveROI';
import {checkUserRole} from '../../components/utils/checkRole';

export default function MotionDetectionForm({camera_id, stream_link}) {
  const animation = useRef(null);
  const frameImageRef = useRef(null);
  const scrollViewRef = useRef(null);

  const [isLoading, setLoading] = useState(true);
  const [isAlertsEnabled, setIsAlertsEnabled] = useState(false);
  const [frameImage, setFrameImage] = useState(null);
  const [loadingFrame, setLoadingFrame] = useState(false);
  const [showROIEditor, setShowROIEditor] = useState(false);
  const [Zonees, setZonees] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [frameWidth, setFrameWidth] = useState(500);
  const [frameHeight, setFrameHeight] = useState(400);
  const [imageLayout, setImageLayout] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [ZoneColors] = useState([
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
  ]);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    animation.current?.play();
    const fetchDetectionStatus = async () => {
      try {
        const role = await checkUserRole();
        setUserRole(role);
        const result = await getDetectionStatus(camera_id);
        // const latestFrame = await getLastFrame(camera_id);
        // setFrameImage({uri: latestFrame});
        setIsAlertsEnabled(result.detectionEnabled);
        setStatus(result);
      } catch (error) {
        console.error('Error fetching status:', error);
        errorMessage('Detection Status Error', String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchDetectionStatus();
  }, [camera_id]);

  useEffect(() => {
    setScrollEnabled(!isDrawing);
  }, [isDrawing]);

  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  const toggleDetectionStatus = async newValue => {
    setLoading(true);
    setIsAlertsEnabled(newValue);
    try {
      if (newValue) {
        await enableDetection(camera_id);
      } else {
        await disableDetection(camera_id);
      }
    } catch (error) {
      errorMessage('Detection Status Update Error', String(error));
      setIsAlertsEnabled(!newValue);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomFrame = async () => {
    setLoadingFrame(true);
    try {
      setShowROIEditor(true);
      setZonees([]);
      setCurrentZone(null);
      setIsDrawing(false);
      setShowInstructions(true);
    } catch (error) {
      console.error('Error fetching frame:', error);
      errorMessage('Frame Fetch Error', String(error));
    } finally {
      setLoadingFrame(false);
    }
  };

  const handleImageLoad = () => {
    if (frameImageRef.current && frameImage) {
      Image.getSize(
        frameImage.uri,
        (width, height) => {
          setFrameWidth(width);
          setFrameHeight(height);

          if (
            isAlertsEnabled &&
            status &&
            status.config &&
            status.config.rois &&
            status.config.rois.length > 0
          ) {
            console.log('Existing ROIs found:', status.config.rois);

            const existingZonees = status.config.rois.map((roi, index) => {
              const [
                roiWidth,
                roiHeight,
                [centerX, centerY],
                apiFrameWidth,
                apiFrameHeight,
              ] = roi;

              return {
                width: roiWidth,
                height: roiHeight,
                centerX: centerX,
                centerY: centerY,
                color: ZoneColors[index % ZoneColors.length],
              };
            });

            setZonees(existingZonees);
          }
        },
        error => {
          console.error('Error getting image size:', error);
        },
      );
    }
  };

  const handleImageLayout = event => {
    if (frameImageRef.current) {
      frameImageRef.current.measure((x, y, width, height, pageX, pageY) => {
        setImageLayout({
          width: width,
          height: height,
          x: pageX,
          y: pageY,
        });
      });
    }
  };

  // Convert screen coordinates to image coordinates
  const screenToImageCoords = (screenX, screenY) => {
    const scaleX = frameWidth / imageLayout.width;
    const scaleY = frameHeight / imageLayout.height;

    return {
      x: Math.max(0, Math.min(frameWidth, screenX * scaleX)),
      y: Math.max(0, Math.min(frameHeight, screenY * scaleY)),
    };
  };

  const convertZoneToScreenCoords = Zone => {
    const scaleX = imageLayout.width / frameWidth;
    const scaleY = imageLayout.height / frameHeight;

    const ZoneLeft = (Zone.centerX - Zone.width / 2) * scaleX;
    const ZoneTop = (Zone.centerY - Zone.height / 2) * scaleY;
    const ZoneWidth = Zone.width * scaleX;
    const ZoneHeight = Zone.height * scaleY;

    return {
      left: ZoneLeft,
      top: ZoneTop,
      width: ZoneWidth,
      height: ZoneHeight,
    };
  };

  const handleTouchStart = event => {
    const {locationX, locationY} = event.nativeEvent;

    if (!isDrawing) {
      const imageCoords = screenToImageCoords(locationX, locationY);

      setIsDrawing(true);
      setScrollEnabled(false);

      setCurrentZone({
        startX: imageCoords.x,
        startY: imageCoords.y,
        width: 0,
        height: 0,
        centerX: imageCoords.x,
        centerY: imageCoords.y,
      });
    }
  };

  const handleTouchMove = event => {
    const {locationX, locationY} = event.nativeEvent;

    if (isDrawing && currentZone) {
      const imageCoords = screenToImageCoords(locationX, locationY);

      const width = Math.abs(imageCoords.x - currentZone.startX);
      const height = Math.abs(imageCoords.y - currentZone.startY);

      const minX = Math.min(imageCoords.x, currentZone.startX);
      const minY = Math.min(imageCoords.y, currentZone.startY);

      const adjustedMinX = Math.max(0, minX);
      const adjustedMinY = Math.max(0, minY);

      const adjustedWidth = Math.min(width, frameWidth - adjustedMinX);
      const adjustedHeight = Math.min(height, frameHeight - adjustedMinY);

      const centerX = adjustedMinX + adjustedWidth / 2;
      const centerY = adjustedMinY + adjustedHeight / 2;

      setCurrentZone({
        ...currentZone,
        width: adjustedWidth,
        height: adjustedHeight,
        centerX,
        centerY,
      });
    }
  };

  const handleTouchEnd = () => {
    if (isDrawing && currentZone) {
      if (currentZone.width > 10 && currentZone.height > 10) {
      } else {
        setIsDrawing(false);
        setCurrentZone(null);
      }
    }
    setScrollEnabled(!isDrawing);
  };

  const confirmZone = () => {
    if (isDrawing && currentZone) {
      if (currentZone.width > 10 && currentZone.height > 10) {
        const newZone = {
          ...currentZone,
          color: ZoneColors[Zonees.length % ZoneColors.length],
        };
        setZonees([...Zonees, newZone]);
      }
      setIsDrawing(false);
      setCurrentZone(null);
      setScrollEnabled(true);
    }
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setCurrentZone(null);
    setScrollEnabled(true);
  };

  const deleteZone = index => {
    const updatedZonees = [...Zonees];
    updatedZonees.splice(index, 1);
    setZonees(updatedZonees);
  };

  const saveZonees = async () => {
    setIsSaving(true);

    try {
      const rois = Zonees.map(Zone => {
        const width = Math.round(Zone.width);
        const height = Math.round(Zone.height);
        const centerX = Math.round(Zone.centerX);
        const centerY = Math.round(Zone.centerY);

        return [width, height, [centerX, centerY], frameWidth, frameHeight];
      });

      console.log(
        'Saving normalized Zonees for camera',
        camera_id,
        ':',
        rois,
        frameHeight,
        frameWidth,
      );

      await saveROI(camera_id, rois);
    } catch (error) {
      console.error('Error saving zones:', error);
      Alert.alert('Error', 'Failed to save zones: ' + String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const renderZone = (Zone, index) => {
    const ZoneOnScreen = convertZoneToScreenCoords(Zone);

    return (
      <View
        key={index}
        style={[
          styles.Zone,
          {
            left: ZoneOnScreen.left,
            top: ZoneOnScreen.top,
            width: ZoneOnScreen.width,
            height: ZoneOnScreen.height,
            borderColor: Zone.color || '#FF0000',
            backgroundColor: `${Zone.color || '#FF0000'}20`,
          },
        ]}>
        <Text
          style={[
            styles.ZoneLabel,
            {backgroundColor: Zone.color || '#FF0000'},
          ]}>
          Region {index + 1}
        </Text>
      </View>
    );
  };

  const renderCurrentZone = () => {
    if (!isDrawing || !currentZone) return null;

    const ZoneOnScreen = convertZoneToScreenCoords(currentZone);

    return (
      <View
        style={[
          styles.Zone,
          {
            left: ZoneOnScreen.left,
            top: ZoneOnScreen.top,
            width: ZoneOnScreen.width,
            height: ZoneOnScreen.height,
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/loading.json')}
          style={styles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.form}
      contentContainerStyle={{paddingBottom: 80}}
      scrollEnabled={scrollEnabled}>
      <View>
        {(userRole === 0 || userRole === 4) && (
          <View>
            <Text style={[styles.sectionLabel, {marginTop: 4}]}>
              Motion Detection Settings
            </Text>
            <View style={styles.inputFields}>
              <Text style={styles.formLabel}>Motion Detection On/Off</Text>
              <View style={styles.toggleContainer}>
                <Switch
                  trackColor={{false: '#767577', true: '#3cb043'}}
                  thumbColor="#f4f3f4"
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleDetectionStatus}
                  value={isAlertsEnabled}
                />
              </View>
            </View>
          </View>
        )}

        <Text style={[styles.sectionLabel, {marginTop: 15}]}>
          ROI (Region of Interest)
        </Text>
        {!scrollEnabled && (
          <View style={styles.scrollBlockedNotification}>
            <Text style={styles.instructionText}>
              {isDrawing
                ? 'Release to finish drawing, then confirm or cancel the Zone.'
                : 'Tap and drag to draw a new Zone.'}
            </Text>
          </View>
        )}

        {!showROIEditor && (
          <TouchableOpacity
            style={styles.extractButton}
            onPress={fetchRandomFrame}
            disabled={loadingFrame}>
            <Text style={styles.extractButtonText}>
              {loadingFrame
                ? 'Loading Frame...'
                : `Open ROI ${
                    userRole === 0 || userRole === 4 ? 'Editor' : 'Viewer'
                  }`}
            </Text>
          </TouchableOpacity>
        )}

        {loadingFrame && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        )}

        {showROIEditor && frameImage && (
          <View style={styles.editorContainer}>
            <Text style={styles.editorTitle}>
              {userRole === 0 || userRole === 4 ? 'ROI Editor:' : 'ROI Viewer:'}
            </Text>

            {showInstructions && (userRole === 0 || userRole === 4) && (
              <View style={styles.instructionsTooltip}>
                <Text style={styles.instructionTitle}>How to use:</Text>
                <Text style={styles.instructionPoint}>
                  • Tap and drag to draw a new Region
                </Text>
                <Text style={styles.instructionPoint}>
                  • Regions will appear in the list below
                </Text>
                <Text style={styles.instructionPoint}>
                  • Use the delete button to remove unwanted Regions
                </Text>
                <TouchableOpacity
                  style={styles.closeInstructionsButton}
                  onPress={() => setShowInstructions(false)}>
                  <Text style={styles.closeInstructionsText}>Got it</Text>
                </TouchableOpacity>
              </View>
            )}

            {(userRole === 0 || userRole === 4) && (
              <Text style={styles.instructionText}>
                {isDrawing
                  ? 'Release to finish drawing, then confirm or cancel the Region.'
                  : 'Tap and drag to draw a new Region.'}
              </Text>
            )}

            <View
              style={styles.editorImageContainer}
              onLayout={handleImageLayout}>
              <Image
                ref={frameImageRef}
                source={{uri: frameImage.uri}}
                style={styles.editorImage}
                resizeMode="contain"
                onLoad={handleImageLoad}
                onStartShouldSetResponder={() =>
                  userRole === 0 || userRole === 4 ? true : false
                }
                onResponderGrant={handleTouchStart}
                onResponderMove={handleTouchMove}
                onResponderRelease={handleTouchEnd}
              />

              {Zonees.map((Zone, index) => renderZone(Zone, index))}
              {renderCurrentZone()}
            </View>

            {isDrawing && (
              <View style={styles.ZoneActionButtons}>
                <TouchableOpacity
                  style={styles.cancelDrawingButton}
                  onPress={cancelDrawing}>
                  <Text style={styles.cancelDrawingText}>Cancel Region</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmZone}>
                  <Text style={styles.confirmButtonText}>Confirm Region</Text>
                </TouchableOpacity>
              </View>
            )}

            {Zonees.length > 0 && (
              <View style={styles.ZoneList}>
                <Text style={styles.ZoneListTitle}>Defined Regions:</Text>
                {Zonees.map((Zone, index) => (
                  <View
                    key={index}
                    style={[
                      styles.ZoneItem,
                      {
                        borderLeftColor: Zone.color || '#FF0000',
                        backgroundColor: '#FFFFFF',
                      },
                    ]}>
                    <View style={styles.ZoneInfoContainer}>
                      <Text style={styles.ZoneInfo}>
                        Region {index + 1}: {Math.round(Zone.width)}x
                        {Math.round(Zone.height)} px
                      </Text>
                      <Text style={styles.ZoneInfo}>
                        Center: ({Math.round(Zone.width / 2)},{' '}
                        {Math.round(Zone.height / 2)})
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        {opacity: userRole === 0 || userRole === 4 ? 1 : 0.4},
                      ]}
                      onPress={() => deleteZone(index)}
                      disabled={
                        userRole === 0 || userRole === 4 ? false : true
                      }>
                      <Text style={{color: 'white', fontSize: 11}}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {(userRole === 0 || userRole === 4) && (
              <View style={styles.editorControls}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowROIEditor(false);
                    setZonees([]);
                    setCurrentZone(null);
                    setIsDrawing(false);
                    setScrollEnabled(true);
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveZonees}
                  disabled={isSaving}>
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save Regions'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexGrow: 1,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 10,
  },
  inputFields: {
    marginVertical: 6,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  toggleContainer: {
    paddingVertical: 8,
  },
  extractButton: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  extractButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    marginVertical: 8,
    textAlign: 'center',
  },
  editorContainer: {
    marginTop: 20,
    width: '100%',
  },
  editorTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
  },
  editorImageContainer: {
    position: 'relative',
    width: '90%', // Reduce from 100% to 90% for a slightly smaller container
    maxWidth: 500, // Add a maximum width to keep it medium sized
    alignSelf: 'center', // Center the container horizontally
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3B82F6',
    backgroundColor: '#000',
    marginVertical: 15, // Add some vertical margin for spacing
  },
  editorImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  Zone: {
    position: 'absolute',
    borderWidth: 2,
    zIndex: 10,
  },
  ZoneLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    color: 'white',
    fontSize: 10,
    padding: 2,
    borderRadius: 4,
  },
  ZoneActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#22C55E',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  cancelDrawingButton: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelDrawingText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  ZoneList: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  ZoneListTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  ZoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  ZoneInfoContainer: {
    flex: 1,
  },
  ZoneInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#334155',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  editorControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#64748B',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  instructionsTooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  instructionTitle: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginBottom: 8,
  },
  instructionPoint: {
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  closeInstructionsButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  closeInstructionsText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  scrollBlockedNotification: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  scrollBlockedText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});
