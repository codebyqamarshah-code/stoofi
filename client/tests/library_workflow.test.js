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

  it('1. BookCategory model exists and queries safely (Read-Only)', async () => {
    assert.ok(BookCategory, 'BookCategory model should exist');
    assert.strictEqual(typeof BookCategory.find, 'function', 'BookCategory must have find method');
    assert.strictEqual(typeof BookCategory.create, 'function', 'BookCategory must have create method');

    // Strict Read-Only query — does NOT create, insert, or delete any records in live database
    const existing = await BookCategory.find().limit(5).lean();
    assert.ok(Array.isArray(existing), 'BookCategory query should return an array');
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
