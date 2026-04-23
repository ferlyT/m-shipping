import { BlurView } from 'expo-blur';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Check, Download, Receipt, Share2 } from 'lucide-react-native';
import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ScreenContainer } from '../components/ScreenContainer';
import { useLanguage } from '../context/LanguageContext';
import { useFetch } from '../hooks/useFetch';
import { useThemeColors } from '../hooks/useThemeColors';

// --- TS Interface ---
interface InvoiceDetail {
  id: string;
  status: 'CLEARED' | 'PENDING' | 'OVERDUE';
  amount: string;
  customer: {
    name: string;
    address: string;
  };
  dueDate: string;
  issueDate: string;
  paymentMethod: string;
  paymentDetail: string;
  items: {
    name: string;
    description: string;
    amount: string;
  }[];
  subtotal: string;
  tax: string;
  total: string;
}

const MOCK_INVOICE_DETAIL: InvoiceDetail = {
  id: 'INV/2024/0402',
  status: 'CLEARED',
  amount: '4.250.000',
  customer: {
    name: 'Global Tech Solution',
    address: 'Sudirman Central Business District, Jakarta'
  },
  dueDate: 'OCT 24, 2023',
  issueDate: 'OCT 12, 2023',
  paymentMethod: 'VISA',
  paymentDetail: 'Vault (•••• 9012)',
  items: [
    { name: 'Standard Freight', description: 'Jakarta -> Surabaya (32 Pallets)', amount: '3.800.000' },
    { name: 'Handling Fee', description: 'Loading & Priority Placement', amount: '450.000' }
  ],
  subtotal: '4.250.000',
  tax: '0',
  total: '4.250.000'
};

export default function InvoiceDetailScreen() {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);
    const { id } = useLocalSearchParams();
  const { t } = useLanguage();

  const { data: invoice, loading, refreshing, refetch } = useFetch<InvoiceDetail>(`/invoices/${id}`, MOCK_INVOICE_DETAIL);
  const viewShotRef = useRef<any>(null);

  if (loading || !invoice) {
    return (
      <ScreenContainer showBack={true} showBottomNav={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryContainer} />
          <Text style={styles.loadingText}>Retreiving Billing Data...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const onShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `Share Invoice ${invoice.id}`,
        UTI: 'public.png',
      });
    } catch (error) {
      console.log('Share Error:', error);
    }
  };
  const onDownloadPDF = async () => {
    // Terbilang: convert number to Indonesian words
    const terbilang = (n: number): string => {
      if (n === 0) return "";
      if (n < 12) return ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"][n];
      if (n < 20) return terbilang(n - 10) + " Belas";
      if (n < 100) return terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
      if (n < 200) return "Seratus " + terbilang(n - 100);
      if (n < 1000) return terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
      if (n < 2000) return "Seribu " + terbilang(n - 1000);
      if (n < 1000000) return terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
      if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
      return "";
    };

    // Format number with commas: 2392950 -> "2,392,950.00"
    const formatNumber = (val: string) => {
      const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
      return num.toLocaleString('en-US') + '.00';
    };

    const cleanAmount = parseInt(invoice.total.replace(/[^0-9]/g, '')) || 0;
    const terbilangText = cleanAmount === 0 ? "Nol" : terbilang(cleanAmount).trim();
    const formattedTotal = formatNumber(invoice.total);
    const formattedUnitPrice = formatNumber(invoice.items[0]?.amount || '0');
    const formattedItemAmount = formatNumber(invoice.items[0]?.amount || '0');

    const html = `<html>

<head>
    <style>
        @page {
            size: 595pt 420pt;
            margin: 20pt 25pt;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000;
            font-size: 9pt;
        }

        /* HEADER */
        .hdr {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8pt;
        }

        .hdr td {
            border: 1pt solid #000;
            vertical-align: top;
        }

        /* INFO ROWS - use table for colon alignment */
        .info-tbl {
            width: 100%;
            border-collapse: collapse;
        }

        .info-tbl td {
            border: none;
            padding: 5pt 8pt;
            font-size: 9pt;
            vertical-align: top;
        }

        .info-tbl tr+tr td {
            border-top: 1pt solid #000;
        }

        .lbl {
            color: #1a2744;
            font-weight: bold;
            white-space: nowrap;
            width: 65pt;
        }

        .colon {
            width: 10pt;
            color: #1a2744;
        }

        /* INVOICE TABLE */
        .inv {
            width: 100%;
            border-collapse: collapse;
            border: 1pt solid #000;
            table-layout: fixed;
        }

        .inv th {
            border: 1pt solid #000;
            padding: 4pt 6pt;
            font-size: 9pt;
            font-weight: normal;
            text-align: center;
        }

        .inv td {
            padding: 6pt;
            vertical-align: top;
            font-size: 9pt;
        }

        .border {
            border: 1pt solid #000;
            border-bottom: none !important;
        }

        .border-no-top {
            border: 1pt solid #000;
            border-top: none !important;
        }

        .line {
            width: 100%;
            height: 1px;
            background: black;
            margin: 0 auto 5px auto;
        }


        /* Watermark */
        .wm-wrap {
            position: relative;
        }

        .wm {
            position: absolute;
            top: 42%;
            left: 55%;
            transform: translate(-50%, -50%) rotate(-12deg);
            font-size: 65pt;
            color: rgba(0, 0, 0, 0.04);
            font-weight: bold;
            pointer-events: none;
            z-index: 1;
            letter-spacing: 4pt;
        }

        /* Price alignment helper */
        .p-tbl {
            width: 100%;
            border-collapse: collapse;
        }

        .p-tbl td {
            border: none !important;
            padding: 0 !important;
            font-size: 9pt;
        }

        .printed {
            text-align: right;
            font-size: 6pt;
            margin-top: 3pt;
            color: #444;
        }
    </style>
</head>

<body>

    <!-- HEADER -->
    <table class="hdr">
        <tr>
            <td colspan="2" style="width:60%; padding:12pt 10pt; height:55pt; font-size:11pt;">
                <span class="lbl" style="font-size:11pt;">To :</span> &nbsp; ${invoice.customer.name.toUpperCase()}
            </td>
            <td style="width:40%; padding:0">
                <table class="info-tbl">
                    <tr>
                        <td class="lbl">BILL NO</td>
                        <td class="colon">:</td>
                        <td>${invoice.id}</td>
                    </tr>
                    <tr>
                        <td class="lbl">DATE</td>
                        <td class="colon">:</td>
                        <td>${invoice.dueDate}</td>
                    </tr>
                    <tr>
                        <td class="lbl">MARKING</td>
                        <td class="colon">:</td>
                        <td>26YWA05<br />SP/OMAN:1-1</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="width:30%; padding:5pt 10pt">SALES : PA</td>
            <td style="width:30%; padding:5pt 10pt">COLLECTOR : CO</td>
            <td style="border:none"></td>
        </tr>
    </table>

    <!-- INVOICE TABLE -->
    <div class="wm-wrap">
        <div class="wm">COPY</div>
        <table class="inv">
            <tr>
                <th style="width:11%">QTY</th>
                <th style="width:44%">DESCRIPTION</th>
                <th style="width:22%">UNIT PRICE</th>
                <th style="width:23%">AMOUNT</th>
            </tr>
            <!-- Data row -->
            <tr>
                <td class="border" style="text-align:center; height:220pt; vertical-align:top; padding-top:8pt">
                    0.5565 &nbsp;M3
                </td>
                <td class="border" style="vertical-align:top; padding-top:8pt">
                    <div style="font-weight:bold; font-size:10pt">${invoice.items[0].name.toUpperCase()}</div>
                    <div style="margin-top:2pt">${invoice.items[0].description}</div>
                </td>
                <td class="border" style="vertical-align:top; padding-top:8pt">
                    <table class="p-tbl">
                        <tr>
                            <td style="width:22pt">RP.</td>
                            <td style="text-align:right">${formattedUnitPrice}</td>
                        </tr>
                    </table>
                </td>
                <td class="border" style="vertical-align:top; padding-top:8pt">
                    <table class="p-tbl">
                        <tr>
                            <td style="width:22pt">RP.</td>
                            <td style="text-align:right">${formattedItemAmount}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <!-- Terbilang + Total row -->
            <tr>
                <td class="border-no-top" style="vertical-align:bottom; padding-bottom:6pt">&nbsp;</td>
                <td class="border-no-top" style="vertical-align:bottom; padding-bottom:6pt">
                    <table class="p-tbl">
                        <tr>
                            <td style="width:60pt; vertical-align:top; padding-bottom:2pt !important">Terbilang</td>
                            <td style="vertical-align:top; padding-bottom:2pt !important">${terbilangText}
                                &nbsp;&nbsp;Rp.</td>
                        </tr>
                    </table>
                    <div style="font-weight:bold">**</div>
                </td>
                <td class="border-no-top" style="vertical-align:bottom; padding-bottom:6pt">&nbsp;</td>
                <td class="border-no-top" style="vertical-align:bottom; padding-bottom:6pt">
                    <div style="padding-top:5pt; margin-top:3pt">
                        <table class="p-tbl">
                            <tr>
                                <div class="line"></div>
                                <td style="width:22pt; font-size:10pt">Rp.</td>
                                <td style="text-align:right; font-weight:bold; font-size:11pt">${formattedTotal}</td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="printed">Printed by : Ferly</div>

</body>

</html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html, width: 595, height: 420 });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.log('PDF Error:', error);
    }
  };

  const HeaderRight = (
    <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
      <Share2 color={Colors.secondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer
      showBack={true}
      rightContent={HeaderRight}
      showBottomNav={false}
      onRefresh={refetch}
      refreshing={refreshing}
      withScroll={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={{ backgroundColor: Colors.surface }}>
          {/* Top Header Card */}
          <BlurView intensity={24} tint={Colors.blurTint} style={styles.headerCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{invoice.status}</Text>
                <View style={styles.checkIcon}><Check color={Colors.onPrimary} size={10} /></View>
              </View>
              <Text style={styles.invoiceId}>{invoice.id}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>{t.invoice_amount}</Text>
              <Text style={styles.amountValue}>IDR {invoice.amount}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.primaryAction} onPress={onDownloadPDF}>
                <Download color={Colors.onPrimary} size={16} />
                <Text style={styles.primaryActionText}>{t.download_pdf}</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <BlurView intensity={24} tint={Colors.blurTint} style={[styles.infoCard, { flex: 1.5 }]}>
                <Text style={styles.infoCardLabel}>{t.bill_to}</Text>
                <Text style={styles.infoCardValue}>{invoice.customer.name}</Text>
                <Text style={styles.infoCardSub}>{invoice.customer.address}</Text>
              </BlurView>
              <BlurView intensity={24} tint={Colors.blurTint} style={[styles.infoCard, { flex: 1 }]}>
                <Text style={styles.infoCardLabel}>{t.due_date}</Text>
                <Text style={styles.dateTextPrimary}>{invoice.dueDate}</Text>
                <Text style={styles.infoCardSub}>Issued: {invoice.issueDate}</Text>
              </BlurView>
            </View>

            <View style={styles.infoRow}>
              <BlurView intensity={24} tint={Colors.blurTint} style={[styles.infoCard, { flex: 1, padding: 16 }]}>
                <Text style={styles.infoCardLabel}>{t.payment_method}</Text>
                <View style={styles.paymentRow}>
                  <View style={styles.visaBox}><Text style={styles.visaText}>{invoice.paymentMethod}</Text></View>
                  <View>
                    <Text style={styles.paymentText}>{invoice.paymentDetail}</Text>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Itemized Breakdown */}
          <View style={styles.sectionHeader}>
            <Receipt color={Colors.primaryContainer} size={18} />
            <Text style={styles.sectionTitle}>{t.service_details}</Text>
          </View>

          <BlurView intensity={24} tint={Colors.blurTint} style={styles.itemsCard}>
            {invoice.items.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, idx !== 0 && styles.itemBorder]}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                </View>
                <Text style={styles.itemAmount}>IDR {item.amount}</Text>
              </View>
            ))}

            <View style={styles.recessContainer}>
              <View style={styles.recessRow}>
                <Text style={styles.recessLabel}>{t.subtotal}</Text>
                <Text style={styles.recessValue}>IDR {invoice.subtotal}</Text>
              </View>
              <View style={styles.recessRow}>
                <Text style={styles.recessLabel}>{t.tax} (0%)</Text>
                <Text style={styles.recessValue}>IDR {invoice.tax}</Text>
              </View>
              <View style={[styles.recessRow, styles.totalRecess]}>
                <Text style={styles.totalLabel}>{t.total_amount_due}</Text>
                <Text style={styles.totalValue}>IDR {invoice.total}</Text>
              </View>
            </View>
          </BlurView>

          <View style={{ height: 100 }} />
        </ViewShot>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.secondary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  iconBtn: { padding: 8 },
  headerCard: { borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.15)', marginBottom: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  checkIcon: { backgroundColor: '#22c55e', width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  invoiceId: { color: Colors.secondary, fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' },
  amountContainer: { alignItems: 'center', marginBottom: 32 },
  amountLabel: { color: Colors.secondary, fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8 },
  amountValue: { color: Colors.onSurface, fontSize: 36, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 12 },
  primaryAction: { flex: 1, backgroundColor: Colors.primaryContainer, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  primaryActionText: { color: Colors.onPrimary, fontSize: 13, fontWeight: 'bold' },
  secondaryAction: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.2)', borderRadius: 12 },
  secondaryActionText: { color: Colors.onSurface, fontSize: 13, fontWeight: 'bold' },
  infoGrid: { gap: 12, marginBottom: 32 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.1)' },
  infoCardLabel: { fontSize: 8, fontWeight: '900', color: Colors.secondary, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  infoCardValue: { fontSize: 14, fontWeight: 'bold', color: Colors.onSurface, marginBottom: 4 },
  infoCardSub: { fontSize: 10, color: Colors.secondary, lineHeight: 14 },
  dateTextPrimary: { fontSize: 14, fontWeight: 'bold', color: Colors.secondary, marginBottom: 4 },
  paymentRow: { flexDirection: 'column', gap: 8 },
  visaBox: { backgroundColor: Colors.surfaceContainerHighest, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  visaText: { color: Colors.onSurface, fontSize: 10, fontWeight: '900' },
  paymentText: { color: Colors.onSurface, fontSize: 13, fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { color: Colors.onSurface, fontSize: 16, fontWeight: 'bold' },
  itemsCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(79, 70, 51, 0.1)' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
  itemBorder: { borderTopWidth: 1, borderTopColor: 'rgba(79, 70, 51, 0.1)' },
  itemName: { color: Colors.onSurface, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemDesc: { color: Colors.secondary, fontSize: 11, lineHeight: 16 },
  itemAmount: { color: Colors.onSurface, fontSize: 14, fontWeight: 'bold' },
  recessContainer: { marginTop: 8, gap: 12, paddingTop: 20, borderTopWidth: 2, borderTopColor: 'rgba(79, 70, 51, 0.1)' },
  recessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recessLabel: { color: Colors.secondary, fontSize: 13 },
  recessValue: { color: Colors.onSurface, fontSize: 13, fontWeight: 'bold' },
  totalRecess: { marginTop: 8, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(79, 70, 51, 0.1)', flexDirection: 'column', alignItems: 'flex-start', gap: 8 },
  totalLabel: { color: Colors.primaryContainer, fontWeight: 'bold', fontSize: 11, letterSpacing: 2 },
  totalValue: { color: Colors.onSurface, fontSize: 28, fontWeight: '900' },
});
