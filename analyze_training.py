import xlrd

wb = xlrd.open_workbook('new_file.xls')
ws = wb.sheet_by_index(0)

upi_merchants = {}
neft_items = []
other_items = []

for i in range(13, ws.nrows):
    r = str(ws.cell_value(i, 5)).strip()
    wd = str(ws.cell_value(i, 6)).strip()
    dep = str(ws.cell_value(i, 7)).strip()
    if not r or len(r) < 3:
        continue
    is_dep = dep and dep not in ('0.0', '0', '')
    
    if r.upper().startswith('UPI/'):
        parts = r.split('/')
        merchant = parts[1].strip() if len(parts) > 1 else '?'
        purpose = parts[3].strip()[:30] if len(parts) > 3 else ''
        key = merchant
        if key not in upi_merchants:
            upi_merchants[key] = {'count': 0, 'purposes': set(), 'dep': 0, 'wd': 0}
        upi_merchants[key]['count'] += 1
        upi_merchants[key]['purposes'].add(purpose)
        if is_dep:
            upi_merchants[key]['dep'] += 1
        else:
            upi_merchants[key]['wd'] += 1
    elif r.upper().startswith('NEFT') or r.upper().startswith('EBA'):
        t = 'DEP' if is_dep else 'WD'
        neft_items.append(t + ' | ' + r[:120])
    else:
        t = 'DEP' if is_dep else 'WD'
        other_items.append(t + ' | ' + r[:120])

lines = []
lines.append('=== TOP UPI MERCHANTS ===')
for name, info in sorted(upi_merchants.items(), key=lambda x: x[1]['count'], reverse=True)[:80]:
    purposes = ','.join(list(info['purposes'])[:5])
    t = 'DEP' if info['dep'] > info['wd'] else 'WD'
    lines.append('[' + t + '] x' + str(info['count']).rjust(3) + ': ' + name + ' -> ' + purposes)

lines.append('')
lines.append('=== NEFT/EBA ===')
for item in neft_items[:30]:
    lines.append(item)

lines.append('')
lines.append('=== OTHER ===')
for item in other_items[:30]:
    lines.append(item)

lines.append('')
lines.append('Total UPI merchants: ' + str(len(upi_merchants)))

with open('training_analysis.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Done! Written to training_analysis.txt')
