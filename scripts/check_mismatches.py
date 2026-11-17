import json

with open('src/data/phones.json', 'r', encoding='utf-8') as f:
    phones = json.load(f)

sample_models = [
    'iPhone 4',
    'BlackBerry Bold 9780',
    'Motorola Backflip',
    'LG Optimus GT540',
    'Galaxy S (i9000)',
    'Nokia N8',
    'Galaxy S III',
    'Nokia 808 PureView',
    'Nokia Lumia 1020',
    'HTC One (M7)',
    'Galaxy S5',
    'OnePlus One',
    'Infinix Hot',
    'Asus ROG Phone',
    'Galaxy S24 Ultra',
    'Nothing Phone (1)',
    'Lava Agni 3'
]

for target in sample_models:
    match = next((p for p in phones if p['model'].lower() == target.lower() or target.lower() in p['model'].lower()), None)
    if match:
        print(f"=== {match['brand']} {match['model']} ({match['year']}) ===")
        print(f"  Segment: {match['segment']} | Form: {match['chassisForm']} | CamLayout: {match['cameraLayout']}")
        print(f"  SoC: {match['soc']} | RAM: {match['ram']} | Screen: {match['screenSize']} ({match['resolution']}, {match['refreshRate']}Hz)")
        print(f"  RearCam: {match['cameraSpecs']} | FrontCam: {match['frontCamera']}")
        print(f"  Battery: {match['batteryCapacity']} | Charging: {match['charging']}")
        print(f"  HomeBtn: {match.get('hasHomeButton')} | QWERTY: {match.get('hasQwerty')}")
        print()
