import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useThemeColors } from '@/src/store/useThemeStore';
import { 
  ArrowLeft, Droplet, Wind, Navigation, Sparkles, 
  CheckCircle2, AlertCircle, Info, ChevronRight,
  PackageCheck, HelpCircle, Award
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import PinnedScreenHeader from '@/components/PinnedScreenHeader';

const { width } = Dimensions.get('window');
const RADIUS = 10;
const PADDING = 16;

const GuideStep = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => {
  const c = useThemeColors();
  return (
    <View style={[styles.stepCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}>
       <View style={[styles.stepIcon, { backgroundColor: color + '15' }]}>
          <Icon color={color} size={28} />
       </View>
       <View style={styles.stepContent}>
          <Text style={[styles.stepTitle, { color: c.text }]}>{title}</Text>
          <Text style={[styles.stepDesc, { color: c.textMuted }]}>{desc}</Text>
       </View>
    </View>
  );
};

export default function GuideScreen() {
  const c = useThemeColors();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <PinnedScreenHeader
        left={
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: c.surface, borderColor: c.surfaceBorder }]}
          >
            <ArrowLeft color={c.text} size={22} />
          </TouchableOpacity>
        }
        title="How to Return"
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
         <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.surfaceBorder, borderWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.heroInfo}>
               <Award color={c.text} size={32} strokeWidth={2.5} />
               <Text style={[styles.heroTitle, { color: c.heading }]}>Clean and Earn</Text>
               <Text style={[styles.heroDesc, { color: c.textMuted }]}>Ensure your containers are clean to receive 100% of your points and rewards.</Text>
            </View>
            <View style={styles.heroDecorative}>
               <PackageCheck color={c.surfaceBorder} size={120} strokeWidth={1} />
            </View>
         </View>

         <Text style={[styles.sectionLabel, { color: c.textFaint }]}>THREE SIMPLE STEPS</Text>
         
         <GuideStep 
           icon={Droplet} 
           color="#3B82F6" 
           title="1. Quick Wash" 
           desc="Rinse your container with water to remove any food residue. A little soap helps for oily items!" 
         />

         <GuideStep 
           icon={Wind} 
           color="#1E40AF" 
           title="2. Dry Thoroughly" 
           desc="Let the container air dry or wipe it with a cloth. Stacking wet containers can cause issues." 
         />

         <GuideStep 
           icon={Navigation} 
           color="#F59E0B" 
           title="3. Return to Vendor" 
           desc="Take your clean container to any partner vendor or bin and scan the QR code to finish!" 
         />

         <View style={[styles.alertBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
            <AlertCircle color="#EF4444" size={20} />
            <Text style={styles.alertText}>
              Dirty or damaged containers may result in reduced points or account flagging.
            </Text>
         </View>

         <View style={styles.faqSection}>
            <Text style={[styles.sectionLabel, { color: c.textFaint }]}>COMMON QUESTIONS</Text>
            
            <TouchableOpacity style={[styles.faqRow, { borderBottomColor: c.surfaceBorder }]}>
               <Text style={[styles.faqText, { color: c.textSecondary }]}>Why do I need to wash it?</Text>
               <ChevronRight color={c.textFaint} size={16} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.faqRow, { borderBottomColor: c.surfaceBorder }]}>
               <Text style={[styles.faqText, { color: c.textSecondary }]}>Where can I find return bins?</Text>
               <ChevronRight color={c.textFaint} size={16} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.faqRow}>
               <Text style={[styles.faqText, { color: c.textSecondary }]}>What if my container is broken?</Text>
               <ChevronRight color={c.textFaint} size={16} />
            </TouchableOpacity>
         </View>
      </ScrollView>

      <TouchableOpacity 
         style={[styles.actionBtn, { backgroundColor: c.text }]}
         onPress={() => router.back()}
      >
         <Text style={[styles.actionBtnText, { color: c.bg }]}>GOT IT, THANKS!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
     width: 44,
     height: 44,
     borderRadius: 22,
     borderWidth: 1,
     justifyContent: 'center',
     alignItems: 'center',
  },
  subTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  scrollContent: { paddingHorizontal: PADDING, paddingBottom: 100 },

  heroCard: {
    padding: 24,
    borderRadius: RADIUS,
    height: 180,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 32,
  },
  heroInfo: { flex: 1, justifyContent: 'center', zIndex: 1 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 12, marginBottom: 8 },
  heroDesc: { color: '#ffffffcc', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  heroDecorative: { position: 'absolute', bottom: -10, right: -20, opacity: 0.5 },

  sectionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 16 },

  stepCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: RADIUS,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  stepIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: PADDING },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  stepDesc: { fontSize: 14, fontWeight: '600', lineHeight: 20 },

  alertBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
    gap: 12,
  },
  alertText: { flex: 1, color: '#991B1B', fontSize: 13, fontWeight: '700', lineHeight: 18 },

  faqSection: { marginTop: 10 },
  faqRow: { 
     flexDirection: 'row', 
     alignItems: 'center', 
     justifyContent: 'space-between', 
     paddingVertical: 18,
     borderBottomWidth: 0.5,
  },
  faqText: { fontSize: 14, fontWeight: '700' },

  actionBtn: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: PADDING,
    right: PADDING,
    height: 56,
    borderRadius: RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  actionBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
});
