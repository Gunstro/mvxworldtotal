// ============================================================================
// LEGACY FOUNDER IMPORT TOOL
// ============================================================================
// Admin page for importing the 350 legacy founders (early investors)
// ============================================================================

import { useState } from 'react'
import {
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    Download,
    FileSpreadsheet,
    Crown,
    Play,
    RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

// Types
interface FounderImportRow {
    email: string
    full_name: string
    username?: string
    visa_type: 'VIP Gold Founder' | 'VIP'
    phone?: string
    megabucks_balance?: number  // Earned MB from testing
    afro_balance?: number       // Earned AF from testing
    notes?: string
}

interface ImportResult {
    email: string
    status: 'success' | 'error' | 'exists'
    message: string
    user_id?: string
}

// Sample CSV format - Only full_name and visa_type are REQUIRED
// Email, username, phone, megabucks_balance, afro_balance, notes are all OPTIONAL
const CSV_TEMPLATE = `email,full_name,username,visa_type,phone,megabucks_balance,afro_balance,notes
john@example.com,John Smith,johnsmith,VIP Gold Founder,+44123456789,5000,250.50,Early investor
,Jane Doe,,VIP,,,100.00,No email provided
,Bob Wilson,bobw,VIP Gold Founder,,2500,,Has MB only
mary@example.com,Mary Johnson,,VIP,+44555123456,,,Has email and phone`

export function LegacyFounderImport() {
    const [csvData, setCsvData] = useState('')
    const [parsedRows, setParsedRows] = useState<FounderImportRow[]>([])
    const [importResults, setImportResults] = useState<ImportResult[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload')

    // Parse CSV data
    const parseCSV = (csv: string): FounderImportRow[] => {
        const lines = csv.trim().split('\n')
        if (lines.length < 2) {
            console.log('CSV Debug: Less than 2 lines found')
            return []
        }

        // Detect delimiter (comma or semicolon)
        const delimiter = lines[0].includes(';') ? ';' : ','
        console.log('CSV Debug: Using delimiter:', delimiter)

        const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''))
        console.log('CSV Debug: Headers found:', headers)

        const rows: FounderImportRow[] = []
        const skippedRows: string[] = []

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue // Skip empty lines

            const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
            const row: any = {}

            headers.forEach((header, index) => {
                row[header] = values[index] || ''
            })

            console.log(`CSV Debug: Row ${i}:`, row)

            // Only full_name and visa_type are required
            if (row.full_name && row.visa_type) {
                // Normalize visa type - be flexible with variations
                const visaTypeNorm = row.visa_type.toLowerCase().trim()
                let finalVisaType: 'VIP Gold Founder' | 'VIP' | null = null

                if (visaTypeNorm.includes('gold') && visaTypeNorm.includes('founder')) {
                    finalVisaType = 'VIP Gold Founder'
                } else if (visaTypeNorm === 'vip' || visaTypeNorm === 'vip founder' || visaTypeNorm === 'founder') {
                    finalVisaType = 'VIP'
                } else if (visaTypeNorm.includes('vip gold') || visaTypeNorm.includes('gold vip')) {
                    finalVisaType = 'VIP Gold Founder'
                } else if (visaTypeNorm.includes('vip')) {
                    finalVisaType = 'VIP'
                }

                if (finalVisaType) {
                    // Generate placeholder email if not provided
                    const safeName = row.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')
                    const generatedEmail = row.email || `legacy_${safeName}_${i}@megavx.placeholder`
                    const generatedUsername = row.username || safeName || `user${i}`

                    rows.push({
                        email: generatedEmail,
                        full_name: row.full_name,
                        username: generatedUsername,
                        visa_type: finalVisaType,
                        phone: row.phone || '',
                        megabucks_balance: row.megabucks_balance ? parseInt(row.megabucks_balance) : 0,
                        afro_balance: row.afro_balance ? parseFloat(row.afro_balance) : 0,
                        notes: row.notes || '',
                    })
                } else {
                    skippedRows.push(`Row ${i}: Invalid visa_type "${row.visa_type}"`)
                }
            } else {
                skippedRows.push(`Row ${i}: Missing full_name or visa_type`)
            }
        }

        if (skippedRows.length > 0) {
            console.log('CSV Debug: Skipped rows:', skippedRows)
        }
        console.log('CSV Debug: Valid rows found:', rows.length)

        return rows
    }

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            setCsvData(text)
            const rows = parseCSV(text)
            setParsedRows(rows)
            setStep('preview')
            setError(null)
        }
        reader.readAsText(file)
    }

    // Handle manual CSV paste
    const handleCSVPaste = () => {
        const rows = parseCSV(csvData)
        if (rows.length === 0) {
            setError('No valid rows found. Please check CSV format.')
            return
        }
        setParsedRows(rows)
        setStep('preview')
        setError(null)
    }

    // Download template
    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'legacy_founders_template.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    // Import founders
    const importFounders = async () => {
        setIsImporting(true)
        setStep('importing')
        setImportResults([])
        setImportProgress(0)

        const results: ImportResult[] = []

        for (let i = 0; i < parsedRows.length; i++) {
            const row = parsedRows[i]
            setImportProgress(Math.round(((i + 1) / parsedRows.length) * 100))

            try {
                // 1. Check if user already exists (by email if provided)
                if (row.email && !row.email.includes('@megavx.placeholder')) {
                    const { data: existingUser } = await supabase
                        .from('users')
                        .select('id, email')
                        .eq('email', row.email)
                        .single()

                    if (existingUser) {
                        results.push({
                            email: row.email,
                            status: 'exists',
                            message: 'User already exists',
                            user_id: existingUser.id,
                        })
                        continue
                    }
                }

                // 2. Get visa ID for the visa type
                const { data: visaData, error: visaError } = await supabase
                    .from('visas')
                    .select('id')
                    .eq('visa_type', row.visa_type)
                    .single()

                if (visaError || !visaData) {
                    // Try alternate visa type name
                    const altVisaType = row.visa_type === 'VIP Gold Founder' ? 'Gold VIP Founder' : row.visa_type
                    const { data: altVisaData } = await supabase
                        .from('visas')
                        .select('id')
                        .eq('visa_type', altVisaType)
                        .single()

                    if (!altVisaData) {
                        results.push({
                            email: row.email,
                            status: 'error',
                            message: `Visa type "${row.visa_type}" not found in database`,
                        })
                        continue
                    }
                }

                const finalVisaId = visaData?.id

                // 3. Create user in 'users' table
                const { data: newUser, error: userError } = await supabase
                    .from('users')
                    .insert({
                        email: row.email || null,
                        full_name: row.full_name,
                        phone: row.phone || null,
                        visa_id: finalVisaId,
                        is_verified: true,  // Legacy founders are pre-verified
                        is_active: true,
                    })
                    .select()
                    .single()

                if (userError) {
                    results.push({
                        email: row.email,
                        status: 'error',
                        message: `User creation failed: ${userError.message}`,
                    })
                    continue
                }

                // 4. Create matrix position at Level 1 (Founder)
                const { data: matrixData, error: matrixError } = await supabase
                    .from('matrix_positions')
                    .insert({
                        user_id: newUser.id,
                        visa_id: finalVisaId,
                        matrix_level: 1,
                        max_children: 20,
                        depth: 1,
                        is_legacy_founder: true,
                        sponsor_id: '00000000-0000-0000-0000-000000000000', // Poverty Relief root
                    })
                    .select('id')
                    .single()

                // Update user with matrix_position_id
                if (matrixData?.id) {
                    await supabase
                        .from('users')
                        .update({ matrix_position_id: matrixData.id })
                        .eq('id', newUser.id)
                }

                if (matrixError) {
                    results.push({
                        email: row.email,
                        status: 'error',
                        message: `User created but matrix position failed: ${matrixError.message}`,
                        user_id: newUser.id,
                    })
                    continue
                }

                // 5. Create OPEN spots for this Founder (20 Level 2 + 200 Level 3)
                if (matrixData?.id) {
                    const { error: openSpotsError } = await supabase
                        .rpc('create_founder_open_spots', {
                            p_founder_position_id: matrixData.id,
                            p_create_level_3: true
                        })

                    if (openSpotsError) {
                        console.warn('OPEN spots creation warning:', openSpotsError.message)
                    }
                }

                // 6. Create wallet with existing balances
                const { error: walletError } = await supabase
                    .from('user_wallets')
                    .insert({
                        user_id: newUser.id,
                        current_visa_id: finalVisaId,
                        monthly_cap: row.visa_type === 'VIP Gold Founder' ? 25000 : 21000,
                        megabucks_balance: row.megabucks_balance || 0,
                        afro_available: row.afro_balance || 0,
                        lifetime_megabucks_earned: row.megabucks_balance || 0,
                        lifetime_afro_earned: row.afro_balance || 0,
                    })

                if (walletError) {
                    console.warn('Wallet creation warning:', walletError.message)
                }

                const openSpotsCreated = matrixData?.id ? 220 : 0 // 20 L2 + 200 L3
                results.push({
                    email: row.email,
                    status: 'success',
                    message: `Founder imported + ${openSpotsCreated} OPEN spots created`,
                    user_id: newUser.id,
                })

            } catch (err: any) {
                results.push({
                    email: row.email,
                    status: 'error',
                    message: err.message || 'Unknown error',
                })
            }
        }

        setImportResults(results)
        setIsImporting(false)
        setStep('complete')
    }

    // Reset and start over
    const reset = () => {
        setCsvData('')
        setParsedRows([])
        setImportResults([])
        setImportProgress(0)
        setError(null)
        setStep('upload')
    }

    // Count results by status
    const successCount = importResults.filter(r => r.status === 'success').length
    const errorCount = importResults.filter(r => r.status === 'error').length
    const existsCount = importResults.filter(r => r.status === 'exists').length

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #d4af37 0%, #c9a227 100%)' }}
                    >
                        <Crown className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Legacy Founder Import</h1>
                        <p className="text-gray-400">Import early investors as Level 1 Founders</p>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-4 mb-8">
                    {['upload', 'preview', 'importing', 'complete'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s
                                    ? 'bg-amber-500 text-black'
                                    : ['upload', 'preview', 'importing', 'complete'].indexOf(step) > i
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-700 text-gray-400'
                                    }`}
                            >
                                {i + 1}
                            </div>
                            <span className={`text-sm ${step === s ? 'text-amber-400' : 'text-gray-500'}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                            {i < 3 && <div className="w-8 h-0.5 bg-gray-700" />}
                        </div>
                    ))}
                </div>

                {/* STEP 1: UPLOAD */}
                {step === 'upload' && (
                    <div className="space-y-6">
                        {/* Template Download */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-6 h-6 text-amber-400" />
                                    <div>
                                        <h3 className="font-medium text-white">Download CSV Template</h3>
                                        <p className="text-sm text-gray-400">Get the correct format for importing founders</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-2 px-4 py-2"
                                    style={{ backgroundColor: '#2a2a2a', color: '#fff' }}
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </Button>
                            </div>
                        </Card>

                        {/* File Upload */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h3 className="font-medium text-white mb-4">Upload CSV File</h3>
                            <label
                                className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors hover:border-amber-500"
                                style={{ borderColor: '#3a3a3a' }}
                            >
                                <Upload className="w-12 h-12 text-gray-500 mb-3" />
                                <span className="text-gray-400">Click to upload or drag and drop</span>
                                <span className="text-xs text-gray-500 mt-1">CSV files only</span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </Card>

                        {/* Manual Paste */}
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <h3 className="font-medium text-white mb-4">Or Paste CSV Data</h3>
                            <textarea
                                value={csvData}
                                onChange={(e) => setCsvData(e.target.value)}
                                placeholder="email,full_name,username,visa_type,phone,notes&#10;john@example.com,John Smith,johnsmith,VIP Gold Founder,+44123,Early investor"
                                className="w-full h-40 p-4 rounded-lg text-sm font-mono text-gray-300 resize-none"
                                style={{ backgroundColor: '#0a0a0a', border: '1px solid #3a3a3a' }}
                            />
                            <Button
                                onClick={handleCSVPaste}
                                disabled={!csvData.trim()}
                                className="mt-4 flex items-center gap-2 px-6 py-2"
                                style={{
                                    background: csvData.trim() ? 'linear-gradient(to right, #d4af37, #c9a227)' : '#3a3a3a',
                                    color: '#0a0a0a'
                                }}
                            >
                                Parse CSV
                            </Button>
                        </Card>

                        {error && (
                            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <span className="text-red-300">{error}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: PREVIEW */}
                {step === 'preview' && (
                    <div className="space-y-6">
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-white">Preview Import ({parsedRows.length} founders)</h3>
                                <Button
                                    onClick={reset}
                                    className="flex items-center gap-2 px-4 py-2"
                                    style={{ backgroundColor: '#2a2a2a', color: '#fff' }}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Start Over
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-400 border-b border-gray-700">
                                            <th className="py-2 px-3">#</th>
                                            <th className="py-2 px-3">Email</th>
                                            <th className="py-2 px-3">Name</th>
                                            <th className="py-2 px-3">Username</th>
                                            <th className="py-2 px-3">Visa</th>
                                            <th className="py-2 px-3">MB</th>
                                            <th className="py-2 px-3">AF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedRows.slice(0, 20).map((row, i) => (
                                            <tr key={i} className="text-gray-300 border-b border-gray-800">
                                                <td className="py-2 px-3 text-gray-500">{i + 1}</td>
                                                <td className="py-2 px-3">{row.email}</td>
                                                <td className="py-2 px-3">{row.full_name}</td>
                                                <td className="py-2 px-3 text-gray-400">@{row.username}</td>
                                                <td className="py-2 px-3">
                                                    <span
                                                        className="px-2 py-1 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: row.visa_type === 'VIP Gold Founder' ? '#d4af37' : '#9333ea',
                                                            color: '#000'
                                                        }}
                                                    >
                                                        {row.visa_type}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-cyan-400">
                                                    {(row.megabucks_balance || 0).toLocaleString()} MB
                                                </td>
                                                <td className="py-2 px-3 text-amber-400">
                                                    £{(row.afro_balance || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedRows.length > 20 && (
                                    <p className="text-center text-gray-500 text-sm mt-4">
                                        ...and {parsedRows.length - 20} more
                                    </p>
                                )}
                            </div>
                        </Card>

                        {/* Summary by visa type */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #d4af37' }}>
                                <div className="text-2xl font-bold text-amber-400">
                                    {parsedRows.filter(r => r.visa_type === 'VIP Gold Founder').length}
                                </div>
                                <div className="text-sm text-gray-400">VIP Gold Founders</div>
                            </Card>
                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #9333ea' }}>
                                <div className="text-2xl font-bold text-purple-400">
                                    {parsedRows.filter(r => r.visa_type === 'VIP').length}
                                </div>
                                <div className="text-sm text-gray-400">VIP Founders</div>
                            </Card>
                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #06b6d4' }}>
                                <div className="text-2xl font-bold text-cyan-400">
                                    {parsedRows.reduce((sum, r) => sum + (r.megabucks_balance || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-400">Total MegaBucks (MB)</div>
                            </Card>
                            <Card className="p-4" style={{ backgroundColor: '#121212', border: '1px solid #22c55e' }}>
                                <div className="text-2xl font-bold text-green-400">
                                    £{parsedRows.reduce((sum, r) => sum + (r.afro_balance || 0), 0).toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-400">Total AFRO (AF)</div>
                            </Card>
                        </div>

                        {/* Import Button */}
                        <Button
                            onClick={importFounders}
                            className="w-full flex items-center justify-center gap-2 py-4 text-lg font-bold"
                            style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                        >
                            <Play className="w-5 h-5" />
                            Import {parsedRows.length} Founders
                        </Button>
                    </div>
                )}

                {/* STEP 3: IMPORTING */}
                {step === 'importing' && (
                    <Card className="p-8 text-center" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                        <Loader2 className="w-12 h-12 mx-auto text-amber-400 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Importing Founders...</h3>
                        <p className="text-gray-400 mb-6">Please wait while we create accounts and matrix positions</p>

                        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${importProgress}%`,
                                    background: 'linear-gradient(to right, #d4af37, #c9a227)'
                                }}
                            />
                        </div>
                        <p className="text-sm text-gray-500">{importProgress}% complete</p>
                    </Card>
                )}

                {/* STEP 4: COMPLETE */}
                {step === 'complete' && (
                    <div className="space-y-6">
                        <Card className="p-6" style={{ backgroundColor: '#121212', border: '1px solid #2a2a2a' }}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Import Complete!</h3>
                                    <p className="text-gray-400">
                                        Processed {importResults.length} founders
                                    </p>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-center">
                                    <div className="text-2xl font-bold text-green-400">{successCount}</div>
                                    <div className="text-sm text-gray-400">Imported</div>
                                </div>
                                <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">{existsCount}</div>
                                    <div className="text-sm text-gray-400">Already Exist</div>
                                </div>
                                <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-center">
                                    <div className="text-2xl font-bold text-red-400">{errorCount}</div>
                                    <div className="text-sm text-gray-400">Errors</div>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="overflow-x-auto max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-gray-900">
                                        <tr className="text-left text-gray-400 border-b border-gray-700">
                                            <th className="py-2 px-3">Email</th>
                                            <th className="py-2 px-3">Status</th>
                                            <th className="py-2 px-3">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResults.map((result, i) => (
                                            <tr key={i} className="text-gray-300 border-b border-gray-800">
                                                <td className="py-2 px-3">{result.email}</td>
                                                <td className="py-2 px-3">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${result.status === 'success'
                                                            ? 'bg-green-900/50 text-green-400'
                                                            : result.status === 'exists'
                                                                ? 'bg-yellow-900/50 text-yellow-400'
                                                                : 'bg-red-900/50 text-red-400'
                                                            }`}
                                                    >
                                                        {result.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3 text-gray-400">{result.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 py-3"
                            style={{ backgroundColor: '#2a2a2a', color: '#fff' }}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Import More Founders
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LegacyFounderImport
