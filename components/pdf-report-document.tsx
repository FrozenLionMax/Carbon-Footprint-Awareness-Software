import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { ActivityProfile } from '@/lib/context';
import { emissionsByScope, totalAnnualKg, budgetStatus, EMISSION_FACTORS, getScaledProfile } from '@/lib/dashboard-data';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#333333',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginBottom: 10,
    borderRadius: 4,
  },
  alertCard: {
    backgroundColor: '#fff0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ff0000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  }
});

export const PdfReportDocument = ({ profile: baseProfile, fy, isLive }: { profile: ActivityProfile, fy: number, isLive: boolean }) => {
  const { scope1, scope2, scope3 } = emissionsByScope(baseProfile, fy);
  const total = totalAnnualKg(baseProfile, fy);
  const profile = getScaledProfile(baseProfile, fy);
  const budget = budgetStatus(baseProfile, fy);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ESG Compliance & Carbon Ledger</Text>
          <Text style={styles.subtitle}>Generated on {new Date().toLocaleDateString()} | Fiscal Year: {fy}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Total Gross Emissions</Text>
              <Text style={styles.value}>{Math.round(total).toLocaleString()} kg CO2e</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>1.5°C Paris Agreement Allowance</Text>
              <Text style={styles.value}>{Math.round(budget.budgetMax).toLocaleString()} kg CO2e</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Overshoot Ratio</Text>
              <Text style={styles.value}>{budget.overshootRatio.toFixed(2)}x</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Telemetry Mode</Text>
              <Text style={styles.value}>{isLive ? "LIVE (National Grid Connected)" : "STATIC (Baseline Average)"}</Text>
            </View>
          </View>
          
          {budget.budgetExhaustedDay < 365 && (
            <View style={styles.alertCard}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#cc0000', marginBottom: 5 }}>CRITICAL OVERSHOOT WARNING</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4 }}>
                At the current trajectory, the 1.5°C annual carbon allowance will be fully exhausted on day {budget.budgetExhaustedDay} of the fiscal year. 
                Immediate mitigation strategies are required for the remaining {365 - budget.budgetExhaustedDay} days.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope 1: Direct Emissions</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Petrol Vehicle</Text>
            <Text style={styles.value}>{Math.round(profile.petrolLitre * EMISSION_FACTORS.petrolLitre).toLocaleString()} kg</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Scope 1 Total</Text>
            <Text style={styles.totalValue}>{Math.round(scope1).toLocaleString()} kg</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope 2: Indirect (Purchased Energy)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Grid Electricity</Text>
            <Text style={styles.value}>{Math.round(profile.electricityKwh * EMISSION_FACTORS.electricityKwh).toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Natural Gas (Heating)</Text>
            <Text style={styles.value}>{Math.round(profile.naturalGasKwh * EMISSION_FACTORS.naturalGasKwh).toLocaleString()} kg</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Scope 2 Total</Text>
            <Text style={styles.totalValue}>{Math.round(scope2).toLocaleString()} kg</Text>
          </View>
        </View>
        
        <Text style={styles.footer}>
          CARBON LEDGER DETERMINISTIC ENGINE | GHG PROTOCOL ALIGNED | Page 1 of 2
        </Text>
      </Page>
      
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Scope 3 & Governance</Text>
          <Text style={styles.subtitle}>Supply Chain & Value Chain Emissions</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope 3: Value Chain</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Flight (Short Haul)</Text>
            <Text style={styles.value}>{Math.round(profile.flightShortHaulKm * EMISSION_FACTORS.flightShortHaulKm).toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Flight (Long Haul)</Text>
            <Text style={styles.value}>{Math.round(profile.flightLongHaulKm * EMISSION_FACTORS.flightLongHaulKm).toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diet (Red Meat)</Text>
            <Text style={styles.value}>{Math.round(profile.redMeatKg * EMISSION_FACTORS.redMeatKg).toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diet (Dairy)</Text>
            <Text style={styles.value}>{Math.round(profile.dairyKg * EMISSION_FACTORS.dairyKg).toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diet (Plant-based)</Text>
            <Text style={styles.value}>{Math.round(profile.plantKg * EMISSION_FACTORS.plantKg).toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Procurement (Goods Spend)</Text>
            <Text style={styles.value}>{Math.round(profile.goodsSpendUsd * EMISSION_FACTORS.goodsSpendUsd).toLocaleString()} kg</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Scope 3 Total</Text>
            <Text style={styles.totalValue}>{Math.round(scope3).toLocaleString()} kg</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ESG Governance Metrics</Text>
          <View style={styles.card}>
             <View style={styles.row}>
              <Text style={styles.label}>Renewable Energy Share</Text>
              <Text style={styles.value}>{profile.renewableSharePct.toFixed(1)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Waste Diversion Rate</Text>
              <Text style={styles.value}>{profile.wasteDiversionPct.toFixed(1)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Supplier Transparency</Text>
              <Text style={styles.value}>{profile.supplierTransparencyPct.toFixed(1)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Data Completeness</Text>
              <Text style={styles.value}>{profile.dataCompletenessPct.toFixed(1)}%</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Offset Coverage</Text>
              <Text style={styles.value}>{profile.offsetCoveragePct.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          CARBON LEDGER DETERMINISTIC ENGINE | GHG PROTOCOL ALIGNED | Page 2 of 2
        </Text>
      </Page>
    </Document>
  );
};
