import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lab, LabEquipment, LabMaintenance, LabConsumable, LabPractical } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const [labs, equipment, maintenance, consumables, practicals] = await Promise.all([
      Lab.find().lean(),
      LabEquipment.find().lean(),
      LabMaintenance.find().lean(),
      LabConsumable.find().lean(),
      LabPractical.find().lean()
    ]);

    const totalAssetValuation = equipment.reduce((sum, item) => {
      const cost = Number(String(item.purchaseCost || 0).replace(/[^0-9.]/g, '')) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + (cost * qty);
    }, 0);

    const totalAssetsCount = equipment.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalLabMaintenance = maintenance.reduce((sum, item) => {
      return sum + (Number(item.costIncurred) || 0);
    }, 0);

    const activeLabsCount = labs.filter(l => l.status === 'Active').length;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAssetValuation,
          totalAssetsCount,
          totalLabMaintenance,
          totalLabs: labs.length,
          activeLabs: activeLabsCount,
          underMaintenanceCount: maintenance.filter(m => m.status !== 'Closed' && m.status !== 'Repaired').length
        },
        rawEquipment: equipment,
        rawLabs: labs,
        rawMaintenance: maintenance,
        rawConsumables: consumables,
        rawPracticals: practicals
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
