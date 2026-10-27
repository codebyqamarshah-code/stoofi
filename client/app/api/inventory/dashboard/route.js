import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { 
  ItemCategory, 
  ItemStore, 
  Supplier, 
  InventoryItem, 
  StockMovement, 
  ItemReceive, 
  ItemSell, 
  ItemIssue 
} from '@/lib/models';
import { seedInventoryIfEmpty } from '@/lib/inventoryService';

export async function GET() {
  try {
    await connectDB();
    await seedInventoryIfEmpty();

    const [
      categoriesCount,
      storesCount,
      suppliersCount,
      allItems,
      receivesCount,
      salesCount,
      issuesCount,
      recentMovements
    ] = await Promise.all([
      ItemCategory.countDocuments({ status: 'Active' }),
      ItemStore.countDocuments({ status: 'Active' }),
      Supplier.countDocuments({ status: 'Active' }),
      InventoryItem.find({}).lean(),
      ItemReceive.countDocuments({ status: 'Posted' }),
      ItemSell.countDocuments({ status: 'Posted' }),
      ItemIssue.countDocuments({ status: { $ne: 'Cancelled' } }),
      StockMovement.find({}).sort({ date: -1, createdAt: -1 }).limit(10).lean()
    ]);

    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;
    const lowStockItems = [];

    allItems.forEach(item => {
      const stock = Number(item.totalStock) || 0;
      const min = Number(item.minStock) || 0;
      const cost = Number(item.unitCost) || 0;
      totalStockUnits += stock;
      totalValuation += Math.max(0, stock * cost);

      if (stock <= 0) {
        outOfStockCount++;
        lowStockItems.push({
          id: item._id,
          name: item.name,
          code: item.code,
          category: item.categoryName,
          inStock: stock,
          minLevel: min,
          unit: item.unit,
          status: 'Out of Stock'
        });
      } else if (stock <= min) {
        lowStockCount++;
        lowStockItems.push({
          id: item._id,
          name: item.name,
          code: item.code,
          category: item.categoryName,
          inStock: stock,
          minLevel: min,
          unit: item.unit,
          status: 'Low Stock'
        });
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalCategories: categoriesCount,
        totalStores: storesCount,
        totalSuppliers: suppliersCount,
        totalItems: allItems.length,
        totalStockUnits,
        totalValuation,
        lowStockCount,
        outOfStockCount,
        totalReceives: receivesCount,
        totalSales: salesCount,
        totalIssues: issuesCount
      },
      lowStockItems: lowStockItems.slice(0, 8),
      recentMovements
    });
  } catch (error) {
    console.error('API /inventory/dashboard GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
