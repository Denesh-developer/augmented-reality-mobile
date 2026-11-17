import baseParts from './parts.json';

/**
 * Resolves 100% authentic, model-specific component names, technical specs,
 * failure points, and tools based on the selected phone's real hardware specifications.
 */
export function resolvePartForPhone(part, phone) {
  if (!phone || !part) return part;

  const brand = (phone.brand || '').toLowerCase();
  const model = (phone.model || '').toLowerCase();
  const screenStr = (phone.screenSize || '').toLowerCase();
  const chargingStr = (phone.charging || '').toLowerCase();
  const backMatStr = (phone.backMaterial || '').toLowerCase();
  const segment = phone.segment || '';
  const isApple = brand === 'apple';
  const isInfinix = brand.includes('infinix');

  const resolved = { ...part };

  // 1. SCREEN (IPS LCD vs AMOLED vs OLED)
  if (part.id === 'screen') {
    const isLCD = screenStr.includes('lcd') || screenStr.includes('ips') || screenStr.includes('tft') || screenStr.includes('pls') || isInfinix || (!screenStr.includes('oled') && !screenStr.includes('amoled') && !isApple);
    const isAMOLED = screenStr.includes('amoled');

    if (isLCD) {
      resolved.shortName = 'IPS LCD Display';
      resolved.shortName_ta = 'IPS LCD திரை';
      resolved.name = 'IPS LCD Multi-Touch Display Assembly & Digitizer';
      resolved.name_ta = 'IPS LCD தொடுதிரை பலகை';
      resolved.specs = `${phone.screenSize || '6.5" IPS LCD'} • ${phone.resolution || '1080x2400'} • ${phone.refreshRate || 90}Hz LCD Refresh • Capacitive In-Cell Digitizer`;
      resolved.specs_ta = `${phone.screenSize || '6.5" IPS LCD'} • ${phone.resolution || '1080x2400'} • ${phone.refreshRate || 90}Hz ரெப்ரெஷ் ரேட் • எல்இடி பின்னொளி`;
      resolved.function = `High-definition visual interface delivering ${phone.refreshRate || 90}Hz fluid refresh rate and responsive capacitive touch input with LED backlight array.`;
      resolved.function_ta = `காட்சிகளை 90Hz வேகத்தில் திரையிடுகிறது மற்றும் தொடு உணர்வுகளைப் பெறுகிறது.`;
      resolved.commonIssues = 'LED backlight failure, cracked digitizer glass, touch ghosting, display flex cable connector loosening.';
      resolved.commonIssues_ta = 'பின்னொளி கோளாறு, கண்ணாடி உடைதல், தொடுதல் வேலை செய்யாமல் போதல், டிஸ்ப்ளே கேபிள் லூசாதல்.';
      resolved.tools = 'Display heating mat (75°C), plastic pry picks, suction cup, precision tweezers, B-7000 frame adhesive';
    } else if (isAMOLED) {
      resolved.shortName = 'AMOLED Display';
      resolved.shortName_ta = 'AMOLED திரை';
      resolved.name = 'Super AMOLED Display Assembly & In-Cell Digitizer';
      resolved.name_ta = 'Super AMOLED தொடுதிரை பலகை';
      resolved.specs = `${phone.screenSize || '6.67" AMOLED'} • ${phone.resolution || '1080x2400'} • ${phone.refreshRate || 120}Hz Dynamic AMOLED • In-Display Fingerprint Optical Window`;
      resolved.specs_ta = `${phone.screenSize || '6.67" AMOLED'} • ${phone.resolution || '1080x2400'} • ${phone.refreshRate || 120}Hz டைனமிக் AMOLED திரை`;
      resolved.function = 'Self-illuminating organic LED display offering infinite contrast ratio, 120Hz refresh, and integrated optical fingerprint sensor.';
      resolved.function_ta = 'ஒளிரும் ஆர்கானிக் LED திரை, 120Hz வேகம் மற்றும் திரைக்கு அடியில் உள்ள கைரேகை சென்சார்.';
      resolved.commonIssues = 'AMOLED organic purple bleed, vertical green line flex defects, icon burn-in.';
      resolved.commonIssues_ta = 'ஊதா நிற புள்ளிகள், பச்சை நிற கோடுகள், ஸ்கிரீன் பர்ன்-இன் குறைபாடுகள்.';
    } else {
      resolved.shortName = 'OLED Display';
      resolved.shortName_ta = 'OLED திரை';
      resolved.name = 'Super Retina XDR OLED Display Assembly';
      resolved.name_ta = 'OLED தொடுதிரை பலகை';
      resolved.specs = `${phone.screenSize || '6.7" OLED'} • ${phone.resolution || '1179x2556'} • Ceramic Shield Glass • ProMotion Dynamic Refresh`;
      resolved.specs_ta = `${phone.screenSize || '6.7" OLED'} • ${phone.resolution || '1179x2556'} • செராமிக் ஷீல்டு கண்ணாடி`;
    }
  }

  // 2. FRONT SELFIE CAMERA (Punch-Hole vs 3D Face ID)
  else if (part.id === 'front_camera_module') {
    if (isApple) {
      resolved.shortName = 'Selfie & Face ID';
      resolved.shortName_ta = 'செல்ஃபி & Face ID';
      resolved.name = 'Front TrueDepth Camera & Face ID Sensor Array';
      resolved.name_ta = 'TrueDepth செல்ஃபி & Face ID சென்சார்';
      resolved.specs = `${phone.frontCamera || '12MP'} TrueDepth • 940nm VCSEL IR Dot Projector • Flood Illuminator`;
      resolved.function = 'Captures front selfies and projects 30,000 invisible infrared dots for biometric 3D facial authentication.';
    } else {
      resolved.shortName = 'Front Selfie Camera';
      resolved.shortName_ta = 'செல்ஃபி கேமரா';
      resolved.name = 'Front In-Display Selfie Camera Module';
      resolved.name_ta = 'முன்பக்க செல்ஃபி கேமரா தொகுதி';
      resolved.specs = `${phone.frontCamera || '16 MP'} HDR Punch-Hole Selfie Camera • f/2.0 Aperture • Fixed Focus`;
      resolved.specs_ta = `${phone.frontCamera || '16 MP'} பஞ்ச்-ஹோல் செல்ஃபி கேமரா • f/2.0 துளை`;
      resolved.function = 'High-resolution front optical sensor for portrait selfies, video conferencing, and 2D AI face unlock.';
      resolved.function_ta = 'செல்ஃபி புகைப்படங்கள், வீடியோ கால்கள் மற்றும் முக அங்கீகாரத்திற்கு பயன்படுகிறது.';
      resolved.commonIssues = 'Dust infiltration on internal front lens element, gold flex ribbon connector tear during motherboard removal.';
      resolved.commonIssues_ta = 'கேமரா லென்ஸில் தூசி படிதல், கேபிள் கிழிந்து போதல்.';
    }
  }

  // 3. THERMAL COOLING (Liquid Vapor Chamber vs Graphite Heat Sheet)
  else if (part.id === 'vapor_chamber') {
    const hasLiquidVC = !isApple && !isInfinix && (
      segment === 'Flagship' ||
      model.includes('ultra') ||
      model.includes('pro+') ||
      model.includes('gt') ||
      model.includes('rog') ||
      model.includes('gaming') ||
      model.includes('k70')
    );

    if (hasLiquidVC) {
      resolved.shortName = 'Vapor Chamber';
      resolved.shortName_ta = 'நீராவிக் கூலிங் தகடு';
      resolved.name = 'Liquid Vapor Chamber Cooling Plate';
      resolved.name_ta = 'திரவ நீராவிக் கூலிங் தகடு';
      resolved.specs = 'Ultra-thin sintered capillary copper vapor chamber with phase-change liquid cooling.';
      resolved.function = 'Dissipates extreme thermal loads from overclocked SoC and GPU via internal liquid evaporation and condensation.';
    } else if (isApple) {
      resolved.shortName = 'Thermal Shield';
      resolved.shortName_ta = 'கிராஃபைட் தகடு';
      resolved.name = 'Aerospace Multi-Layer Graphite Thermal Heat Shield';
      resolved.name_ta = 'ஏரோஸ்பேஸ் கிராஃபைட் வெப்பத் தகடு';
      resolved.specs = 'Multi-layer pyrolytic graphite sheets bonded to internal titanium chassis for passive heat dissipation.';
    } else {
      // Budget & Mid-Range (Infinix Hot 11S, Hot 12 Play, Redmi, Poco M, etc.)
      resolved.shortName = 'Graphite Thermal Sheet';
      resolved.shortName_ta = 'கிராஃபைட் வெப்பத் தகடு';
      resolved.name = 'Flexible Graphite Thermal Dissipation Sheet';
      resolved.name_ta = 'நெகிழ்வான கிராஃபைட் வெப்பத் தகடு';
      resolved.specs = 'Die-cut pyrolytic carbon graphite thermal sheet with copper grounding foil tabs (No Liquid Vapor Chamber).';
      resolved.specs_ta = 'கிராஃபைட் வெப்ப கடத்தும் தாள் மற்றும் காப்பர் தகடு (நீராவிக் கூலிங் இல்லை).';
      resolved.function = `Channels and spreads heat away from the ${phone.chipset || phone.soc || 'processor'} and fast-charging IC across the chassis surface.`;
      resolved.function_ta = 'பிராசஸர் மற்றும் பேட்டரியிலிருந்து உருவாகும் வெப்பத்தை சமமாக பரப்புகிறது.';
      resolved.commonIssues = 'Torn or creased graphite foil during battery replacement causing localized thermal throttling.';
      resolved.commonIssues_ta = 'பேட்டரி மாற்றும்போது கிராஃபைட் தாள் கிழிந்து போவதால் மொபைல் சூடாதல்.';
      resolved.tools = 'Plastic antistatic pry tool, thermal paste, isopropyl alcohol 99%';
    }
  }

  // 4. WIRELESS COIL VS INTERNAL MID-FRAME BRACKET
  else if (part.id === 'wireless_coil') {
    const hasWirelessCharging = chargingStr.includes('wireless') || chargingStr.includes('magsafe') || chargingStr.includes('qi') || isApple || (segment === 'Flagship' && brand === 'samsung');

    if (isApple) {
      resolved.shortName = 'MagSafe & Qi Coil';
      resolved.shortName_ta = 'MagSafe சுருள்';
      resolved.name = 'Apple MagSafe 18 Magnet Array & Wireless Induction Coil';
      resolved.name_ta = 'ஆப்பிள் மேக்சேஃப் மற்றும் வயர்லெஸ் சுருள்';
      resolved.specs = '18 N52 Neodymium positioning magnets, alignment magnet, planar copper Qi wireless induction coil.';
    } else if (hasWirelessCharging) {
      resolved.shortName = 'Wireless Coil & NFC';
      resolved.shortName_ta = 'வயர்லெஸ் சுருள் & NFC';
      resolved.name = 'Planar Qi Wireless Charging Induction & NFC Coil';
      resolved.name_ta = 'Qi வயர்லெஸ் சார்ஜிங் மற்றும் NFC சுருள்';
      resolved.specs = 'Multi-strand planar copper coil, ferrite magnetic shielding layer, NFC communication loop.';
    } else {
      // Budget / Non-Wireless (Infinix Hot 11S, Hot 12 Play, etc.)
      resolved.shortName = 'Mid-Frame Bracket';
      resolved.shortName_ta = 'உள் சட்டகம் & NFC தகடு';
      resolved.name = 'Reinforced Mid-Frame Stiffener & NFC Bracket';
      resolved.name_ta = 'உள் கட்டமைப்பு சட்டகம் மற்றும் NFC பிராக்கெட்';
      resolved.specs = 'Reinforced polycarbonate internal structural mid-frame bracket with integrated NFC antenna (No Wireless Coil).';
      resolved.specs_ta = 'பாலிகார்பனேட் உள் கட்டமைப்பு சட்டகம் மற்றும் NFC ஆண்டெனா பிராக்கெட் (வயர்லெஸ் சார்ஜிங் இல்லை).';
      resolved.function = 'Provides anti-torsion chassis rigidity, secures internal components, and supports NFC contactless transactions.';
      resolved.function_ta = 'மொபைல் வளைந்து போகாமல் தடுக்கும் உள் சட்டகம் மற்றும் NFC ஆண்டெனா.';
      resolved.commonIssues = 'Cracked screw mount standoffs from over-tightening during reassembly.';
      resolved.commonIssues_ta = 'ஸ்க்ரூக்களை அதிகமாக இறுக்குவதால் பிளாஸ்டிக் பிராக்கெட் உடைதல்.';
    }
  }

  // 5. BACK PANEL (Glass vs Polycarbonate vs Vegan Leather)
  else if (part.id === 'back_panel') {
    const isLeather = backMatStr.includes('leather') || (phone.backTextureStyle === 'vegan_leather_zipper');
    const isPlastic = isInfinix || backMatStr.includes('plastic') || backMatStr.includes('polycarbonate');

    if (isLeather) {
      resolved.shortName = 'Vegan Leather Back';
      resolved.shortName_ta = 'தோல் பின்புற கவர்';
      resolved.name = 'Embossed Vegan Leather Rear Cover Panel';
      resolved.name_ta = 'தோல் பின்புற கவர் பலகை';
      resolved.specs = 'High-grade textured vegan leather with stitched center racing seam.';
    } else if (isPlastic) {
      resolved.shortName = 'Polycarbonate Back Cover';
      resolved.shortName_ta = 'பாலிமர் பின்புற கவர்';
      resolved.name = 'Glossy Polycarbonate Composite Rear Cover Panel';
      resolved.name_ta = 'பாலிமர் கூட்டு பின்புற கவர் பலகை';
      resolved.specs = `${phone.colorName || 'Sonic Cyan'} • Holographic ${phone.backTextureStyle === 'wave_flow' ? 'Wave Flow Chevron' : 'Laser Pinstripe'} Coating • Shatter-Resistant Polycarbonate`;
      resolved.specs_ta = `${phone.colorName || 'Sonic Cyan'} • ஹாலோகிராபிக் கோட்டிங் • உடையும் தன்மை குறைந்த பாலிமர்`;
      resolved.function = 'Protects internal battery and logic circuitry with lightweight, impact-resistant polycarbonate composite shell.';
      resolved.function_ta = 'பேட்டரி மற்றும் மதர்போர்டை பாதுகாக்கும் இலகுரக பின்புற கவர்.';
    } else {
      resolved.shortName = 'Back Glass Cover';
      resolved.shortName_ta = 'பின் கண்ணாடி கவர்';
      resolved.name = 'Corning Gorilla Glass Rear Panel';
      resolved.name_ta = 'கொரில்லா கிளாஸ் பின் கவர்';
      resolved.specs = 'Chemically strengthened rear glass cover with oleophobic anti-fingerprint coating.';
    }
  }

  // 6. CHASSIS FRAME
  else if (part.id === 'frame') {
    const isTitanium = (phone.frameMaterial || '').toLowerCase().includes('titanium');
    resolved.name = isTitanium ? 'Aerospace Grade 5 Titanium Mid-Frame' : 'Aircraft-Grade Aluminum Chassis Frame';
    const dimsStr = (phone.width && phone.height) ? ` • Dimensions: ${phone.width} × ${phone.height} × ${phone.thickness || 8} mm` : '';
    const weightStr = phone.weight ? ` • Weight: ${phone.weight}` : '';
    resolved.specs = `${phone.frameMaterial || 'Aluminum'} structural frame${dimsStr}${weightStr}`;
  }

  // 7. BATTERY
  else if (part.id === 'battery') {
    const batteryCap = phone.battery || phone.batteryCapacity || '5000 mAh';
    const chargingSpd = phone.charging || '18W Fast Charge';
    resolved.specs = `Capacity: ${batteryCap} • Charging: ${chargingSpd} • Chem: Li-Ion Polymer`;
  }

  // 8. MOTHERBOARD
  else if (part.id === 'motherboard') {
    const socStr = phone.soc || phone.chipset || 'Octa-Core High-Speed Processor';
    const ramStr = phone.ram || '8GB High-Speed RAM';
    const storageStr = phone.storage ? ` • Storage: ${phone.storage}` : '';
    const osStr = phone.osAtLaunch || ((phone.brand || '').toLowerCase() === 'apple' ? 'iOS' : 'Android');
    resolved.specs = `Chipset: ${socStr} • RAM: ${ramStr}${storageStr} • OS: ${osStr}`;
  }

  // 9. REAR CAMERA MODULE
  else if (part.id === 'camera_module') {
    const opticsStr = phone.rearCamera || phone.cameraSpecs || 'Multi-Lens Camera Array';
    resolved.specs = `Optics: ${opticsStr} • Dual/Triple Lens Array • LED Flash`;
  }

  return resolved;
}

/**
 * Returns the array of all parts resolved specifically for the given phone.
 */
export function getResolvedParts(phone) {
  return baseParts.map((part) => resolvePartForPhone(part, phone));
}

/**
 * Returns the 13 component tags with phone-accurate dynamic labels and icons
 * for use in 3D floating tag pins and the bottom teardown HUD carousel.
 */
export function getPhoneComponentTags(phone, isTamil = false) {
  const resolved = getResolvedParts(phone);
  const iconMap = {
    screen: '📱',
    front_camera_module: '🤳',
    interconnect_flex: '🧬',
    motherboard: '🖥️',
    vapor_chamber: '❄️',
    battery: '🔋',
    loudspeaker: '🔊',
    haptic_engine: '📳',
    sub_board: '🔌',
    frame: '🛡️',
    wireless_coil: '⚡',
    camera_module: '📷',
    back_panel: '🪟',
  };

  return resolved.map((p) => ({
    id: p.id,
    icon: iconMap[p.id] || '⚙️',
    name: p.shortName || p.name,
    name_ta: p.shortName_ta || p.name_ta,
    layer: p.layer,
  }));
}
