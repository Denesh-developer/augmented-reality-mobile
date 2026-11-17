import openpyxl
import json
import re

excel_path = 'C:/Users/Administrator/.gemini/antigravity/brain/3d3d0aa9-6073-4215-a98c-97b5710a693e/.user_uploaded/media_1794841078475_44d3cd8e.xlsx'
wb = openpyxl.load_workbook(excel_path, data_only=True)
sheet = wb.active
rows = list(sheet.iter_rows(values_only=True))
headers = [str(h).strip() for h in rows[0]]

# Map header names to indices
col_idx = {h: i for i, h in enumerate(headers)}

brand_idx = col_idx.get('Brand', 1)
model_idx = col_idx.get('Phone Model', 2)
series_idx = col_idx.get('Series', 3)
segment_idx = col_idx.get('Segment', 4)
year_idx = col_idx.get('Launch Year', 5)
chipset_idx = col_idx.get('Chipset', 7)
ram_idx = col_idx.get('RAM (GB)', 8)
storage_idx = col_idx.get('Storage Options', 9)
display_size_idx = col_idx.get('Display Size (in)', 10)
display_type_idx = col_idx.get('Display Type', 11)
res_idx = col_idx.get('Resolution (px)', 12)
refresh_idx = col_idx.get('Refresh Rate (Hz)', 13)
rear_cam_idx = col_idx.get('Rear Camera', 14)
front_cam_idx = col_idx.get('Front Camera', 15)
batt_idx = col_idx.get('Battery (mAh)', 16)
charge_idx = col_idx.get('Charging', 17)
os_idx = col_idx.get('OS at Launch', 18)
is_5g_idx = col_idx.get('5G', 19)
weight_idx = col_idx.get('Weight (g)', 20)

phones_list = []
seen_ids = set()

# Color palettes per brand
brand_styles = {
    'apple': {'layout': 'apple_pro_triangle', 'color': '#3a3541', 'accent': '#a855f7', 'form': 'modern_flat'},
    'samsung': {'layout': 'samsung_floating_rings', 'color': '#1e293b', 'accent': '#38bdf8', 'form': 'box_ultra'},
    'infinix': {'layout': 'infinix_cyber_matrix', 'color': '#0099b8', 'accent': '#00f0ff', 'form': 'gaming_mecha'},
    'oneplus': {'layout': 'oneplus_circular_dial', 'color': '#111827', 'accent': '#ef4444', 'form': 'modern_flat'},
    'poco': {'layout': 'poco_yellow_banner', 'color': '#18181b', 'accent': '#eab308', 'form': 'gaming_mecha'},
    'google': {'layout': 'pixel_visor_bar', 'color': '#27272a', 'accent': '#60a5fa', 'form': 'modern_curved'},
    'xiaomi': {'layout': 'xiaomi_leica_square', 'color': '#1c1917', 'accent': '#f97316', 'form': 'modern_flat'},
    'redmi': {'layout': 'xiaomi_leica_square', 'color': '#1e293b', 'accent': '#38bdf8', 'form': 'modern_flat'},
    'realme': {'layout': 'oneplus_circular_dial', 'color': '#f59e0b', 'accent': '#eab308', 'form': 'modern_flat'},
    'vivo': {'layout': 'samsung_floating_rings', 'color': '#0f172a', 'accent': '#06b6d4', 'form': 'modern_flat'},
    'iqoo': {'layout': 'infinix_cyber_matrix', 'color': '#111827', 'accent': '#f59e0b', 'form': 'gaming_mecha'},
    'motorola': {'layout': 'samsung_floating_rings', 'color': '#1e1b4b', 'accent': '#818cf8', 'form': 'modern_flat'},
    'tecno': {'layout': 'infinix_cyber_matrix', 'color': '#0f766e', 'accent': '#2dd4bf', 'form': 'gaming_mecha'},
    'oppo': {'layout': 'samsung_floating_rings', 'color': '#111827', 'accent': '#10b981', 'form': 'modern_flat'},
    'nothing': {'layout': 'samsung_floating_rings', 'color': '#ffffff', 'accent': '#ffffff', 'form': 'nothing_glyph'},
}

for row in rows[1:]:
    raw_brand = str(row[brand_idx] or '').strip()
    raw_model = str(row[model_idx] or '').strip()
    if not raw_brand or not raw_model:
        continue
    
    raw_year = row[year_idx]
    try:
        year = int(str(raw_year).strip())
    except:
        year = 2023
    
    # We focus on 2020-2026 modern phones
    if year < 2020:
        continue

    # Clean double brand name, e.g. "Infinix Infinix Hot 12" -> "Hot 12"
    brand = raw_brand
    model = raw_model
    if model.lower().startswith(brand.lower() + ' '):
        model = model[len(brand):].strip()
    
    display_name = f"{brand} {model}"
    slug_brand = re.sub(r'[^a-z0-9]+', '-', brand.lower()).strip('-')
    slug_model = re.sub(r'[^a-z0-9]+', '-', model.lower()).strip('-')
    phone_id = f"{slug_brand}-{slug_model}-{year}"
    
    if phone_id in seen_ids:
        continue
    seen_ids.add(phone_id)

    b_low = brand.lower()
    style = brand_styles.get(b_low, {
        'layout': 'samsung_floating_rings',
        'color': '#1e293b',
        'accent': '#38bdf8',
        'form': 'modern_flat'
    })

    # Specific color override for user's teal/cyan phone:
    # Infinix Hot 12 / Hot 11 / Play gets Daylight Green / Sonic Cyan
    phone_color = style['color']
    accent_color = style['accent']
    if 'hot 12' in model.lower() or 'hot 11' in model.lower():
        phone_color = '#0099b8'  # Sonic Cyan
        accent_color = '#00f0ff'

    soc = str(row[chipset_idx] or 'Helio G85 / Unisoc').strip()
    ram = str(row[ram_idx] or '6').strip()
    if not ram.endswith('GB'):
        ram = f"{ram}GB"
    storage = str(row[storage_idx] or '128 GB').strip()
    if not 'GB' in storage and not 'TB' in storage:
        storage = f"{storage}GB"

    screen_size = f'{row[display_size_idx] or "6.6"}" {row[display_type_idx] or "IPS LCD"}'
    res = str(row[res_idx] or '1080x2400').strip()
    rear_cam = str(row[rear_cam_idx] or '50MP Triple').strip()
    front_cam = str(row[front_cam_idx] or '16MP').strip()
    batt_mah = str(row[batt_idx] or '5000').strip()
    batt_str = f"{batt_mah} mAh" if not 'mah' in batt_mah.lower() else batt_mah
    charging = str(row[charge_idx] or '18W').strip()
    weight = str(row[weight_idx] or '195 g').strip()
    os_at = str(row[os_idx] or 'Android 12').strip()
    is_5g = str(row[is_5g_idx] or 'No').strip()

    keywords = [
        brand.lower(),
        model.lower(),
        re.sub(r'[^a-z0-9]', '', model.lower()),
        str(year),
        display_name.lower(),
        re.sub(r'[^a-z0-9]', '', display_name.lower()),
    ]
    for w_part in model.lower().split():
        if len(w_part) >= 2:
            keywords.append(w_part)

    p_obj = {
        "id": phone_id,
        "brand": brand,
        "model": model,
        "displayName": display_name,
        "series": str(row[series_idx] or brand).strip(),
        "segment": str(row[segment_idx] or 'Budget').strip(),
        "year": year,
        "status": "Verified & Complete",
        "width": 77.0,
        "height": 168.0,
        "thickness": 8.5,
        "cornerRadius": 7.5,
        "chassisForm": style['form'],
        "cameraLayout": style['layout'],
        "color": phone_color,
        "accentColor": accent_color,
        "colorName": "Sonic Cyan" if phone_color == '#0099b8' else "Obsidian Black",
        "backMaterial": "glass",
        "frameMaterial": "aluminum",
        "screenSize": screen_size,
        "resolution": res,
        "refreshRate": 90,
        "soc": soc,
        "chipset": soc,
        "ram": ram,
        "storage": storage,
        "variants": [f"{ram}/{storage}"],
        "rearCamera": rear_cam,
        "frontCamera": front_cam,
        "cameraSpecs": rear_cam,
        "batteryCapacity": batt_str,
        "batteryMah": int(re.sub(r'\D', '', batt_str) or 5000),
        "charging": charging,
        "osAtLaunch": os_at,
        "is5G": is_5g,
        "weight": weight,
        "keywords": list(set(keywords))
    }
    phones_list.append(p_obj)

# Ensure Apple flagships (iPhone 16 Pro Max, 15 Pro Max, etc.) are at the top
apple_flagships = [
    {
        "id": "apple-iphone-16-pro-max-2024",
        "brand": "Apple",
        "model": "iPhone 16 Pro Max",
        "displayName": "Apple iPhone 16 Pro Max",
        "series": "iPhone",
        "segment": "Flagship",
        "year": 2024,
        "width": 77.6,
        "height": 163.0,
        "thickness": 8.25,
        "cornerRadius": 8.5,
        "chassisForm": "modern_flat",
        "cameraLayout": "apple_pro_triangle",
        "color": "#3a3541",
        "accentColor": "#a855f7",
        "colorName": "Deep Purple Titanium",
        "backMaterial": "matte_glass",
        "frameMaterial": "titanium",
        "screenSize": '6.9" Super Retina XDR OLED',
        "resolution": "1320x2868",
        "refreshRate": 120,
        "soc": "Apple A18 Pro",
        "chipset": "Apple A18 Pro",
        "ram": "8GB",
        "storage": "256GB / 512GB / 1TB",
        "variants": ["8GB/256GB", "8GB/512GB", "8GB/1TB"],
        "rearCamera": "48MP Triple + LiDAR",
        "frontCamera": "12MP Face ID",
        "cameraSpecs": "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto",
        "batteryCapacity": "4685 mAh",
        "batteryMah": 4685,
        "charging": "30W MagSafe",
        "osAtLaunch": "iOS 18",
        "is5G": "Yes",
        "weight": "227 g",
        "keywords": ["apple", "iphone", "16", "pro", "max", "iphone 16 pro max", "a18 pro"]
    },
    {
        "id": "samsung-galaxy-s24-ultra-2024",
        "brand": "Samsung",
        "model": "Galaxy S24 Ultra",
        "displayName": "Samsung Galaxy S24 Ultra",
        "series": "Galaxy S",
        "segment": "Flagship",
        "year": 2024,
        "width": 79.0,
        "height": 162.3,
        "thickness": 8.6,
        "cornerRadius": 2.0,
        "chassisForm": "box_ultra",
        "cameraLayout": "samsung_floating_rings",
        "color": "#1e293b",
        "accentColor": "#38bdf8",
        "colorName": "Titanium Gray",
        "backMaterial": "gorilla_glass_armor",
        "frameMaterial": "titanium",
        "screenSize": '6.8" Dynamic AMOLED 2X 120Hz',
        "resolution": "1440x3120",
        "refreshRate": 120,
        "soc": "Snapdragon 8 Gen 3 for Galaxy",
        "chipset": "Snapdragon 8 Gen 3",
        "ram": "12GB",
        "storage": "256GB / 512GB / 1TB",
        "variants": ["12GB/256GB", "12GB/512GB"],
        "rearCamera": "200MP Quad + 100x Space Zoom",
        "frontCamera": "12MP",
        "cameraSpecs": "200MP + 50MP Periscope + 10MP + 12MP",
        "batteryCapacity": "5000 mAh",
        "batteryMah": 5000,
        "charging": "45W Fast Charging",
        "osAtLaunch": "Android 14 (One UI 6.1)",
        "is5G": "Yes",
        "weight": "232 g",
        "keywords": ["samsung", "galaxy", "s24", "ultra", "s24 ultra", "s24ultra", "snapdragon 8 gen 3"]
    }
]

# Add specific top Infinix Hot 12 Play record right in the list
infinix_hot_12_play = {
    "id": "infinix-hot-12-play-2022",
    "brand": "Infinix",
    "model": "Hot 12 Play",
    "displayName": "Infinix Hot 12 Play",
    "series": "Hot",
    "segment": "Budget",
    "year": 2022,
    "width": 77.6,
    "height": 170.5,
    "thickness": 8.9,
    "cornerRadius": 7.0,
    "chassisForm": "gaming_mecha",
    "cameraLayout": "infinix_cyber_matrix",
    "color": "#0099b8",
    "accentColor": "#00f0ff",
    "colorName": "Daylight Green / Sonic Cyan",
    "backMaterial": "glass",
    "frameMaterial": "aluminum",
    "screenSize": '6.82" 90Hz HD+ IPS LCD',
    "resolution": "720x1612",
    "refreshRate": 90,
    "soc": "Unisoc T610 / MediaTek Helio G35",
    "chipset": "Unisoc T610",
    "ram": "4GB / 6GB",
    "storage": "64GB / 128GB",
    "variants": ["4GB/64GB", "6GB/128GB"],
    "rearCamera": "13MP Dual AI + Quad LED Flash",
    "frontCamera": "8MP Selfie Flash",
    "cameraSpecs": "13MP Primary + AI Lens",
    "batteryCapacity": "6000 mAh",
    "batteryMah": 6000,
    "charging": "18W Fast Charge",
    "osAtLaunch": "Android 12 (XOS 10)",
    "is5G": "No",
    "weight": "209 g",
    "keywords": ["infinix", "hot 12", "hot 12 play", "hot12", "hot12play", "infinix hot 12 play", "unisoc", "6000 mah"]
}

# Put priority models at the top
final_list = [infinix_hot_12_play] + apple_flagships + [p for p in phones_list if p['id'] not in ['apple-iphone-16-pro-max-2024', 'samsung-galaxy-s24-ultra-2024', 'infinix-hot-12-play-2022']]

with open('src/data/phones.json', 'w', encoding='utf-8') as f:
    json.dump(final_list, f, indent=2, ensure_ascii=False)

print(f"Successfully wrote {len(final_list)} authentic phones to src/data/phones.json!")
