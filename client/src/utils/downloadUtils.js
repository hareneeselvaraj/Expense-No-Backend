import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ── Number to Words (Indian system) ──
const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
];
const tensWords = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function belowThousand(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tensWords[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + belowThousand(n % 100) : '');
}

function numberToWords(amount) {
    const n = Math.floor(amount);
    if (n === 0) return 'Zero Only';
    let result = '';
    if (n >= 10000000) result += belowThousand(Math.floor(n / 10000000)) + ' Crore ';
    if (n % 10000000 >= 100000) result += belowThousand(Math.floor((n % 10000000) / 100000)) + ' Lakh ';
    if (n % 100000 >= 1000) result += belowThousand(Math.floor((n % 100000) / 1000)) + ' Thousand ';
    if (n % 1000 > 0) result += belowThousand(n % 1000);
    return result.trim() + ' Only';
}

/**
 * Generate a professional bank-statement-style PDF from transactions
 */
export function downloadPDF(transactions, { title = 'Transaction Report', dateRange = '' } = {}) {
    // Use landscape A4 to accommodate the extra "Amount in Words" column
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header ──
    doc.setFillColor(20, 24, 33);
    doc.rect(0, 0, pageW, 36, 'F');
    doc.setTextColor(232, 234, 240);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Tracker', 16, 16);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 165, 190);
    doc.text(title, 16, 23);
    if (dateRange) doc.text(dateRange, 16, 29);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageW - 16, 16, { align: 'right' });

    // ── Summary ──
    const income = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const investment = transactions.filter(t => t.type === 'Investment').reduce((s, t) => s + (t.amount || 0), 0);
    const balance = income - expense - investment;
    // jsPDF's built-in Helvetica font doesn't support the Rs. glyph; use "Rs." instead
    const fmt = (v) => `Rs.${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const summaryY = 44;
    doc.setFillColor(245, 246, 250);
    doc.roundedRect(14, summaryY, pageW - 28, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    const colW = (pageW - 28) / 4;
    const labels = ['Total Income', 'Total Expense', 'Investments', 'Net Balance'];
    const values = [fmt(income), fmt(expense), fmt(investment), fmt(balance)];
    const colors = [[16, 185, 129], [239, 68, 68], [245, 158, 11], [99, 102, 241]];
    labels.forEach((label, i) => {
        const x = 14 + colW * i + colW / 2;
        doc.setFontSize(8);
        doc.setTextColor(100, 105, 130);
        doc.text(label, x, summaryY + 8, { align: 'center' });
        doc.setTextColor(...colors[i]);
        doc.setFontSize(10);
        doc.text(values[i], x, summaryY + 16, { align: 'center' });
    });

    // ── Table ──
    const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        (t.description || '—').substring(0, 35),
        t.categoryName || '—',
        t.onlineOffline + (t.bankMode ? ` · ${t.bankMode}` : ''),
        fmt(t.amount || 0),
        numberToWords(t.amount || 0),
        t.type,
    ]);

    autoTable(doc, {
        startY: summaryY + 28,
        head: [['Date', 'Description', 'Category', 'Payment Mode', 'Amount', 'Amount in Words', 'Type']],
        body: rows,
        styles: {
            font: 'helvetica',
            fontSize: 7.5,
            cellPadding: 3,
            lineColor: [230, 232, 240],
            lineWidth: 0.2,
            textColor: [60, 65, 85],
        },
        headStyles: {
            fillColor: [32, 38, 56],
            textColor: [200, 205, 220],
            fontStyle: 'bold',
            fontSize: 7.5,
            halign: 'left',
        },
        alternateRowStyles: { fillColor: [248, 249, 252] },
        columnStyles: {
            0: { cellWidth: 24 },                                              // Date
            1: { cellWidth: 50 },                                              // Description
            2: { cellWidth: 28 },                                              // Category
            3: { cellWidth: 32 },                                              // Payment Mode
            4: { halign: 'right', fontStyle: 'bold', cellWidth: 28 },         // Amount
            5: { cellWidth: 'auto', fontSize: 7, textColor: [80, 85, 110] },  // Amount in Words
            6: { cellWidth: 24 },                                              // Type
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 6) {
                const val = data.cell.raw;
                if (val === 'Income') data.cell.styles.textColor = [16, 185, 129];
                else if (val === 'Expense') data.cell.styles.textColor = [220, 80, 80];
                else if (val === 'Investment') data.cell.styles.textColor = [210, 150, 50];
            }
        },
    });

    // ── Footer ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160, 165, 190);
        doc.text(`Page ${i} of ${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    }

    doc.save(`transactions_${Date.now()}.pdf`);
}

/**
 * Generate an Excel workbook from transactions
 */
export function downloadExcel(transactions, { title = 'Transaction Report' } = {}) {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const income = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + (t.amount || 0), 0);
    const expense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + (t.amount || 0), 0);
    const investment = transactions.filter(t => t.type === 'Investment').reduce((s, t) => s + (t.amount || 0), 0);

    const summaryData = [
        [title],
        [],
        ['Total Income', income],
        ['Total Expense', expense],
        ['Investments', investment],
        ['Net Balance', income - expense - investment],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 20 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

    // Transactions sheet
    const rows = transactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString('en-IN'),
        Description: t.description || '—',
        Category: t.categoryName || '—',
        Account: t.accountName || '—',
        'Payment Mode': t.onlineOffline + (t.bankMode ? ` · ${t.bankMode}` : ''),
        Amount: t.amount || 0,
        'Amount in Words': numberToWords(t.amount || 0),
        Type: t.type,
        Tag: t.tagName || '—',
    }));
    const ws2 = XLSX.utils.json_to_sheet(rows);
    ws2['!cols'] = [
        { wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 16 },
        { wch: 18 }, { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Transactions');

    XLSX.writeFile(wb, `transactions_${Date.now()}.xlsx`);
}

/**
 * Filter transactions by various criteria
 */
export function filterTransactions(transactions, { month, year, tagId, categoryId, paymentMode } = {}) {
    let filtered = [...transactions];

    if (year) {
        filtered = filtered.filter(t => new Date(t.date).getFullYear() === parseInt(year));
    }
    if (month) {
        filtered = filtered.filter(t => new Date(t.date).getMonth() + 1 === parseInt(month));
    }
    if (tagId) {
        filtered = filtered.filter(t => t.tagId === tagId);
    }
    if (categoryId) {
        filtered = filtered.filter(t => t.categoryId === categoryId);
    }
    if (paymentMode && paymentMode !== 'All') {
        if (paymentMode === 'Offline') {
            filtered = filtered.filter(t => t.onlineOffline === 'Offline');
        } else if (paymentMode === 'Credit') {
            filtered = filtered.filter(t => t.bankMode === 'Credit');
        } else if (paymentMode === 'Debit') {
            filtered = filtered.filter(t => t.bankMode === 'Debit');
        } else if (paymentMode === 'NetBanking') {
            filtered = filtered.filter(t => t.bankMode === 'NetBanking' || t.bankMode === 'GPay');
        }
    }

    return filtered;
}
