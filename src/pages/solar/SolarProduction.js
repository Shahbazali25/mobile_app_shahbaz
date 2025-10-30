import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, processColor} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LineChart} from 'react-native-charts-wrapper';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Mock data for different periods
const mockData = {
  Today: {
    production: {today: 32.8, yesterday: 28.5, total: 945.2},
    chartData: {
      dataSets: [
        {
          values: [
            {x: 6, y: 0.2}, {x: 7, y: 1.8}, {x: 8, y: 3.5}, {x: 9, y: 5.2},
            {x: 10, y: 7.8}, {x: 11, y: 9.1}, {x: 12, y: 10.5}, {x: 13, y: 9.8},
            {x: 14, y: 8.5}, {x: 15, y: 6.2}, {x: 16, y: 4.1}, {x: 17, y: 2.5}, {x: 18, y: 0.8}
          ],
          label: 'Today',
          config: {
            lineWidth: 3,
            color: '#7C3AED',
            circleColor: '#7C3AED',
            circleRadius: 5,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: '#7C3AED',
            fillAlpha: 50,
            drawFilled: true,
          }
        }
      ]
    },
    yesterdayData: {
      values: [
        {x: 6, y: 0.1}, {x: 7, y: 1.2}, {x: 8, y: 2.8}, {x: 9, y: 4.1},
        {x: 10, y: 6.5}, {x: 11, y: 8.2}, {x: 12, y: 9.8}, {x: 13, y: 10.2},
        {x: 14, y: 8.9}, {x: 15, y: 7.1}, {x: 16, y: 5.3}, {x: 17, y: 3.2}, {x: 18, y: 1.1}
      ],
      label: 'Yesterday',
      config: {
        lineWidth: 2,
        color: processColor('red'),
        circleColor: processColor('red'),
        circleRadius: 4,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('red'),
        fillAlpha: 30,
        drawFilled: true,
      }
    },
    xLabels: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24']
  },
  'This Month': {
    production: {today: 945.2, yesterday: 912.7, total: 945.2},
    chartData: {
      dataSets: [
        {
          values: Array.from({length: 15}, (_, i) => ({
            x: i + 1,
            y: Math.random() * 40 + 20
          })),
          label: 'This Month',
          config: {
            lineWidth: 3,
            color: '#7C3AED',
            circleColor: '#7C3AED',
            circleRadius: 4,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: '#7C3AED',
            fillAlpha: 50,
            drawFilled: true,
          }
        }
      ]
    },
    yesterdayData: {
      values: Array.from({length: 15}, (_, i) => ({
        x: i + 1,
        y: Math.random() * 35 + 18
      })),
      label: 'Last Month',
      config: {
        lineWidth: 2,
        color: processColor('red'),
        circleColor: processColor('red'),
        circleRadius: 3,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('red'),
        fillAlpha: 30,
        drawFilled: true,
      }
    },
    xLabels: Array.from({length: 15}, (_, i) => `${i + 1}`)
  },
  'This Year': {
    production: {today: 11250.5, yesterday: 10890.3, total: 11250.5},
    chartData: {
      dataSets: [
        {
          values: [
            {x: 0, y: 850}, {x: 1, y: 920}, {x: 2, y: 1100}, {x: 3, y: 1280},
            {x: 4, y: 1450}, {x: 5, y: 1520}, {x: 6, y: 1580}, {x: 7, y: 1520},
            {x: 8, y: 1380}, {x: 9, y: 1150}, {x: 10, y: 920}, {x: 11, y: 780}
          ],
          label: 'This Year',
          config: {
            lineWidth: 3,
            color: '#7C3AED',
            circleColor: '#7C3AED',
            circleRadius: 5,
            drawCircles: true,
            drawValues: false,
            mode: 'CUBIC_BEZIER',
            fillColor: '#7C3AED',
            fillAlpha: 50,
            drawFilled: true,
          }
        }
      ]
    },
    yesterdayData: {
      values: [
        {x: 0, y: 780}, {x: 1, y: 850}, {x: 2, y: 1050}, {x: 3, y: 1200},
        {x: 4, y: 1380}, {x: 5, y: 1480}, {x: 6, y: 1520}, {x: 7, y: 1490},
        {x: 8, y: 1350}, {x: 9, y: 1120}, {x: 10, y: 890}, {x: 11, y: 750}
      ],
      label: 'Last Year',
      config: {
        lineWidth: 2,
        color: processColor('red'),
        circleColor: processColor('red'),
        circleRadius: 4,
        drawCircles: true,
        drawValues: false,
        mode: 'CUBIC_BEZIER',
        fillColor: processColor('red'),
        fillAlpha: 30,
        drawFilled: true,
      }
    },
    xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
};

function SolarProduction() {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [showYesterday, setShowYesterday] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const isTablet = screenWidth >= 768;
  const currentData = mockData[selectedPeriod];

  const periods = ['Today', 'This Month', 'This Year'];
  const filterOptions = ['All', 'Morning', 'Afternoon', 'Evening'];

  const getUnit = () => {
    switch(selectedPeriod) {
      case 'Today': return 'kWh';
      case 'This Month': return 'kWh';
      case 'This Year': return 'MWh';
      default: return 'kWh';
    }
  };

  const getChartData = () => {
    let dataSets = [currentData.chartData.dataSets[0]];
    
    if (showYesterday) {
      dataSets.push(currentData.yesterdayData);
    }

    // Apply filters for Today view
    if (selectedPeriod === 'Today' && filterType !== 'All') {
      const totalPoints = currentData.chartData.dataSets[0].values.length;
      const filteredSets = dataSets.map(dataSet => {
        let filteredValues = dataSet.values;
        
        if (filterType === 'Morning') {
          filteredValues = dataSet.values.slice(0, Math.floor(totalPoints / 3));
        } else if (filterType === 'Afternoon') {
          filteredValues = dataSet.values.slice(Math.floor(totalPoints / 3), Math.floor(totalPoints * 2 / 3));
        } else if (filterType === 'Evening') {
          filteredValues = dataSet.values.slice(Math.floor(totalPoints * 2 / 3));
        }
        
        return {...dataSet, values: filteredValues};
      });
      dataSets = filteredSets;
    }

    return {dataSets};
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Solar Energy{'\n'}Production</Text>
      <View style={styles.batteryIndicator}>
        <Text style={styles.batteryText}>95%</Text>
      </View>
    </View>
  );

  const renderPeriodTabs = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabsWrapper}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.tab,
              selectedPeriod === period && styles.activeTab,
            ]}
            onPress={() => setSelectedPeriod(period)}>
            <Text
              style={[
                styles.tabText,
                selectedPeriod === period && styles.activeTabText,
              ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProductionCards = () => (
    <View style={styles.cardsContainer}>
      <View style={[styles.productionCard, styles.primaryCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#7C3AED'}]} />
          <Text style={styles.cardLabel}>Current Production</Text>
        </View>
        <Text style={styles.cardValue}>{currentData.production.today}</Text>
        <Text style={styles.cardUnit}>{getUnit()}</Text>
      </View>

      <View style={[styles.productionCard, styles.secondaryCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: processColor('red')}]} />
          <Text style={styles.cardLabel}>Previous Period</Text>
        </View>
        <Text style={styles.cardValue}>{currentData.production.yesterday}</Text>
        <Text style={styles.cardUnit}>{getUnit()}</Text>
      </View>

      <View style={[styles.productionCard, styles.tertiaryCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.indicator, {backgroundColor: '#10B981'}]} />
          <Text style={styles.cardLabel}>Total Generated</Text>
        </View>
        <Text style={styles.cardValue}>{currentData.production.total}</Text>
        <Text style={styles.cardUnit}>{getUnit()}</Text>
      </View>
    </View>
  );

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Energy Production Trends</Text>
      
      <View style={styles.chartWrapper}>
        <LineChart
          style={styles.chart}
          data={getChartData()}
          chartDescription={{text: ''}}
          legend={{
            enabled: true,
            textSize: 12,
            textColor: '#666666',
            position: 'BELOW_CHART_CENTER',
            form: 'CIRCLE',
            formSize: 8,
          }}
          xAxis={{
            enabled: true,
            textSize: 10,
            textColor: '#666666',
            axisLineColor: '#E5E7EB',
            gridColor: '#F3F4F6',
            position: 'BOTTOM',
            drawAxisLine: true,
            drawGridLines: true,
            granularity: 1,
            labelCount: currentData.xLabels.length,
            valueFormatter: currentData.xLabels,
          }}
          yAxis={{
            left: {
              enabled: true,
              textSize: 10,
              textColor: '#666666',
              axisLineColor: '#E5E7EB',
              gridColor: '#F3F4F6',
              drawAxisLine: false,
              drawGridLines: true,
              position: 'OUTSIDE_CHART',
              spaceTop: 15,
              axisMinimum: 0,
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
          autoScaleMinMaxEnabled={true}
          highlightPerTapEnabled={true}
          highlightPerDragEnabled={false}
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
      <View style={styles.toggleContainer}>
        {renderToggleSwitch(
          showYesterday,
          () => setShowYesterday(!showYesterday),
          "Yesterday's Data"
        )}
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {renderHeader()}
        {renderPeriodTabs()}
        {renderProductionCards()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: screenWidth < 768 ? 28 : 32,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    lineHeight: screenWidth < 768 ? 32 : 38,
  },
  batteryIndicator: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  batteryText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 25,
    padding: 4,
    flex: 1,
    marginRight: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#1E293B',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  activeTabText: {
    color: 'white',
  },
  filterButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  cardsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  productionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  primaryCard: {
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  secondaryCard: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: processColor('red'),
  },
  tertiaryCard: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    // marginBottom: ,
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
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 20,
  },
  chartWrapper: {
    height: screenWidth < 768 ? 220 : 280,
    borderRadius: 8,
  },
  chart: {
    flex: 1,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  weatherIcon: {
    fontSize: 16,
  },
  controlsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  controlsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
    marginBottom: 15,
  },
   controlsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
  insightsContainer: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  insightsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  insightsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#64748B',
  },
});

export default SolarProduction;