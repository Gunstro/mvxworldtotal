// ============================================================================
// MDP CSV TRANSFORMER
// ============================================================================
// Transforms the old mdp_devices CSV to the new mdps format for Supabase
// ============================================================================

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_CSV = path.join(__dirname, 'mdp_devices.csv');  // Place your CSV here
const OUTPUT_CSV = path.join(__dirname, 'mdps_import.csv');
const OUTPUT_SQL = path.join(__dirname, 'mdps_import.sql');

// Parse CSV manually - handles TAB-delimited files (like Supabase export)
function parseCSV(content) {
    // Normalize line endings
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n');

    // Detect delimiter (tab or comma)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    console.log(`   Detected delimiter: ${delimiter === '\t' ? 'TAB' : 'COMMA'}`);

    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));
    console.log(`   Headers: ${headers.join(', ')}`);

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by delimiter
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));

        const record = {};
        headers.forEach((header, idx) => {
            record[header] = values[idx] || '';
        });
        records.push(record);
    }

    return records;
}

// Parse location string: "-26.1156448,28.1444458,1662.5999,16.44"
function parseLocation(locationStr) {
    if (!locationStr || locationStr === '0.0,0.0,0.0,0.0') {
        return { lat: null, lng: null };
    }

    const parts = locationStr.split(',');
    if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        // Validate coordinates
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            return { lat, lng };
        }
    }
    return { lat: null, lng: null };
}

// Transform record to new format
function transformRecord(record, index) {
    const location = parseLocation(record.reg_location || record.last_location);

    return {
        bluetooth_uuid: record.device_key || record.uuid,
        device_name: record.name || `MDP-${String(index + 1).padStart(5, '0')}`,
        device_type: 'POI-Beacon',
        latitude: location.lat,
        longitude: location.lng,
        is_active: record.enabled?.toLowerCase() === 'true' || record.enabled === 't' || record.enabled === '1',
        is_verified: false,
        last_seen_at: record.last_seen_at || new Date().toISOString(),
        total_impressions: parseInt(record.total_events) || 0,
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString()
    };
}

// Generate CSV output for Supabase import
function generateCSV(records) {
    const headers = [
        'bluetooth_uuid',
        'device_name',
        'device_type',
        'latitude',
        'longitude',
        'is_active',
        'is_verified',
        'last_seen_at',
        'total_impressions',
        'created_at',
        'updated_at'
    ];

    let csv = headers.join(',') + '\n';

    for (const record of records) {
        const row = [
            `"${record.bluetooth_uuid}"`,
            `"${record.device_name}"`,
            `"${record.device_type}"`,
            record.latitude !== null ? record.latitude : '',
            record.longitude !== null ? record.longitude : '',
            record.is_active,
            record.is_verified,
            `"${record.last_seen_at}"`,
            record.total_impressions,
            `"${record.created_at}"`,
            `"${record.updated_at}"`
        ];
        csv += row.join(',') + '\n';
    }

    return csv;
}

// Generate SQL for batch insert (in chunks to avoid issues)
function generateSQL(records, chunkSize = 500) {
    let sql = '-- Auto-generated MDP import\n';
    sql += `-- Total records: ${records.length}\n\n`;

    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        sql += `-- Batch ${Math.floor(i / chunkSize) + 1} (records ${i + 1} to ${Math.min(i + chunkSize, records.length)})\n`;
        sql += 'INSERT INTO mdps (bluetooth_uuid, device_name, device_type, latitude, longitude, is_active, is_verified, last_seen_at, total_impressions, created_at, updated_at) VALUES\n';

        const values = chunk.map(r => {
            const lat = r.latitude !== null ? r.latitude : 'NULL';
            const lng = r.longitude !== null ? r.longitude : 'NULL';
            return `('${r.bluetooth_uuid}', '${r.device_name.replace(/'/g, "''")}', '${r.device_type}', ${lat}, ${lng}, ${r.is_active}, ${r.is_verified}, '${r.last_seen_at}', ${r.total_impressions}, '${r.created_at}', '${r.updated_at}')`;
        });

        sql += values.join(',\n') + '\nON CONFLICT (bluetooth_uuid) DO NOTHING;\n\n';
    }

    sql += '-- Verify import\n';
    sql += 'SELECT COUNT(*) as total_mdps FROM mdps;\n';

    return sql;
}

// Main execution
async function main() {
    console.log('🔵 MDP CSV Transformer\n');

    // Check if input file exists
    if (!fs.existsSync(INPUT_CSV)) {
        console.log(`❌ Input file not found: ${INPUT_CSV}`);
        console.log('\n📋 Please place your CSV file at:');
        console.log(`   ${INPUT_CSV}`);
        console.log('\n   Or modify INPUT_CSV path in this script.');
        return;
    }

    // Read and parse CSV
    console.log(`📖 Reading: ${INPUT_CSV}`);
    const content = fs.readFileSync(INPUT_CSV, 'utf-8');
    const records = parseCSV(content);
    console.log(`   Found ${records.length} records\n`);

    // Transform records
    console.log('🔄 Transforming records...');
    const transformed = records.map((r, i) => transformRecord(r, i));

    // Count records with valid coordinates
    const withCoords = transformed.filter(r => r.latitude !== null && r.longitude !== null);
    console.log(`   ${withCoords.length} records have valid coordinates\n`);

    // Generate CSV output
    console.log('📝 Generating CSV output...');
    const csvOutput = generateCSV(transformed);
    fs.writeFileSync(OUTPUT_CSV, csvOutput);
    console.log(`   ✅ Saved: ${OUTPUT_CSV}\n`);

    // Generate SQL output
    console.log('📝 Generating SQL output...');
    const sqlOutput = generateSQL(transformed);
    fs.writeFileSync(OUTPUT_SQL, sqlOutput);
    console.log(`   ✅ Saved: ${OUTPUT_SQL}\n`);

    console.log('🎉 Done!\n');
    console.log('📋 Next steps:');
    console.log('   Option 1: Import CSV via Supabase Dashboard');
    console.log('      1. Go to Supabase → Table Editor → mdps');
    console.log('      2. Click "Import" → Upload mdps_import.csv');
    console.log('');
    console.log('   Option 2: Run SQL directly');
    console.log('      1. Go to Supabase → SQL Editor');
    console.log('      2. Copy/paste contents of mdps_import.sql');
    console.log('      3. Run in batches if needed');
}

main();
