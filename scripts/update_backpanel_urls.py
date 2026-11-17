import openpyxl
import json
import os
import sys

def sync_excel_to_json(excel_file=None):
    if not excel_file:
        # Default to the latest uploaded excel in user_uploaded folder or scripts
        default_path = r'C:\Users\Administrator\.gemini\antigravity\brain\3d3d0aa9-6073-4215-a98c-97b5710a693e\.user_uploaded\media_1794890221598_3d8c010d.xlsx'
        if os.path.exists(default_path):
            excel_file = default_path
        else:
            excel_file = r'scripts\phones.xlsx'

    if not os.path.exists(excel_file):
        print(f"Error: Excel file not found at {excel_file}")
        return

    print(f"Reading Excel file: {excel_file}")
    wb = openpyxl.load_workbook(excel_file)
    ws = wb['Phones'] if 'Phones' in wb.sheetnames else wb.active

    json_path = r'src\data\phones.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        phones = json.load(f)

    # Index by brand + model
    phones_map = {}
    for p in phones:
        key = f"{p['brand'].strip().lower()}:{p['model'].strip().lower()}"
        phones_map[key] = p

    updated_urls = 0
    for r in range(2, ws.max_row + 1):
        brand = str(ws.cell(row=r, column=2).value or '').strip()
        model = str(ws.cell(row=r, column=3).value or '').strip()
        url = str(ws.cell(row=r, column=11).value or '').strip()
        
        if not brand or not model:
            continue

        key = f"{brand.lower()}:{model.lower()}"
        if key in phones_map:
            if url and url != 'None' and url.startswith('http'):
                phones_map[key]['backPanelImageUrl'] = url
                updated_urls += 1

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(phones, f, indent=2)

    print(f"Successfully synced! Updated {updated_urls} custom back panel image URLs in {json_path}.")

if __name__ == '__main__':
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    sync_excel_to_json(arg)
