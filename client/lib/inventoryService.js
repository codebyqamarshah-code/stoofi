import { connectDB } from './db.js';
import { 
  ItemCategory, 
  ItemStore, 
  Supplier, 
  InventoryItem, 
  StockMovement, 
  ItemReceive, 
  ItemSell, 
  ItemIssue 
} from './models.js';

/**
 * Recalculate total available stock and store-by-store breakdown for a specific item
 * by summing all posted StockMovements.
 */
export async function recalculateItemStock(itemId) {
  await connectDB();
  
  // Aggregate net quantity across all movements for this item
  const movements = await StockMovement.find({ itemId }).lean();
  
  let totalStock = 0;
  const storeMap = {};

  movements.forEach(m => {
    const net = Number(m.netQuantity) || 0;
    totalStock += net;

    const sId = String(m.storeId);
    if (!storeMap[sId]) {
      storeMap[sId] = {
        storeId: m.storeId,
        storeName: m.storeName,
        quantity: 0
      };
    }
    storeMap[sId].quantity += net;
  });

  const storeStock = Object.values(storeMap);

  await InventoryItem.findByIdAndUpdate(itemId, {
    totalStock,
    storeStock
  });

  return { totalStock, storeStock };
}

/**
 * Get available stock for a specific item in a specific store
 */
export async function getStoreAvailableStock(itemId, storeId) {
  await connectDB();
  const movements = await StockMovement.find({ itemId, storeId }).lean();
  return movements.reduce((acc, m) => acc + (Number(m.netQuantity) || 0), 0);
}

/**
 * Seed initial realistic Inventory data for Pak Royal College if collection is empty
 */
export async function seedInventoryIfEmpty() {
  await connectDB();
  const catCount = await ItemCategory.countDocuments();
  if (catCount > 0) return;

  console.log('📦 Seeding initial Inventory system for Pak Royal College...');

  // 1. Categories
  const categoriesData = [
    { name: 'Medical & Clinical Supplies', code: 'CAT-MED', description: 'Sterile disposables, PPE, diagnostic accessories and first aid', status: 'Active' },
    { name: 'Laboratory Equipment & Glassware', code: 'CAT-LAB', description: 'Beakers, slides, pipettes, test tubes and lab apparatus', status: 'Active' },
    { name: 'Stationery & Examination Printing', code: 'CAT-STA', description: 'Paper, answer booklets, registers, toner and office supplies', status: 'Active' },
    { name: 'Allied Health & OT Instruments', code: 'CAT-OTT', description: 'Surgical trays, scalpel handles, forceps, and scissors', status: 'Active' },
    { name: 'Uniform, Lab Coats & Badges', code: 'CAT-UNI', description: 'Student white clinical coats, college badges and uniforms', status: 'Active' },
    { name: 'Sports & Gymnasium Equipment', code: 'CAT-SPT', description: 'Cricket, football, badminton, and physical fitness gear', status: 'Active' }
  ];
  const categories = await ItemCategory.insertMany(categoriesData);
  const catMap = {};
  categories.forEach(c => { catMap[c.code] = c; });

  // 2. Stores / Warehouses
  const storesData = [
    { name: 'Central Campus Warehouse', code: 'STR-01', location: 'Main Admin Block, Ground Floor', managerName: 'Mr. Tariq Mehmood', contactNumber: '+92 300 4567891', description: 'Central receiving hub for all institutional supplies', status: 'Active' },
    { name: 'Operation Theatre & Clinical Lab Store', code: 'STR-02', location: 'Hospital Wing, 2nd Floor Room 204', managerName: 'Dr. Bilal Arshad', contactNumber: '+92 312 8899123', description: 'Controlled sterile store for clinical rotations', status: 'Active' },
    { name: 'Allied Health Sciences Store', code: 'STR-03', location: 'Academic Block A, Lab Complex', managerName: 'Prof. Tariq Mehmood', contactNumber: '+92 321 7766554', description: 'Science and radiography lab practical stocks', status: 'Active' },
    { name: 'Student Dispensary & Retail Store', code: 'STR-04', location: 'Student Services Center Pavilion', managerName: 'Mr. Kamran Khan', contactNumber: '+92 333 9988776', description: 'Official sale point for uniforms, coats, and stationery', status: 'Active' }
  ];
  const stores = await ItemStore.insertMany(storesData);
  const storeMap = {};
  stores.forEach(s => { storeMap[s.code] = s; });

  // 3. Suppliers
  const suppliersData = [
    { name: 'Crown Surgical & Medical Instruments Co.', code: 'SUP-001', contactPerson: 'Muhammad Aslam', phone: '+92 42 37218901', email: 'sales@crownsurgical.pk', address: 'Khadim Ali Road, Small Industrial Estate', city: 'Sialkot / Lahore', companyName: 'Crown Surgical Group', taxNumber: 'NTN-389102-1', paymentTerms: 'Net 30', status: 'Active' },
    { name: 'National Scientific & Laboratory Apparatus Ltd.', code: 'SUP-002', contactPerson: 'Engr. Naveed Akhtar', phone: '+92 51 2284900', email: 'orders@nationalscientific.com.pk', address: 'Plot 45, Industrial Triangle', city: 'Islamabad', companyName: 'National Scientific Corp', taxNumber: 'NTN-890123-4', paymentTerms: 'Net 15', status: 'Active' },
    { name: 'Pak Stationery & Examination Printing Solutions', code: 'SUP-003', contactPerson: 'Haji Riaz Ahmed', phone: '+92 300 8472911', email: 'riaz.paper@pakstationery.pk', address: 'Urdu Bazar, Circular Road', city: 'Lahore', companyName: 'Pak Stationery Mart', taxNumber: 'NTN-441190-2', paymentTerms: 'Cash on Delivery', status: 'Active' },
    { name: 'Olympus Diagnostic & Lab Consumables', code: 'SUP-004', contactPerson: 'Dr. Shahid Latif', phone: '+92 42 35789123', email: 'contact@olympusdiagnostics.pk', address: 'Main Boulevard, Gulberg III', city: 'Lahore', companyName: 'Olympus Healthcare Pakistan', taxNumber: 'NTN-559081-9', paymentTerms: 'Net 30', status: 'Active' }
  ];
  const suppliers = await Supplier.insertMany(suppliersData);
  const supMap = {};
  suppliers.forEach(s => { supMap[s.code] = s; });

  // 4. Inventory Items
  const itemsData = [
    {
      name: 'Sterile Surgical Gloves 7.5 (Box of 50 Pairs)',
      code: 'ITM-MED-001',
      barcode: '8964001001',
      categoryId: catMap['CAT-MED']._id,
      categoryName: catMap['CAT-MED'].name,
      unit: 'Box',
      description: 'Powder-free latex surgical gloves suitable for OT and clinic examinations',
      minStock: 20,
      unitCost: 1800,
      sellingPrice: 2200,
      status: 'Active'
    },
    {
      name: 'Microscope Glass Slides & Coverslips (Pack of 50)',
      code: 'ITM-LAB-002',
      barcode: '8964001002',
      categoryId: catMap['CAT-LAB']._id,
      categoryName: catMap['CAT-LAB'].name,
      unit: 'Pack',
      description: 'High-clarity optical glass slides for histology, pathology, and hematology',
      minStock: 25,
      unitCost: 650,
      sellingPrice: 850,
      status: 'Active'
    },
    {
      name: 'A4 80GSM Photocopy & Exam Paper (Box of 5 Reams)',
      code: 'ITM-STA-003',
      barcode: '8964001003',
      categoryId: catMap['CAT-STA']._id,
      categoryName: catMap['CAT-STA'].name,
      unit: 'Box',
      description: 'Premium ultra-white multi-purpose paper for printing examination question booklets',
      minStock: 10,
      unitCost: 4800,
      sellingPrice: 5500,
      status: 'Active'
    },
    {
      name: 'Surgical Scalpel Handle with Blades #10 (Box of 100)',
      code: 'ITM-OTT-004',
      barcode: '8964001004',
      categoryId: catMap['CAT-OTT']._id,
      categoryName: catMap['CAT-OTT'].name,
      unit: 'Box',
      description: 'Stainless steel reusable scalpel handle with sterile surgical carbon blades',
      minStock: 15,
      unitCost: 1250,
      sellingPrice: 1600,
      status: 'Active'
    },
    {
      name: 'Official College Embroidered White Lab Coat (Size L)',
      code: 'ITM-UNI-005',
      barcode: '8964001005',
      categoryId: catMap['CAT-UNI']._id,
      categoryName: catMap['CAT-UNI'].name,
      unit: 'Pcs',
      description: '100% Cotton drill white clinical coat with Pak Royal College crest insignia',
      minStock: 30,
      unitCost: 1600,
      sellingPrice: 2200,
      status: 'Active'
    },
    {
      name: 'Digital Infrared Forehead Thermometer',
      code: 'ITM-MED-006',
      barcode: '8964001006',
      categoryId: catMap['CAT-MED']._id,
      categoryName: catMap['CAT-MED'].name,
      unit: 'Pcs',
      description: 'Non-contact clinical grade temperature scanner with LCD backlight and memory',
      minStock: 8,
      unitCost: 2400,
      sellingPrice: 3200,
      status: 'Active'
    },
    {
      name: 'Stethoscope Dual Head Professional Edition',
      code: 'ITM-MED-007',
      barcode: '8964001007',
      categoryId: catMap['CAT-MED']._id,
      categoryName: catMap['CAT-MED'].name,
      unit: 'Pcs',
      description: 'Acoustic sensitive cardiology-style stethoscope for nursing and DPT students',
      minStock: 12,
      unitCost: 3500,
      sellingPrice: 4800,
      status: 'Active'
    },
    {
      name: 'Pre-Printed Student Examination Answer Sheets (Pack of 200)',
      code: 'ITM-STA-008',
      barcode: '8964001008',
      categoryId: catMap['CAT-STA']._id,
      categoryName: catMap['CAT-STA'].name,
      unit: 'Pack',
      description: 'Official serialized 16-page answer booklets with college watermark and barcode',
      minStock: 15,
      unitCost: 3200,
      sellingPrice: 3800,
      status: 'Active'
    }
  ];
  const items = await InventoryItem.insertMany(itemsData);
  const itmMap = {};
  items.forEach(it => { itmMap[it.code] = it; });

  // 5. Post Initial Goods Received Notes (GRNs) into Stores
  // GRN 1: Medical & Surgical goods into Central Campus Warehouse from Crown Surgical
  const grn1Items = [
    {
      itemId: itmMap['ITM-MED-001']._id,
      itemName: itmMap['ITM-MED-001'].name,
      itemCode: itmMap['ITM-MED-001'].code,
      unit: itmMap['ITM-MED-001'].unit,
      orderedQuantity: 80,
      receivedQuantity: 80,
      unitCost: 1800,
      discount: 0,
      lineTotal: 80 * 1800
    },
    {
      itemId: itmMap['ITM-OTT-004']._id,
      itemName: itmMap['ITM-OTT-004'].name,
      itemCode: itmMap['ITM-OTT-004'].code,
      unit: itmMap['ITM-OTT-004'].unit,
      orderedQuantity: 50,
      receivedQuantity: 50,
      unitCost: 1250,
      discount: 0,
      lineTotal: 50 * 1250
    },
    {
      itemId: itmMap['ITM-MED-007']._id,
      itemName: itmMap['ITM-MED-007'].name,
      itemCode: itmMap['ITM-MED-007'].code,
      unit: itmMap['ITM-MED-007'].unit,
      orderedQuantity: 40,
      receivedQuantity: 40,
      unitCost: 3500,
      discount: 0,
      lineTotal: 40 * 3500
    }
  ];
  const grn1Total = grn1Items.reduce((sum, i) => sum + i.lineTotal, 0);

  const grn1 = await ItemReceive.create({
    receiptNo: 'GRN-2026-0001',
    date: new Date('2026-10-10'),
    supplierId: supMap['SUP-001']._id,
    supplierName: supMap['SUP-001'].name,
    storeId: storeMap['STR-01']._id,
    storeName: storeMap['STR-01'].name,
    supplierInvoiceNo: 'CS-INV-99201',
    referenceNo: 'PO-2026-081',
    receivedByName: 'Mr. Tariq Mehmood',
    items: grn1Items,
    subtotal: grn1Total,
    discount: 0,
    grandTotal: grn1Total,
    totalItems: grn1Items.length,
    totalQuantity: 170,
    status: 'Posted',
    notes: 'Approved clinical batch shipment inspected and accepted in full.'
  });

  // Create Stock Movements for GRN 1
  for (const row of grn1Items) {
    await StockMovement.create({
      itemId: row.itemId,
      itemName: row.itemName,
      storeId: storeMap['STR-01']._id,
      storeName: storeMap['STR-01'].name,
      transactionType: 'RECEIVE',
      referenceType: 'ItemReceive',
      referenceId: grn1._id,
      referenceNo: grn1.receiptNo,
      quantityIn: row.receivedQuantity,
      quantityOut: 0,
      netQuantity: row.receivedQuantity,
      unitCost: row.unitCost,
      totalValue: row.lineTotal,
      date: grn1.date,
      performedBy: 'Mr. Tariq Mehmood',
      remarks: `GRN from ${grn1.supplierName}`
    });
  }

  // GRN 2: Lab Glassware & Consumables into OT & Clinical Lab Store from Olympus
  const grn2Items = [
    {
      itemId: itmMap['ITM-LAB-002']._id,
      itemName: itmMap['ITM-LAB-002'].name,
      itemCode: itmMap['ITM-LAB-002'].code,
      unit: itmMap['ITM-LAB-002'].unit,
      orderedQuantity: 100,
      receivedQuantity: 100,
      unitCost: 650,
      discount: 0,
      lineTotal: 100 * 650
    },
    {
      itemId: itmMap['ITM-MED-006']._id,
      itemName: itmMap['ITM-MED-006'].name,
      itemCode: itmMap['ITM-MED-006'].code,
      unit: itmMap['ITM-MED-006'].unit,
      orderedQuantity: 25,
      receivedQuantity: 25,
      unitCost: 2400,
      discount: 0,
      lineTotal: 25 * 2400
    }
  ];
  const grn2Total = grn2Items.reduce((sum, i) => sum + i.lineTotal, 0);

  const grn2 = await ItemReceive.create({
    receiptNo: 'GRN-2026-0002',
    date: new Date('2026-10-14'),
    supplierId: supMap['SUP-004']._id,
    supplierName: supMap['SUP-004'].name,
    storeId: storeMap['STR-02']._id,
    storeName: storeMap['STR-02'].name,
    supplierInvoiceNo: 'OLY-44120',
    referenceNo: 'PO-2026-089',
    receivedByName: 'Dr. Bilal Arshad',
    items: grn2Items,
    subtotal: grn2Total,
    discount: 0,
    grandTotal: grn2Total,
    totalItems: grn2Items.length,
    totalQuantity: 125,
    status: 'Posted',
    notes: 'Received in good packaging condition for histology lab.'
  });

  for (const row of grn2Items) {
    await StockMovement.create({
      itemId: row.itemId,
      itemName: row.itemName,
      storeId: storeMap['STR-02']._id,
      storeName: storeMap['STR-02'].name,
      transactionType: 'RECEIVE',
      referenceType: 'ItemReceive',
      referenceId: grn2._id,
      referenceNo: grn2.receiptNo,
      quantityIn: row.receivedQuantity,
      quantityOut: 0,
      netQuantity: row.receivedQuantity,
      unitCost: row.unitCost,
      totalValue: row.lineTotal,
      date: grn2.date,
      performedBy: 'Dr. Bilal Arshad',
      remarks: `GRN from ${grn2.supplierName}`
    });
  }

  // GRN 3: Stationery & Uniform into Student Dispensary Store from Pak Stationery
  const grn3Items = [
    {
      itemId: itmMap['ITM-STA-003']._id,
      itemName: itmMap['ITM-STA-003'].name,
      itemCode: itmMap['ITM-STA-003'].code,
      unit: itmMap['ITM-STA-003'].unit,
      orderedQuantity: 30,
      receivedQuantity: 30,
      unitCost: 4800,
      discount: 0,
      lineTotal: 30 * 4800
    },
    {
      itemId: itmMap['ITM-STA-008']._id,
      itemName: itmMap['ITM-STA-008'].name,
      itemCode: itmMap['ITM-STA-008'].code,
      unit: itmMap['ITM-STA-008'].unit,
      orderedQuantity: 40,
      receivedQuantity: 40,
      unitCost: 3200,
      discount: 0,
      lineTotal: 40 * 3200
    },
    {
      itemId: itmMap['ITM-UNI-005']._id,
      itemName: itmMap['ITM-UNI-005'].name,
      itemCode: itmMap['ITM-UNI-005'].code,
      unit: itmMap['ITM-UNI-005'].unit,
      orderedQuantity: 60,
      receivedQuantity: 60,
      unitCost: 1600,
      discount: 0,
      lineTotal: 60 * 1600
    }
  ];
  const grn3Total = grn3Items.reduce((sum, i) => sum + i.lineTotal, 0);

  const grn3 = await ItemReceive.create({
    receiptNo: 'GRN-2026-0003',
    date: new Date('2026-10-16'),
    supplierId: supMap['SUP-003']._id,
    supplierName: supMap['SUP-003'].name,
    storeId: storeMap['STR-04']._id,
    storeName: storeMap['STR-04'].name,
    supplierInvoiceNo: 'PAK-INV-8109',
    referenceNo: 'PO-2026-094',
    receivedByName: 'Mr. Kamran Khan',
    items: grn3Items,
    subtotal: grn3Total,
    discount: 0,
    grandTotal: grn3Total,
    totalItems: grn3Items.length,
    totalQuantity: 130,
    status: 'Posted',
    notes: 'Exam answer books and student lab coats verified and stacked.'
  });

  for (const row of grn3Items) {
    await StockMovement.create({
      itemId: row.itemId,
      itemName: row.itemName,
      storeId: storeMap['STR-04']._id,
      storeName: storeMap['STR-04'].name,
      transactionType: 'RECEIVE',
      referenceType: 'ItemReceive',
      referenceId: grn3._id,
      referenceNo: grn3.receiptNo,
      quantityIn: row.receivedQuantity,
      quantityOut: 0,
      netQuantity: row.receivedQuantity,
      unitCost: row.unitCost,
      totalValue: row.lineTotal,
      date: grn3.date,
      performedBy: 'Mr. Kamran Khan',
      remarks: `GRN from ${grn3.supplierName}`
    });
  }

  // 6. Post Initial Item Sales (e.g. from Student Retail Store to enrolled students)
  const sell1Items = [
    {
      itemId: itmMap['ITM-UNI-005']._id,
      itemName: itmMap['ITM-UNI-005'].name,
      itemCode: itmMap['ITM-UNI-005'].code,
      unit: itmMap['ITM-UNI-005'].unit,
      quantity: 2,
      unitPrice: 2200,
      discount: 0,
      lineTotal: 4400
    }
  ];
  const sell1 = await ItemSell.create({
    invoiceNo: 'INV-2026-0001',
    date: new Date('2026-10-20'),
    storeId: storeMap['STR-04']._id,
    storeName: storeMap['STR-04'].name,
    customerType: 'Student',
    customerName: 'Muhammad Hamza (PRC-2026-015)',
    customerContact: '+92 301 2345678',
    paymentMethod: 'Cash',
    referenceNo: 'CSH-RECEIPT-881',
    items: sell1Items,
    subtotal: 4400,
    discount: 0,
    grandTotal: 4400,
    paidAmount: 4400,
    totalItems: 1,
    totalQuantity: 2,
    status: 'Posted',
    soldByName: 'Mr. Kamran Khan',
    notes: 'Official student white lab coats purchased over counter.'
  });

  await StockMovement.create({
    itemId: itmMap['ITM-UNI-005']._id,
    itemName: itmMap['ITM-UNI-005'].name,
    storeId: storeMap['STR-04']._id,
    storeName: storeMap['STR-04'].name,
    transactionType: 'SELL',
    referenceType: 'ItemSell',
    referenceId: sell1._id,
    referenceNo: sell1.invoiceNo,
    quantityIn: 0,
    quantityOut: 2,
    netQuantity: -2,
    unitCost: itmMap['ITM-UNI-005'].unitCost,
    totalValue: 4400,
    date: sell1.date,
    performedBy: 'Mr. Kamran Khan',
    remarks: `Sale to ${sell1.customerName}`
  });

  // 7. Post Initial Item Issues (e.g. internal distribution to labs and departments)
  const issue1Items = [
    {
      itemId: itmMap['ITM-MED-001']._id,
      itemName: itmMap['ITM-MED-001'].name,
      itemCode: itmMap['ITM-MED-001'].code,
      unit: itmMap['ITM-MED-001'].unit,
      quantity: 10,
      condition: 'Good / New',
      returnedQuantity: 0,
      remarks: 'Issued for Operation Theatre technician batch practicals'
    },
    {
      itemId: itmMap['ITM-OTT-004']._id,
      itemName: itmMap['ITM-OTT-004'].name,
      itemCode: itmMap['ITM-OTT-004'].code,
      unit: itmMap['ITM-OTT-004'].unit,
      quantity: 5,
      condition: 'Good / New',
      returnedQuantity: 0,
      remarks: 'For demonstration tray setup'
    }
  ];

  const issue1 = await ItemIssue.create({
    issueNo: 'ISS-2026-0001',
    date: new Date('2026-10-22'),
    storeId: storeMap['STR-01']._id,
    storeName: storeMap['STR-01'].name,
    recipientType: 'Department',
    recipientName: 'Operation Theatre & Surgical Department',
    department: 'Allied Health Sciences',
    purpose: 'Hands-on Clinical Training & Midterm Practical Preparation',
    issuedByName: 'Mr. Tariq Mehmood',
    items: issue1Items,
    totalItems: 2,
    totalQuantity: 15,
    status: 'Issued',
    notes: 'Requisition signed by departmental clinical preceptor.'
  });

  for (const row of issue1Items) {
    await StockMovement.create({
      itemId: row.itemId,
      itemName: row.itemName,
      storeId: storeMap['STR-01']._id,
      storeName: storeMap['STR-01'].name,
      transactionType: 'ISSUE',
      referenceType: 'ItemIssue',
      referenceId: issue1._id,
      referenceNo: issue1.issueNo,
      quantityIn: 0,
      quantityOut: row.quantity,
      netQuantity: -row.quantity,
      unitCost: 0,
      totalValue: 0,
      date: issue1.date,
      performedBy: 'Mr. Tariq Mehmood',
      remarks: `Issue to ${issue1.recipientName}`
    });
  }

  // 8. Reconcile all item balances from movements
  for (const itm of items) {
    await recalculateItemStock(itm._id);
  }

  console.log('✅ Inventory system seeded and reconciled successfully!');
}
