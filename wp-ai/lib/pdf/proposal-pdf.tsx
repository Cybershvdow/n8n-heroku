import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #D4FF00',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  proposalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginTop: 30,
    marginBottom: 10,
  },
  clientInfo: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    width: 100,
  },
  value: {
    fontSize: 10,
    color: '#0A0E1A',
    fontWeight: 'bold',
  },
  pricingBox: {
    backgroundColor: '#F8FAFC',
    border: '2px solid #D4FF00',
    borderRadius: 8,
    padding: 20,
    marginVertical: 30,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A0E1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTop: '1px solid #E2E8F0',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0E1A',
    marginBottom: 12,
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: 8,
  },
  sectionContent: {
    fontSize: 10,
    color: '#1A1F2E',
    lineHeight: 1.6,
  },
  roomsList: {
    marginTop: 10,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  roomName: {
    fontSize: 10,
    color: '#0A0E1A',
    fontWeight: 'bold',
  },
  roomType: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  roomTime: {
    fontSize: 9,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #E2E8F0',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#94A3B8',
  },
})

interface ProposalPDFProps {
  proposal: any
  client: any
  user: any
  walkthrough: any
}

export const ProposalPDF: React.FC<ProposalPDFProps> = ({
  proposal,
  client,
  user,
  walkthrough,
}) => {
  const totalMinutes = walkthrough.rooms.reduce(
    (sum: number, room: any) => sum + room.estimatedMinutes,
    0
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{user.company || user.name}</Text>
          <Text style={styles.subtitle}>Professional Janitorial Services</Text>
        </View>

        {/* Proposal Title */}
        <Text style={styles.proposalTitle}>{proposal.title}</Text>

        {/* Client Information */}
        <View style={styles.clientInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{client.name}</Text>
          </View>
          {client.contactName && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{client.contactName}</Text>
            </View>
          )}
          {client.email && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{client.email}</Text>
            </View>
          )}
          {client.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{client.phone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {new Date(proposal.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Pricing Box */}
        <View style={styles.pricingBox}>
          <Text style={styles.priceAmount}>
            ${proposal.monthlyPrice.toLocaleString()}
          </Text>
          <Text style={styles.priceLabel}>per month</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {proposal.totalMonthlyHours.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Hours/Month</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{walkthrough.rooms.length}</Text>
              <Text style={styles.statLabel}>Areas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{walkthrough.daysPerWeek}</Text>
              <Text style={styles.statLabel}>Days/Week</Text>
            </View>
          </View>
        </View>

        {/* Introduction */}
        {proposal.introduction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.sectionContent}>{proposal.introduction}</Text>
          </View>
        )}

        {/* Scope of Work */}
        {proposal.scopeOfWork && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope of Work</Text>
            <Text style={styles.sectionContent}>{proposal.scopeOfWork}</Text>
          </View>
        )}

        {/* Areas Included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas Included</Text>
          <View style={styles.roomsList}>
            {walkthrough.rooms.map((room: any, index: number) => (
              <View key={index} style={styles.roomItem}>
                <View>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomType}>
                    {room.roomType.replace(/_/g, ' ')}
                  </Text>
                </View>
                <Text style={styles.roomTime}>{room.estimatedMinutes} min</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Terms & Conditions */}
        {proposal.termsConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.sectionContent}>{proposal.termsConditions}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {user.company || user.name} | {user.email}
            {user.phone && ` | ${user.phone}`}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
