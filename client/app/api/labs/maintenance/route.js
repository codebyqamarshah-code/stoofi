import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LabMaintenance } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const labName = searchParams.get('labName');
    const status = searchParams.get('status');
    const filter = {};
    if (labName && labName !== 'All') filter.labName = labName;
    if (status && status !== 'All') filter.status = status;

    let items = await LabMaintenance.find(filter).sort({ createdAt: -1 }).lean();

    // If database has 0 records, seed realistic Pak Royal College maintenance & repair records
    if (items.length === 0 && !labName && !status) {
      const initialRecords = [
        {
          id: 'MR-101',
          requestId: 'MR-101',
          equipmentName: 'Compound Binocular Microscope (Olympus CX23)',
          assetCode: 'MLT-MIC-002',
          labName: 'Medical Lab Technology (MLT) Lab',
          category: 'Laboratory Instruments & Medical Equipment',
          priority: 'High',
          reportedBy: 'Dr. Tariq (MLT Faculty)',
          reportedDate: '2026-10-24',
          assignedTo: 'Engr. Bilal (Biomedical Tech)',
          status: 'In Repair',
          estimatedCost: 6000,
          actualCost: 4500,
          costIncurred: 4500,
          downtime: '2 Days',
          nextMaintenanceDate: '2026-11-24',
          description: 'Fine focus knob slipping under 100x oil immersion lens; objective alignment needed.',
          resolutionNotes: 'Focus gear cleaned and re-greased; 40x and 100x objectives recalibrated.'
        },
        {
          id: 'MR-102',
          requestId: 'MR-102',
          equipmentName: 'Campus RO Water Filtration Plant (1000 LPH)',
          assetCode: 'CAM-RO-001',
          labName: 'Campus Water Filtration & Solar Power Facility',
          category: 'Plumbing & Clean Water Filtration',
          priority: 'High',
          reportedBy: 'Admin Office (Mr. Qamar)',
          reportedDate: '2026-10-20',
          assignedTo: 'Campus Plumber (Arshad Ali)',
          status: 'Completed',
          estimatedCost: 15000,
          actualCost: 12000,
          costIncurred: 12000,
          downtime: '1 Day',
          nextMaintenanceDate: '2026-12-20',
          description: 'Periodic membrane filter replacement, carbon filtration media wash, and TDS level verification.',
          resolutionNotes: 'Replaced 2 sediment filters and 1 RO membrane. Clean drinking TDS tested at 145 ppm.'
        },
        {
          id: 'MR-103',
          requestId: 'MR-103',
          equipmentName: 'Student Dual Benches & Desks (Qty: 6 sets)',
          assetCode: 'FUR-DSK-018',
          labName: 'Main Academic Block A (Classrooms & Lecture Halls)',
          category: 'Classroom Furniture & Desks',
          priority: 'Medium',
          reportedBy: 'Faculty Coordinator',
          reportedDate: '2026-10-18',
          assignedTo: 'Campus Carpenter (Nadeem)',
          status: 'Completed',
          estimatedCost: 4000,
          actualCost: 3200,
          costIncurred: 3200,
          downtime: '0 Days',
          nextMaintenanceDate: '2026-12-01',
          description: 'Wooden tops loose and book rack screws missing in Lecture Hall 2.',
          resolutionNotes: 'Reinforced brackets, replaced screws, and sanded wood finish.'
        },
        {
          id: 'MR-104',
          requestId: 'MR-104',
          equipmentName: '10kVA Solar Hybrid Inverter & Heavy Battery Bank',
          assetCode: 'ENG-SOL-001',
          labName: 'Campus Water Filtration & Solar Power Facility',
          category: 'Electrical & Power Backup',
          priority: 'Medium',
          reportedBy: 'Campus Supervisor',
          reportedDate: '2026-10-15',
          assignedTo: 'In-house Electrician (Rashid Khan)',
          status: 'Completed',
          estimatedCost: 3000,
          actualCost: 2000,
          costIncurred: 2000,
          downtime: '0 Days',
          nextMaintenanceDate: '2026-11-15',
          description: 'Monthly terminal lead-acid distilled water check, dust cleaning, and load balancing.',
          resolutionNotes: 'All 8 tubular batteries topped up with distilled water. DC breaker tightened.'
        },
        {
          id: 'MR-105',
          requestId: 'MR-105',
          equipmentName: 'Vertical Steam Autoclave 50L (Sterilizer)',
          assetCode: 'PHA-AUT-001',
          labName: 'Pharmacy Technician Practical Lab',
          category: 'Laboratory Instruments & Medical Equipment',
          priority: 'Critical',
          reportedBy: 'Madam Ayesha (Lab Incharge)',
          reportedDate: '2026-10-27',
          assignedTo: 'Authorized Vendor (MediEquip Services)',
          status: 'Under Inspection',
          estimatedCost: 9500,
          actualCost: 0,
          costIncurred: 0,
          downtime: '3 Days',
          nextMaintenanceDate: '2026-11-05',
          description: 'Rubber silicon gasket worn out causing steam pressure drop during 121°C sterilization cycle.',
          resolutionNotes: 'Technician inspection complete. Replacement high-temp gasket ordered from Lahore vendor.'
        },
        {
          id: 'MR-106',
          requestId: 'MR-106',
          equipmentName: 'Classroom Ceiling Fans & LED Tube Lights',
          assetCode: 'ELE-FAN-022',
          labName: 'Main Academic Block A (Classrooms & Lecture Halls)',
          category: 'Electrical & Power Backup',
          priority: 'Low',
          reportedBy: 'Staff Support',
          reportedDate: '2026-10-12',
          assignedTo: 'In-house Electrician (Rashid Khan)',
          status: 'Closed',
          estimatedCost: 2500,
          actualCost: 1800,
          costIncurred: 1800,
          downtime: '0 Days',
          nextMaintenanceDate: '2027-04-01',
          description: 'Slow rotation speed in Room 14 and flickering LED batten in Room 16.',
          resolutionNotes: 'Replaced 2.5uF fan capacitors and replaced 1 driver unit on 36W LED.'
        },
        {
          id: 'MR-107',
          requestId: 'MR-107',
          equipmentName: 'Split Air Conditioner 1.5 Ton (Inverter)',
          assetCode: 'HVAC-AC-008',
          labName: 'Computer & Digital IT Lab',
          category: 'HVAC & Air Conditioning',
          priority: 'Medium',
          reportedBy: 'Sir Imran (IT Faculty)',
          reportedDate: '2026-10-25',
          assignedTo: 'AC Tech (Tariq Refrigeration)',
          status: 'In Repair',
          estimatedCost: 7500,
          actualCost: 6000,
          costIncurred: 6000,
          downtime: '1 Day',
          nextMaintenanceDate: '2026-11-20',
          description: 'Low air throw and indoor coil freezing after 3 hours continuous practical session.',
          resolutionNotes: 'Indoor blower wheel washed with pressure jet. R410A refrigerant topped up.'
        },
        {
          id: 'MR-108',
          requestId: 'MR-108',
          equipmentName: 'Automated 3-Part Hematology Analyzer',
          assetCode: 'MLT-HEM-001',
          labName: 'Medical Lab Technology (MLT) Lab',
          category: 'Laboratory Instruments & Medical Equipment',
          priority: 'Critical',
          reportedBy: 'Lab Director',
          reportedDate: '2026-10-08',
          assignedTo: 'Authorized Biomedical Engineer',
          status: 'Completed',
          estimatedCost: 18000,
          actualCost: 15000,
          costIncurred: 15000,
          downtime: '1 Day',
          nextMaintenanceDate: '2026-12-08',
          description: 'Monthly scheduled maintenance: lysing reagent tube wash, pinch valve check, and calibration with control blood.',
          resolutionNotes: 'Background counts within zero limits. Tri-level control blood ran with CV < 2%.'
        }
      ];

      try {
        await LabMaintenance.insertMany(initialRecords);
        items = await LabMaintenance.find(filter).sort({ createdAt: -1 }).lean();
      } catch (_) {}
    }

    return NextResponse.json({ success: true, data: items || [] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body.labName && !body.facilityName) {
      body.labName = 'Main Campus';
    }

    // Auto-generate Request ID
    if (!body.id && !body.requestId) {
      const count = await LabMaintenance.countDocuments();
      body.id = `MR-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
      body.requestId = body.id;
    } else if (body.id && !body.requestId) {
      body.requestId = body.id;
    }

    const created = await LabMaintenance.create(body);
    return NextResponse.json({ success: true, data: created, message: 'Maintenance record created successfully' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
