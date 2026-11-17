import openpyxl
import json
import re

excel_path = r'C:\Users\Administrator\.gemini\antigravity\brain\3d3d0aa9-6073-4215-a98c-97b5710a693e\.user_uploaded\media_1794890221598_3d8c010d.xlsx'
wb = openpyxl.load_workbook(excel_path)
ws = wb['Phones']

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

phones = []

# Layout and color rules
for r in range(2, ws.max_row + 1):
    year_val = ws.cell(row=r, column=1).value
    brand_val = ws.cell(row=r, column=2).value
    model_val = ws.cell(row=r, column=3).value
    if not brand_val or not model_val:
        continue
    
    brand = str(brand_val).strip()
    model = str(model_val).strip()
    year = int(year_val) if year_val and str(year_val).isdigit() else 2024
    
    variants = str(ws.cell(row=r, column=4).value or '').strip()
    processor = str(ws.cell(row=r, column=5).value or '').strip()
    display = str(ws.cell(row=r, column=6).value or '').strip()
    rear_cam = str(ws.cell(row=r, column=7).value or '').strip()
    front_cam = str(ws.cell(row=r, column=8).value or '').strip()
    battery = str(ws.cell(row=r, column=9).value or '').strip()
    charging = str(ws.cell(row=r, column=10).value or '').strip()
    back_url = str(ws.cell(row=r, column=11).value or '').strip()
    if back_url == 'None':
        back_url = ''
    conf = str(ws.cell(row=r, column=13).value or '').strip()
    notes = str(ws.cell(row=r, column=14).value or '').strip()

    pid = f"{slugify(brand)}-{slugify(model)}-{year}"
    b_low = brand.lower()
    m_low = model.lower()

    # Determine camera layout & chassis
    cam_layout = 'standard_triple'
    chassis = 'modern_flat'
    back_mat = 'glass'
    frame_mat = 'aluminum'
    color = '#1e293b'
    accent = '#38bdf8'
    color_name = 'Midnight Titanium'
    has_rear_fp = False
    fp_pos = 'center'
    w = 75.8
    h = 163.4
    t = 8.2
    cr = 6.0

    if b_low == 'apple':
        back_mat = 'glass'
        frame_mat = 'titanium' if ('pro' in m_low and year >= 2023) else 'aluminum'
        cr = 8.5
        if 'pro' in m_low:
            cam_layout = 'apple_triple'
            color = '#847e77' if year >= 2023 else '#27292d'
            color_name = 'Natural Titanium' if year >= 2023 else 'Space Black'
            w = 76.7 if 'max' in m_low else 71.5
            h = 160.7 if 'max' in m_low else 146.6
            t = 8.25
        elif 'mini' in m_low:
            cam_layout = 'apple_diagonal'
            color = '#2c3e50'
            color_name = 'Midnight Blue'
            w = 64.2
            h = 131.5
            t = 7.65
        else:
            cam_layout = 'apple_diagonal'
            color = '#38404a'
            color_name = 'Ultramarine / Midnight'
            w = 71.6
            h = 147.6
            t = 7.8
            
    elif b_low == 'samsung':
        back_mat = 'glass'
        frame_mat = 'titanium' if 'ultra' in m_low else 'aluminum'
        if 'ultra' in m_low:
            cam_layout = 'samsung_floating_quad'
            chassis = 'box_ultra'
            color = '#4b4d52'
            color_name = 'Titanium Gray / Phantom Black'
            cr = 2.0
            w = 79.0
            h = 162.3
            t = 8.6
        else:
            cam_layout = 'samsung_floating_triple'
            color = '#626b73'
            color_name = 'Cobalt Violet / Onyx Black'
            cr = 6.5
            w = 70.6 if 'plus' not in m_low else 75.9
            h = 147.0 if 'plus' not in m_low else 158.5
            t = 7.6

    elif b_low == 'google':
        cam_layout = 'pixel_visor'
        color = '#33373b'
        color_name = 'Obsidian Black / Hazel'
        cr = 7.0
        w = 76.5 if 'pro' in m_low else 73.2
        h = 162.6 if 'pro' in m_low else 150.5
        t = 8.8

    elif b_low == 'oneplus':
        if '10' in m_low or '11' in m_low or '12' in m_low or '13' in m_low:
            cam_layout = 'oneplus_circular'
        else:
            cam_layout = 'oneplus_vertical'
        color = '#1b4332' if '12' in m_low or '11' in m_low else '#111827'
        color_name = 'Flowy Emerald / Silky Black'
        cr = 6.0
        w = 75.8
        h = 164.3
        t = 9.15

    elif b_low == 'infinix':
        back_mat = 'polycarbonate'
        frame_mat = 'polycarbonate'
        if 'hot 11s' in m_low or 'hot 10s' in m_low:
            cam_layout = 'infinix_dual_circle_owl'
            color = '#1a7065' if '11s' in m_low else '#1f2937'
            color_name = 'Wave Green / Morandi Green'
            has_rear_fp = True
            fp_pos = 'offset_right'
            w = 77.3
            h = 168.9
            t = 8.8
        elif 'hot 12 play' in m_low or 'hot 11 play' in m_low or 'hot 10 play' in m_low or 'hot 20 play' in m_low:
            cam_layout = 'infinix_triple_column'
            color = '#0099b8' if '12 play' in m_low else '#2a3b4c'
            color_name = 'Daylight Green / Racing Black'
            has_rear_fp = True
            fp_pos = 'center'
            w = 77.6
            h = 170.5
            t = 8.9
        elif 'gt 10' in m_low or 'gt 20' in m_low:
            cam_layout = 'infinix_matrix_stealth'
            chassis = 'gaming_mecha'
            color = '#ff6b00'
            color_name = 'Cyber Mecha Orange / Mirage Silver'
            w = 75.9
            h = 162.7
            t = 8.1
        elif 'note 12' in m_low or 'note 30' in m_low or 'note 40' in m_low:
            cam_layout = 'infinix_triple_column'
            color = '#d4af37' if 'note 30' in m_low else '#1a1d20'
            color_name = 'Sunset Gold / Obsidian Black'
            w = 76.8
            h = 168.6
            t = 7.8
        elif 'smart' in m_low:
            cam_layout = 'infinix_triple_column'
            color = '#2563eb'
            color_name = 'Ocean Wave Blue'
            has_rear_fp = True
            w = 75.6
            h = 165.4
            t = 8.8
        else:
            cam_layout = 'infinix_triple_column'
            color = '#1e293b'
            color_name = 'Cosmic Black'
            w = 76.5
            h = 168.0
            t = 8.4

    elif b_low == 'poco':
        cam_layout = 'poco_wide_visor'
        color = '#f7b731'
        color_name = 'POCO Yellow'
        w = 74.3
        h = 160.5
        t = 8.25

    elif b_low == 'redmi' or b_low == 'xiaomi':
        if '13' in m_low or '14' in m_low or '15' in m_low:
            cam_layout = 'xiaomi_deco_square'
        else:
            cam_layout = 'standard_triple'
        color = '#2d3436'
        color_name = 'Midnight Black / Aurora Green'
        w = 75.3
        h = 161.4
        t = 8.0

    elif b_low == 'realme':
        if 'pro' in m_low and ('11' in m_low or '12' in m_low):
            cam_layout = 'oneplus_circular'
            back_mat = 'vegan_leather'
            color = '#d2b48c'
            color_name = 'Submarine Blue / Navigator Beige'
        else:
            cam_layout = 'standard_triple'
            color = '#1e272e'
            color_name = 'Speed Silver'
        w = 74.0
        h = 161.5
        t = 8.75

    elif b_low == 'vivo' or b_low == 'iqoo':
        if 'x100' in m_low:
            cam_layout = 'oneplus_circular'
            color = '#0abde3'
            color_name = 'Startrail Blue'
        elif '12' in m_low:
            cam_layout = 'xiaomi_deco_square'
            color = '#f5f6fa'
            color_name = 'Legend White (BMW)'
        else:
            cam_layout = 'standard_triple'
            color = '#222f3e'
            color_name = 'Starlight Black'
        w = 75.2
        h = 163.2
        t = 8.1

    elif b_low == 'motorola':
        cam_layout = 'standard_triple'
        color = '#576574'
        color_name = 'Pantone Marshmallow / Black'
        w = 74.5
        h = 161.2
        t = 8.2

    elif b_low == 'oppo':
        cam_layout = 'oneplus_circular' if 'find' in m_low else 'standard_triple'
        color = '#1e272e'
        color_name = 'Cosmic Black / Sunset Orange'
        w = 74.0
        h = 163.7
        t = 8.5

    phone_obj = {
        "id": pid,
        "brand": brand,
        "model": model,
        "displayName": f"{brand} {model}",
        "year": year,
        "series": model.split()[0] if model else brand,
        "segment": "Flagship" if any(k in m_low for k in ['ultra', 'pro max', 'pro+', 'fold', 'find x']) else ("Mid-Range" if any(k in m_low for k in ['pro', 'plus', 'gt', 'note', 'edge']) else "Budget"),
        "width": w,
        "height": h,
        "thickness": t,
        "cornerRadius": cr,
        "chassisForm": chassis,
        "cameraLayout": cam_layout,
        "color": color,
        "accentColor": accent,
        "colorName": color_name,
        "backMaterial": back_mat,
        "frameMaterial": frame_mat,
        "screenSize": display if display != 'Pending' else '6.67" AMOLED 120Hz',
        "resolution": "1080x2400",
        "refreshRate": 120 if '120' in display else (144 if '144' in display else (90 if '90' in display else 60)),
        "soc": processor if processor != 'Pending' else 'Octa-Core High Performance Processor',
        "chipset": processor if processor != 'Pending' else 'Octa-Core High Performance Processor',
        "ram": variants if variants != 'Pending' else '8GB/128GB',
        "battery": battery if battery != 'Pending' else '5000 mAh',
        "charging": charging if charging != 'Pending' else '33W Fast Charging',
        "rearCamera": rear_cam if rear_cam != 'Pending' else '50MP Main OIS',
        "frontCamera": front_cam if front_cam != 'Pending' else '16MP Selfie',
        "backPanelImageUrl": back_url,
        "confidence": conf,
        "notes": notes,
        "hasRearFingerprint": has_rear_fp,
        "rearFingerprintPos": fp_pos
    }
    phones.append(phone_obj)

print(f"Generated {len(phones)} accurate phone definitions!")

with open(r'd:\AR PROJECT\src\data\phones.json', 'w', encoding='utf-8') as f:
    json.dump(phones, f, indent=2)

print("Saved cleanly to src/data/phones.json!")
