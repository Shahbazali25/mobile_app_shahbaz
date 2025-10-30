import React, {useRef, useEffect, useMemo} from 'react';
import {View, Text, StyleSheet, Image, Dimensions} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import {labelMap} from '../../components/utils/constants';
import {useWebSocketData} from '../../components/services/webSocketData';

const {width: screenWidth} = Dimensions.get('window');

function SolisSolarData() {
  const dynamicWidth = screenWidth * 0.5;
  const animation = useRef(null);
  const animationLoadLine = useRef(null);
  const animationGridLine = useRef(null);
  const animationBatteryLine = useRef(null);
  const animationSolarLine = useRef(null);
  const solarData = useWebSocketData('solis');

  const statuses = useMemo(() => {
    if (!solarData)
      return {
        gridStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        solarStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        batteryStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        loadStatus: {text: 'Idle', color: '#746d69', bg: '#e6e6e6'},
        gridDirection: null,
        batteryDirection: null,
      };

    // Grid Status
    const gridPower = parseFloat(
      solarData['solis/inverter_1/Total_Grid_Power'] || 0,
    );
    const gridStatus =
      gridPower < 0
        ? {text: 'Exporting', color: '#008631', bg: '#d7ffd9'}
        : gridPower > 0
        ? {text: 'Importing', color: '#c30010', bg: '#ffcbd1'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};
    const gridDirection =
      gridPower < 0 ? 'right' : gridPower > 0 ? 'left' : null;

    // Solar Status
    const solarPower = parseFloat(
      solarData['solis/inverter_1/Total_PV_Output_Power'] || 0,
    );
    const solarStatus =
      solarPower > 0
        ? {text: 'Producing', color: '#E57A45', bg: '#fff3cd'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};

    // Battery Status
    const batteryPower = parseFloat(
      solarData['solis/inverter_1/Battery_Power'] || 0,
    );
    const batteryStatus =
      batteryPower < 0
        ? {text: 'Discharging', color: '#c30010', bg: '#ffcbd1'}
        : batteryPower > 0
        ? {text: 'Charging', color: '#008631', bg: '#d7ffd9'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};
    const batteryDirection =
      batteryPower < 0 ? 'up' : batteryPower > 0 ? 'down' : null;

    // Load Status
    const mainLoadPower = parseFloat(
      solarData['solis/inverter_1/Main_Load_Power'] || 0,
    );
    const backupLoadPower = parseFloat(
      solarData['solis/inverter_1/Backup_Load_Power'] || 0,
    );
    const loadPower = mainLoadPower + backupLoadPower;
    const loadStatus =
      loadPower > 0
        ? {text: 'Consuming', color: '#e09100', bg: '#fff3cd'}
        : {text: 'Idle', color: '#746d69', bg: '#e6e6e6'};

    return {
      gridStatus,
      solarStatus,
      batteryStatus,
      loadStatus,
      gridDirection,
      batteryDirection,
    };
  }, [solarData]);

  useEffect(() => {
    animation.current?.play();
    animationLoadLine.current?.play();
    animationGridLine.current?.play();
    animationBatteryLine.current?.play();
    animationSolarLine.current?.play();
  }, []);

  if (!solarData) {
    return (
      <View style={styles.container}>
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/solar-animation.json')}
          style={styles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  return (
    <View style={{display: 'flex', flexDirection: 'column'}}>
      <View
        style={{
          height: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <View
          style={{
            paddingHorizontal: 20,
            position: 'relative',
            height: screenWidth < 804 ? 400 : 600,
            top: 0,
            borderWidth: 1,
            borderRadius: 10,
            borderColor: 'lightgray',
            width: screenWidth < 804 ? screenWidth * 0.8 : screenWidth * 0.5,
          }}>
          <Image
            source={require('../../assets/imgs/solar-inverter.png')}
            style={{
              width: screenWidth < 804 ? 50 : 80,
              height: screenWidth < 804 ? 50 : 80,
              zIndex: 999999,
              position: 'absolute',
              left: '47%',
              top: '40%',
            }}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/imgs/icons/bulbicon.png')}
            style={{
              position: 'absolute',
              left: '5%',
              top: screenWidth < 804 ? '41%' : '40%',
              width: screenWidth < 804 ? 40 : 70,
              height: screenWidth < 804 ? 40 : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: screenWidth < 804 ? '4%' : '6%',
              top: '53%',
            }}>
            <Text
              style={{
                color: 'orange',
                fontFamily: 'Poppins-Bold',
                fontSize: 9,
              }}>{`${
              `${
                (parseFloat(solarData['solis/inverter_1/Main_Load_Power']) ||
                  0) +
                (parseFloat(solarData['solis/inverter_1/Backup_Load_Power']) ||
                  0)
              } W` || '0 W'
            }`}</Text>

            <Text
              style={{
                color: statuses.loadStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.loadStatus.text}
            </Text>
          </View>
          {statuses.loadStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationLoadLine}
              source={require('../../assets/animations/load-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  left: screenWidth < 804 ? '19%' : '16%',
                  top: screenWidth < 804 ? '44%' : '45%',
                  width: '32%',
                  height: 20,
                  transform: [
                    {
                      rotate:
                        statuses.gridDirection &&
                        statuses.gridDirection === 'left'
                          ? '-180deg'
                          : '180deg',
                    },
                  ],
                  zIndex: 0,
                },
              ]}
              autoPlay={true}
              loop
            />
          )}
          <Image
            source={require('../../assets/imgs/icons/gridicon2.png')}
            style={{
              position: 'absolute',
              right: '5%',
              top: screenWidth < 804 ? '41%' : '40%',
              width: screenWidth < 804 ? 40 : 70,
              height: screenWidth < 804 ? 40 : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              right: screenWidth < 804 ? '5%' : '6%',
              top: '53%',
            }}>
            <Text
              style={{
                color: '#6158F1',
                fontFamily: 'Poppins-Bold',
                fontSize: 9,
                alignSelf: 'center',
              }}>
              {`${Math.abs(
                parseFloat(solarData['solis/inverter_1/Total_Grid_Power']),
              )} kW` ?? '0 kW'}
            </Text>
            <Text
              style={{
                color: statuses.gridStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.gridStatus.text}
            </Text>
          </View>
          {statuses.gridStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationGridLine}
              source={require('../../assets/animations/grid-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  right: screenWidth < 804 ? '19%' : '16%',
                  top: screenWidth < 804 ? '44%' : '45%',
                  width: '32%',
                  height: 20,
                  transform: [
                    {
                      rotate:
                        statuses.gridDirection &&
                        statuses.gridDirection === 'left'
                          ? '180deg'
                          : '360deg',
                    },
                  ],
                  zIndex: -99999,
                },
              ]}
              autoPlay={true}
              loop
            />
          )}
          <Image
            source={require('../../assets/imgs/icons/brightnessIcon.png')}
            style={{
              position: 'absolute',
              top: '8%',
              left: '47.75%',
              width: screenWidth < 804 ? 40 : 70,
              height: screenWidth < 804 ? 40 : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: '48.75%',
              top: '1%',
            }}>
            <Text
              style={{
                color: '#E57A45',
                fontFamily: 'Poppins-Bold',
                fontSize: 9,
                alignSelf: 'center',
              }}>{`${
              solarData['solis/inverter_1/Total_PV_Output_Power'] || '0 W'
            }`}</Text>
            <Text
              style={{
                color: statuses.solarStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.solarStatus.text}
            </Text>
          </View>
          {statuses.solarStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationSolarLine}
              source={require('../../assets/animations/load-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  top: '22%',
                  left: '37%',
                  width: '32%',
                  height: 100,
                  transform: [{rotate: '90deg'}],
                },
              ]}
              autoPlay={true}
              loop
            />
          )}

          <Image
            source={require('../../assets/imgs/icons/batteryicon2.png')}
            style={{
              position: 'absolute',
              bottom: '8%',
              left: '47.75%',
              width: screenWidth < 804 ? 40 : 70,
              height: screenWidth < 804 ? 40 : 70,
              zIndex: 9999,
            }}
            resizeMode="contain"
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'absolute',
              left: screenWidth < 804 ? '47.75%' : '48.775%',
              bottom: '1%',
            }}>
            <Text
              style={{color: 'green', fontFamily: 'Poppins-Bold', fontSize: 9}}>
              {`${Math.abs(
                parseFloat(solarData['solis/inverter_1/Battery_Power']),
              )} W` ?? '0 W'}
              ({`${solarData['solis/inverter_1/Battery_Capacity'] ?? '0%'}`})
            </Text>
            <Text
              style={{
                color: statuses.batteryStatus.color,
                fontFamily: 'Poppins-Regular',
                fontSize: 9,
              }}>
              {statuses.batteryStatus.text}
            </Text>
          </View>
          {statuses.batteryStatus.text === 'Idle' ? (
            ''
          ) : (
            <AnimatedLottieView
              ref={animationBatteryLine}
              source={require('../../assets/animations/battery-line.json')}
              style={[
                styles.animation,
                {
                  position: 'absolute',
                  bottom: '22%',
                  left: '37%',
                  width: '32%',
                  height: 100,
                  transform: [
                    {
                      rotate:
                        statuses.batteryDirection &&
                        statuses.batteryDirection === 'up'
                          ? '-90deg'
                          : '90deg',
                    },
                  ],
                },
              ]}
              autoPlay={true}
              loop
            />
          )}
        </View>
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: screenWidth < 804 ? 40 : 260,
          marginBottom: 30,
          paddingHorizontal: 20,
          width: '100%',
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
          }}>
          <View
            style={{
              marginVertical: 4,
              maxWidth: 260,
              width: 260,
              padding: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: '#f2f2f2',
              borderWidth: 1,
              borderColor: 'lightgray',
              borderRadius: 10,
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Image
                source={require('../../assets/imgs/icons/gridicon2.png')}
                style={{width: 60, height: 60}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 16,
                  marginVertical: 2,
                }}>
                Grid
              </Text>
            </View>
            <View style={{display: 'flex', flexDirection: 'column'}}>
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 30,
                  fontFamily: 'Poppins-Bold',
                  color: '#1B3C55',
                }}>
                {`${Math.abs(
                  parseFloat(solarData['solis/inverter_1/Total_Grid_Power']),
                )} kW` ?? '0 kW'}
              </Text>
              <View
                style={{
                  backgroundColor: statuses.gridStatus.bg,
                  borderRadius: 16,
                  borderWidth: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 3,
                }}>
                <Text
                  style={{
                    color: statuses.gridStatus.color,
                    fontSize: 12,
                    fontFamily: 'Poppins-SemiBold',
                    alignSelf: 'center',
                  }}>
                  {statuses.gridStatus.text}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              marginVertical: 4,
              maxWidth: 260,
              width: 260,
              padding: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: '#f2f2f2',
              borderWidth: 1,
              borderColor: 'lightgray',
              borderRadius: 10,
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Image
                source={require('../../assets/imgs/icons/brightnessIcon.png')}
                style={{width: 60, height: 60}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 16,
                  marginVertical: 2,
                }}>
                Solar
              </Text>
            </View>
            <View style={{display: 'flex', flexDirection: 'column'}}>
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 30,
                  fontFamily: 'Poppins-Bold',
                  color: '#1B3C55',
                }}>{`${
                solarData['solis/inverter_1/Total_PV_Output_Power'] || '0 W'
              }`}</Text>
              <View
                style={{
                  backgroundColor: statuses.solarStatus.bg,
                  borderRadius: 16,
                  borderWidth: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 3,
                }}>
                <Text
                  style={{
                    color: statuses.solarStatus.color,
                    fontSize: 12,
                    fontFamily: 'Poppins-SemiBold',
                    alignSelf: 'center',
                  }}>
                  {statuses.solarStatus.text}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              marginVertical: 4,
              maxWidth: 260,
              width: 260,
              padding: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: '#f2f2f2',
              borderWidth: 1,
              borderColor: 'lightgray',
              borderRadius: 10,
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Image
                source={require('../../assets/imgs/icons/batteryicon2.png')}
                style={{width: 60, height: 60}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 16,
                  marginVertical: 2,
                }}>
                Battery{' '}
                <Text
                  style={{
                    alignSelf: 'center',
                    fontSize: 12,
                    fontFamily: 'Poppins-Medium',
                    color: 'gray',
                  }}>{`${
                  solarData['solis/inverter_1/Battery_Capacity'] ?? '0%'
                }`}</Text>
              </Text>
            </View>
            <View style={{display: 'flex', flexDirection: 'column'}}>
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 30,
                  fontFamily: 'Poppins-Bold',
                  color: '#1B3C55',
                }}>
                {`${Math.abs(
                  parseFloat(solarData['solis/inverter_1/Battery_Power']),
                )} W` ?? '0 W'}
              </Text>
              <View
                style={{
                  backgroundColor: statuses.batteryStatus.bg,
                  borderRadius: 16,
                  borderWidth: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 3,
                }}>
                <Text
                  style={{
                    color: statuses.batteryStatus.color,
                    fontSize: 12,
                    fontFamily: 'Poppins-SemiBold',
                    alignSelf: 'center',
                  }}>
                  {statuses.batteryStatus.text}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              marginVertical: 4,
              maxWidth: 260,
              width: 260,
              padding: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              backgroundColor: '#f2f2f2',
              borderWidth: 1,
              borderColor: 'lightgray',
              borderRadius: 10,
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
              <Image
                source={require('../../assets/imgs/icons/bulbicon.png')}
                style={{width: 60, height: 60}}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 16,
                  marginVertical: 2,
                }}>
                Load
              </Text>
            </View>
            <View style={{display: 'flex', flexDirection: 'column'}}>
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: 30,
                  fontFamily: 'Poppins-Bold',
                  color: '#1B3C55',
                }}>{`${
                `${
                  (parseFloat(solarData['solis/inverter_1/Main_Load_Power']) ||
                    0) +
                  (parseFloat(
                    solarData['solis/inverter_1/Backup_Load_Power'],
                  ) || 0)
                } W` ?? '0 W'
              }`}</Text>
              <View
                style={{
                  backgroundColor: statuses.loadStatus.bg,
                  borderRadius: 16,
                  borderWidth: 0,
                  paddingHorizontal: 16,
                  paddingVertical: 3,
                }}>
                <Text
                  style={{
                    color: statuses.loadStatus.color,
                    fontSize: 12,
                    fontFamily: 'Poppins-SemiBold',
                    alignSelf: 'center',
                  }}>
                  {statuses.loadStatus.text}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tableContainer}>
        {Object.keys(labelMap)
          .sort((a, b) => labelMap[a].localeCompare(labelMap[b]))
          .map((key, index) => (
            <View
              key={key}
              style={[
                styles.row,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
              ]}>
              <Text style={styles.labelText}>{labelMap[key]}</Text>
              <Text style={styles.valueText}>{solarData[key] || 'N/A'}</Text>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 250,
    height: 250,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: 'white',
  },
  labelText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  valueText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'right',
    fontFamily: 'Poppins-Medium',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SolisSolarData;
