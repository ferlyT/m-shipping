import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '../hooks/useThemeColors';

interface DeliveryCardProps {
  id: string;
  route: string;
  status: string;
  statusColor?: string;
  progress: number; // 0 to 1
  steps: string[];
  currentStepIndex: number;
  onPress?: () => void;
  footerContent?: React.ReactNode;
}

export function DeliveryCard({
  id,
  route,
  status,
  statusColor,
  progress,
  steps,
  currentStepIndex,
  onPress,
  footerContent
}: DeliveryCardProps) {
  const Colors = useThemeColors();
  const styles = getStyles(Colors);

  const isDelivered = status.toLowerCase().includes('delivered');
  const activeStep = isDelivered ? steps.length - 1 : currentStepIndex;

  const getStatusHighlight = () => {
    const s = status.toLowerCase();
    let baseColor = Colors.primaryContainer; 
    if (statusColor) baseColor = statusColor;
    else if (s.includes('transit')) baseColor = '#7dd3ff'; 
    else if (s.includes('delivered') || s.includes('complete')) baseColor = '#00e676'; 
    else if (s.includes('pending') || s.includes('sorting')) baseColor = '#fbc02d'; 
    else if (s.includes('fail') || s.includes('reject')) baseColor = '#ef4444'; 
    return { main: baseColor, bg: baseColor, border: baseColor };
  };

  const statusStyle = getStatusHighlight();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={24} tint={Colors.blurTint} style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.monoBlueText}>{id}</Text>
          <View style={[styles.badgeTransit, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
             <Text style={styles.badgeTransitText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.cardMainText} numberOfLines={2}>{route}</Text>

        {/* --- ROBUST SEGMENTED PROGRESS --- */}
        <View style={styles.progressContainer}>
           {steps.map((step, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep && !isDelivered;
              const isLastAndDelivered = idx === steps.length - 1 && isDelivered;
              
              return (
                <View key={idx} style={styles.stepItem}>
                   {/* Line and Dot Segment */}
                   <View style={styles.visualRow}>
                      {/* Left Line Segment (not for first dot) */}
                      <View style={[
                        styles.connector, 
                        idx === 0 && { opacity: 0 },
                        (idx <= activeStep || isDelivered) && { backgroundColor: Colors.primaryContainer }
                      ]} />
                      
                      {/* The Dot */}
                      <View style={[
                        styles.dot,
                        (isCompleted || isLastAndDelivered) && { backgroundColor: Colors.primaryContainer, borderColor: Colors.surface, borderWidth: 2 },
                        isActive && { backgroundColor: '#fff', borderColor: Colors.primaryContainer, borderWidth: 3, shadowColor: Colors.primaryContainer, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4 },
                        idx > activeStep && !isDelivered && styles.dotPending
                      ]} />

                      {/* Right Line Segment (not for last dot) */}
                      <View style={[
                        styles.connector, 
                        idx === steps.length - 1 && { opacity: 0 },
                        ((idx < activeStep) || (isDelivered && idx < steps.length - 1)) && { backgroundColor: Colors.primaryContainer }
                      ]} />
                   </View>

                   {/* Label */}
                   <Text style={[
                      styles.stepLabel,
                      (isActive || isLastAndDelivered) && { color: Colors.primaryContainer, fontWeight: '900' },
                      (isCompleted || isDelivered) && { color: Colors.onSurfaceVariant }
                   ]}>{step}</Text>
                </View>
              )
           })}
        </View>

        {footerContent && (
          <View style={styles.cardFooter}>
            {footerContent}
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  card: { 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1.5, 
    borderColor: Colors.blurTint === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(79, 70, 51, 0.12)', 
    marginBottom: 16 
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monoBlueText: { color: Colors.secondary, fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' },
  cardMainText: { color: Colors.onSurface, fontWeight: 'bold', fontSize: 16, marginBottom: 16 },
  badgeTransit: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5 },
  badgeTransitText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  progressContainer: { flexDirection: 'row', width: '100%', marginTop: 10 },
  stepItem: { flex: 1, alignItems: 'center' },
  visualRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 12 },
  connector: { flex: 1, height: 2, backgroundColor: 'rgba(79, 70, 51, 0.1)' },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 10, backgroundColor: Colors.secondary, borderWidth: 2, borderColor: Colors.surface },
  dotPending: { backgroundColor: Colors.surfaceContainerHighest, borderColor: 'transparent' },
  stepLabel: { fontSize: 8, color: 'rgba(79, 70, 51, 0.4)', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' },

  cardFooter: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(79, 70, 51, 0.1)' },
});
