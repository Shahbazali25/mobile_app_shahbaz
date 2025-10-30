import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, processColor} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LineChart} from 'react-native-charts-wrapper';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Mock data for Battery Management
const mockData = {
  batteryStatus: {
    percentage: 100,
    storedPower: 9.27,
    maxCapacity: 98
  },
  chartData: {
    dataSets: [
      {
        values: [
          {x: 0, y: 0}, {x: 3, y: 0}, {x: 6, y: 2.1}, {x: 7, y: -0.8}, 
          {x: 8, y: -0.5}, {x: 9, y: 4.2}, {x: 10, y: 3.8}, {x: 11, y: 3.5},
          {x: 12, y: -4.1}, {x: 15, y: 0}, {x: 18, y: -5.8}, {x: 21, y: 0.8}, {x: 24, y: 0}
        ],
        label: 'Battery Usage',
        config: {
          lineWidth: 3,
          color: '#06B6D4',
          circleColor: '#06B6D4',
          circleRadius: 4,
          drawCircles: true,
          drawValues: false,
          mode: 'CUBIC_BEZIER',
          fillColor: '#06B6D4',
          fillAlpha: 30,
          drawFilled: true,
        }
      }
    ]
  },
  yesterdayData: {
    values: [
      {x: 0, y: 2}, {x: 3, y: 3}, {x: 6, y: 1.8}, {x: 7, y: -5.6}, 
      {x: 8, y: -2.3}, {x: 9, y: 1.8}, {x: 10, y: 1.2}, {x: 11, y:2.1},
      {x: 12, y: -1.7}, {x: 15, y: 1.5}, {x: 18, y: -3.2}, {x: 21, y: 1.6}, {x: 24, y: 2.2}
    ],
    label: 'Yesterday',
    config: {
      lineWidth: 2,
      color: processColor('red'),
      circleColor: processColor('red'),
      circleRadius: 3,
      drawCircles: true,
      drawValues: false,
      mode: 'CUBIC_BEZIER',
      fillColor: processColor('red'),
      fillAlpha: 20,
      drawFilled: false,
      strokeDashArray: [5, 5],
    }
  },
  xLabels: ['00', '03', '06', '09', '12', '15', '18', '21', '24']
};

function BatteryManagement() {
  const [showYesterday, setShowYesterday] = useState(true);

  const isTablet = screenWidth >= 768;

  const getChartData = () => {
    let dataSets = [mockData.chartData.dataSets[0]];
    
    if (showYesterday) {
      dataSets.push(mockData.yesterdayData);
    }

    return {dataSets};
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Battery{'\n'}Management</Text>
    </View>
  );

  const renderBatteryStatus = () => (
    <View style={styles.batteryStatusContainer}>
      <View style={styles.batteryIconContainer}>
        <Text style={styles.batteryIcon}>🔋</Text>
        <Text style={styles.batteryPercentage}>{mockData.batteryStatus.percentage}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBar, 
              {width: `${mockData.batteryStatus.percentage}%`}
            ]} 
          />
        </View>
      </View>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.cardsContainer}>
      <View style={[styles.statsCard, styles.storedCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#10B981'}]} />
          <Text style={styles.cardLabel}>Stored Power</Text>
        </View>
        <Text style={styles.cardValue}>{mockData.batteryStatus.storedPower}</Text>
        <Text style={styles.cardUnit}>kWh</Text>
      </View>

      <View style={[styles.statsCard, styles.capacityCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#3B82F6'}]} />
          <Text style={styles.cardLabel}>Maximum Capacity</Text>
        </View>
        <Text style={styles.cardValue}>{mockData.batteryStatus.maxCapacity}</Text>
        <Text style={styles.cardUnit}>%</Text>
      </View>
    </View>
  );

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Battery Usage Graph</Text>
      
      <View style={styles.chartWrapper}>
        <LineChart
          style={styles.chart}
          data={getChartData()}
          chartDescription={{text: ''}}
          legend={{
            enabled: true,
            textSize: 11,
            textColor: '#64748B',
            position: 'BELOW_CHART_LEFT',
            form: 'CIRCLE',
            formSize: 6,
            xEntrySpace: 8,
            yEntrySpace: 4,
            wordWrapEnabled: true,
          }}
          xAxis={{
            enabled: true,
            textSize: 9,
            textColor: '#64748B',
            axisLineColor: '#E5E7EB',
            gridColor: '#F3F4F6',
            position: 'BOTTOM',
            drawAxisLine: true,
            drawGridLines: true,
            granularity: 1,
            labelCount: mockData.xLabels.length,
            valueFormatter: mockData.xLabels,
            avoidFirstLastClipping: true,
          }}
          yAxis={{
            left: {
              enabled: true,
              textSize: 9,
              textColor: '#64748B',
              axisLineColor: '#E5E7EB',
              gridColor: '#F3F4F6',
              drawAxisLine: false,
              drawGridLines: true,
              position: 'OUTSIDE_CHART',
              spaceTop: 20,
              spaceBottom: 10,
              axisMinimum: -6,
              axisMaximum: 6,
            },
            right: {
              enabled: false,
            },
          }}
          animation={{
            durationX: 1000,
            durationY: 1000,
            easingX: 'EaseInOutQuart',
            easingY: 'EaseInOutQuart',
          }}
          drawGridBackground={false}
          drawBorders={false}
          touchEnabled={true}
          dragEnabled={true}
          scaleEnabled={true}
          scaleXEnabled={true}
          scaleYEnabled={false}
          pinchZoom={true}
          autoScaleMinMaxEnabled={false}
          highlightPerTapEnabled={true}
          highlightPerDragEnabled={false}
          extraOffsets={{left: 10, top: 10, right: 15, bottom: 15}}
        />
      </View>
    </View>
  );

  const renderToggleSwitch = (isActive, onPress, label) => (
    <TouchableOpacity style={styles.toggleOption} onPress={onPress}>
      <View style={[styles.toggle, isActive && styles.toggleActive]}>
        <View style={[
          styles.toggleThumb,
          isActive && styles.toggleThumbActive
        ]} />
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {renderToggleSwitch(
        showYesterday,
        () => setShowYesterday(!showYesterday),
        "Yesterday's Data"
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {renderHeader()}
        {renderBatteryStatus()}
        {renderStatsCards()}
        {renderChart()}
        {renderControls()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: screenWidth < 768 ? 28 : 32,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    lineHeight: screenWidth < 768 ? 32 : 38,
  },
  batteryStatusContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#E6F7F1',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  batteryIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 5,
  },
  batteryIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  batteryPercentage: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
  },
  progressBarContainer: {
    // marginTop: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storedCard: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  capacityCard: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:4,
  },
  indicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    flex: 1,
  },
  cardValue: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    // marginBottom: 4,
  },
  cardUnit: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 20,
  },
  chartWrapper: {
    height: screenWidth < 768 ? 280 : 320,
    borderRadius: 8,
    marginBottom: 10,
  },
  chart: {
    flex: 1,
  },
  controlsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    marginRight: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#1E293B',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    flex: 1,
  },
});

export default BatteryManagement;