import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Calendar, Download, PieChart, BarChart3, ChevronRight, FileSpreadsheet, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { ScreenContainer } from '../components/ScreenContainer';

const { width } = Dimensions.get('window');

// --- TS Interface ---
interface ReportData {
  totalBilling: string;
  collected: string;
  growth: string;
  monthlyRevenue: { month: string; value: number }[];
  distribution: { label: string; value: number; color: string }[];
  topCustomers: { name: string; amount: string; trend: 'up' | 'down' }[];
}

const MOCK_REPORT: ReportData = {
  totalBilling: 'IDR 842.5M',
  collected: 'IDR 624.0M',
  growth: '+12.4%',
  monthlyRevenue: [
    { month: 'Jun', value: 45 },
    { month: 'Jul', value: 65 },
    { month: 'Aug', value: 50 },
    { month: 'Sep', value: 85 },
    { month: 'Oct', value: 70 },
    { month: 'Nov', value: 95 },
  ],
  distribution: [
    { label: 'Cleared', value: 74, color: '#00e676' },
    { label: 'Pending', value: 18, color: '#fbc02d' },
    { label: 'Overdue', value: 8, color: '#ff5252' },
  ],
  topCustomers: [
    { name: 'Global Logistics Corp', amount: '245.8M', trend: 'up' },
    { name: 'Indo Maritime Ltd', amount: '182.2M', trend: 'up' },
    { name: 'Pacific Gateway', amount: '92.4M', trend: 'down' },
  ]
};

export default function InvoiceReportScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
  const router = useRouter();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(MOCK_REPORT);
      setLoading(false);
    };
    fetchReport();
  }, []);

  if (loading || !data) {
    return (
      <ScreenContainer showBack={true} title="Analytics">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>Generating Financial Report...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const HeaderRight = (
    <TouchableOpacity style={styles.iconBtn}>
      <Share2 color={Colors.secondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer showBack={true} title="Billing Report" rightContent={HeaderRight}>
        {/* Main Stats Card */}
        <LinearGradient colors={['#353535', '#1a1a1a']} style={styles.heroCard} start={{x:0, y:0}} end={{x:1, y:1}}>
           <View style={styles.heroHeader}>
              <View>
                 <Text style={styles.heroLabel}>Total Revenue (YTD)</Text>
                 <Text style={styles.heroValue}>{data.totalBilling}</Text>
              </View>
              <View style={styles.growthBadge}>
                 <TrendingUp color="#00e676" size={14} />
                 <Text style={styles.growthText}>{data.growth}</Text>
              </View>
           </View>
           <View style={styles.heroFooter}>
              <View>
                 <Text style={styles.footerLabel}>COLLECTED</Text>
                 <Text style={styles.footerValue}>{data.collected}</Text>
              </View>
              <View style={styles.vDivider} />
              <View>
                 <Text style={styles.footerLabel}>COLLECTION RATE</Text>
                 <Text style={styles.footerValue}>74.1%</Text>
              </View>
           </View>
        </LinearGradient>

        {/* Charts Section */}
        <View style={styles.sectionHeader}>
           <BarChart3 color={Colors.primaryContainer} size={18} />
           <Text style={styles.sectionTitle}>Revenue Trend</Text>
        </View>
        
        <BlurView intensity={20} tint={Colors.blurTint} style={styles.chartCard}>
           <View style={styles.barChartContainer}>
              {data.monthlyRevenue.map((item, idx) => (
                <View key={idx} style={styles.barItem}>
                   <View style={[styles.bar, { height: `${item.value}%`, backgroundColor: idx === 5 ? Colors.primaryContainer : 'rgba(79, 70, 51, 0.4)' }]} />
                   <Text style={styles.barLabel}>{item.month}</Text>
                </View>
              ))}
           </View>
        </BlurView>

        {/* Distribution Section */}
        <View style={styles.gridRow}>
           <BlurView intensity={20} tint={Colors.blurTint} style={[styles.card, { flex: 1 }]}>
              <View style={[styles.cardHeader, { marginBottom: 16 }]}>
                 <PieChart color={Colors.primaryContainer} size={16} />
                 <Text style={styles.cardSmallTitle}>Status Distribution</Text>
              </View>
              <View style={styles.distContainer}>
                 {data.distribution.map((item, idx) => (
                    <View key={idx} style={styles.distRow}>
                       <View style={styles.distLabelGroup}>
                          <View style={[styles.dot, { backgroundColor: item.color }]} />
                          <Text style={styles.distLabel}>{item.label}</Text>
                       </View>
                       <Text style={styles.distValue}>{item.value}%</Text>
                    </View>
                 ))}
                 <View style={styles.ringChartPlaceholder}>
                    <View style={styles.ringOuter}><View style={styles.ringInner} /></View>
                 </View>
              </View>
           </BlurView>
        </View>

        {/* Top Debtors Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
           <FileSpreadsheet color={Colors.primaryContainer} size={18} />
           <Text style={styles.sectionTitle}>Top Customers</Text>
        </View>

        <View style={styles.customerList}>
           {data.topCustomers.map((cust, idx) => (
              <BlurView key={idx} intensity={20} tint={Colors.blurTint} style={styles.customerRow}>
                 <View style={styles.custInfo}>
                    <Text style={styles.custName}>{cust.name}</Text>
                    <Text style={styles.custAmount}>IDR {cust.amount}</Text>
                 </View>
                 <View style={[styles.trendIcon, cust.trend === 'down' && styles.trendIconDown]}>
                    <TrendingUp color={cust.trend === 'up' ? '#00e676' : '#ff5252'} size={14} style={cust.trend === 'down' && { transform: [{ rotate: '90deg' }] }} />
                 </View>
              </BlurView>
           ))}
        </View>

        {/* Export Actions */}
        <View style={styles.actionRow}>
           <TouchableOpacity style={styles.actionBtn}>
              <Download color="#fff" size={16} />
              <Text style={styles.actionBtnText}>Export CSV</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.3)' }]}>
              <Calendar color={Colors.onSurface} size={16} />
              <Text style={[styles.actionBtnText, { color: Colors.onSurface }]}>Period: Q4 2023</Text>
           </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.secondary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  iconBtn: { padding: 8 },
  heroCard: { padding: 24, borderRadius: 24, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  heroLabel: { fontSize: 10, fontWeight: 'bold', color: Colors.secondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  heroValue: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 8 },
  growthBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  growthText: { color: '#00e676', fontSize: 11, fontWeight: 'bold' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  footerLabel: { fontSize: 8, fontWeight: 'bold', color: Colors.secondary, letterSpacing: 1 },
  footerValue: { fontSize: 16, fontWeight: '900', color: '#fff', marginTop: 4 },
  vDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.onSurface },
  chartCard: { padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.15)', marginBottom: 24 },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150 },
  barItem: { alignItems: 'center', gap: 12 },
  bar: { width: 30, borderRadius: 6 },
  barLabel: { fontSize: 10, color: Colors.secondary, fontWeight: 'bold' },
  gridRow: { marginBottom: 16 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.15)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardSmallTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface },
  distContainer: { gap: 12 },
  distRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  distLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  distLabel: { fontSize: 12, color: Colors.secondary },
  distValue: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface },
  ringChartPlaceholder: { height: 10, width: '100%', backgroundColor: 'rgba(79, 70, 51, 0.1)', borderRadius: 5, marginTop: 12, overflow: 'hidden' },
  ringOuter: { height: '100%', width: '74%', backgroundColor: '#00e676', borderRadius: 5 },
  ringInner: { height: '100%', width: '18%', backgroundColor: '#fbc02d' },
  customerList: { gap: 10, marginBottom: 32 },
  customerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.1)' },
  custName: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface },
  custAmount: { fontSize: 12, color: Colors.secondary, marginTop: 4 },
  trendIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0, 230, 118, 0.1)', alignItems: 'center', justifyContent: 'center' },
  trendIconDown: { backgroundColor: 'rgba(255, 82, 82, 0.1)' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, height: 50, backgroundColor: Colors.onSurface, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  actionBtnText: { color: Colors.surface, fontSize: 13, fontWeight: 'bold' },
});
