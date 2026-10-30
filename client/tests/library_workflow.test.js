const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const dns = require('dns');
const mongoose = require('../node_modules/mongoose');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://codebyqamarshah_db_user:Syed-123%40345@stoofi.btgzyb6.mongodb.net/stoofi?appName=stoofi';

describe('Library Module Models & MongoDB Atlas Verification', () => {
  let BookCategory, Book, IssueBook, LibraryMember, LibrarySubject;

  before(async () => {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });

    const models = require('../lib/models');
    BookCategory = models.BookCategory;
    Book = models.Book;
    IssueBook = models.IssueBook;
    LibraryMember = models.LibraryMember;
    LibrarySubject = models.LibrarySubject;
  });

  after(async () => {
    await mongoose.disconnect();
  });

  it('1. BookCategory model can query and create category', async () => {
    assert.ok(BookCategory, 'BookCategory model should exist');
    const existing = await BookCategory.find().lean();
    assert.ok(Array.isArray(existing), 'BookCategory query should return an array');

    // Create a temporary test category
    const testCat = await BookCategory.create({
      name: 'Verification Test Category',
      description: 'Automated test record'
    });
    assert.ok(testCat._id, 'Created category must have an _id');
    assert.strictEqual(testCat.name, 'Verification Test Category');

    // Clean up test category
    await BookCategory.findByIdAndDelete(testCat._id);
  });

  it('2. Book, IssueBook, LibraryMember, and LibrarySubject models exist and query', async () => {
    assert.ok(Book, 'Book model should exist');
    assert.ok(IssueBook, 'IssueBook model should exist');
    assert.ok(LibraryMember, 'LibraryMember model should exist');
    assert.ok(LibrarySubject, 'LibrarySubject model should exist');

    const [books, issues, members, subjects] = await Promise.all([
      Book.find().limit(5).lean(),
      IssueBook.find().limit(5).lean(),
      LibraryMember.find().limit(5).lean(),
      LibrarySubject.find().limit(5).lean()
    ]);

    assert.ok(Array.isArray(books), 'Books must be array');
    assert.ok(Array.isArray(issues), 'Issues must be array');
    assert.ok(Array.isArray(members), 'Members must be array');
    assert.ok(Array.isArray(subjects), 'Subjects must be array');
  });
});
