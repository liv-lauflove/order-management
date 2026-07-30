'use client'

import { Document, Page, Text, View, StyleSheet, Image as PdfImage } from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  invoiceNo: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  customerInfo: {
    width: '50%',
  },
  infoText: {
    marginBottom: 3,
  },
  bold: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f3ee',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  colDesc: { width: '50%' },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  productImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    objectFit: 'cover',
  },
  descContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  summaryBlock: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 4,
  },
  summaryTotalText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  notes: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    color: '#666',
  }
})

export const InvoicePDF = ({ invoice, settings }: { invoice: any, settings: any }) => {
  const companyLogo = invoice.logoUrl || settings?.companyLogoUrl || null
  const companyName = settings?.companyName || 'DC Habitat'
  const companyAddress = settings?.address || ''
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {companyLogo ? (
              <PdfImage src={companyLogo} style={styles.logo} />
            ) : (
              <Text style={styles.title}>{companyName}</Text>
            )}
            <Text style={[styles.infoText, { marginTop: 10, width: 200 }]}>{companyAddress}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNo}>{invoice.invoiceNumber}</Text>
            <Text style={[styles.infoText, { marginTop: 10 }]}>Date: {format(new Date(invoice.createdAt), 'dd MMM yyyy')}</Text>
          </View>
        </View>

        {/* Customer & Order Info */}
        <View style={[styles.section, { flexDirection: 'row' }]}>
          <View style={styles.customerInfo}>
            <Text style={[styles.infoText, styles.bold, { color: '#666' }]}>BILL TO:</Text>
            <Text style={[styles.infoText, styles.bold, { fontSize: 12, marginTop: 4 }]}>{invoice.customer.name}</Text>
            {invoice.customer.phone && <Text style={styles.infoText}>{invoice.customer.phone}</Text>}
            {invoice.customer.address && <Text style={styles.infoText}>{invoice.customer.address}</Text>}
          </View>
          
          <View style={{ width: '50%', alignItems: 'flex-end' }}>
            {invoice.order && (
              <>
                <Text style={[styles.infoText, styles.bold, { color: '#666' }]}>ORDER REFERENCE:</Text>
                <Text style={[styles.infoText, { marginTop: 4 }]}>{invoice.order.orderNumber}</Text>
                <Text style={styles.infoText}>{invoice.order.projectName}</Text>
              </>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          
          {invoice.items.map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.descContainer}>
                {/* Note: React PDF images might require absolute URLs or specific CORS headers if external. 
                    If it fails to render, we might need to handle it or just rely on description */}
                {item.productImage && <PdfImage src={item.productImage} style={styles.productImage} />}
                <Text style={{ flex: 1 }}>{item.description}</Text>
              </View>
              <Text style={styles.colQty}>{item.qty}</Text>
              <Text style={styles.colPrice}>Rp {Number(item.price).toLocaleString('id-ID')}</Text>
              <Text style={styles.colTotal}>Rp {Number(item.total).toLocaleString('id-ID')}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryBlock}>
          <View style={styles.summaryRow}>
            <Text>Subtotal:</Text>
            <Text>Rp {Number(invoice.subtotal).toLocaleString('id-ID')}</Text>
          </View>
          
          {Number(invoice.discount) > 0 && (
            <View style={styles.summaryRow}>
              <Text>Discount:</Text>
              <Text>- Rp {Number(invoice.discount).toLocaleString('id-ID')}</Text>
            </View>
          )}
          
          {Number(invoice.tax) > 0 && (
            <View style={styles.summaryRow}>
              <Text>Tax:</Text>
              <Text>Rp {Number(invoice.tax).toLocaleString('id-ID')}</Text>
            </View>
          )}
          
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalText}>Total:</Text>
            <Text style={styles.summaryTotalText}>Rp {Number(invoice.total).toLocaleString('id-ID')}</Text>
          </View>
          
          {Number(invoice.dp) > 0 && (
            <View style={styles.summaryRow}>
              <Text>Down Payment:</Text>
              <Text>- Rp {Number(invoice.dp).toLocaleString('id-ID')}</Text>
            </View>
          )}
          
          <View style={[styles.summaryTotalRow, { borderTopWidth: 0, marginTop: 0 }]}>
            <Text style={[styles.summaryTotalText, { color: '#889063' }]}>Remaining Balance:</Text>
            <Text style={[styles.summaryTotalText, { color: '#889063' }]}>Rp {Number(invoice.remainingBalance).toLocaleString('id-ID')}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={[styles.bold, { marginBottom: 4 }]}>Notes & Terms:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
        
        {settings?.bankAccount && (
          <View style={[styles.notes, { marginTop: 20 }]}>
            <Text style={[styles.bold, { marginBottom: 4 }]}>Payment Info:</Text>
            <Text>{settings.bankAccount}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
