package dev.indevs.sunsetzhong.email.data.local;

import androidx.annotation.NonNull;
import androidx.room.DatabaseConfiguration;
import androidx.room.InvalidationTracker;
import androidx.room.RoomDatabase;
import androidx.room.RoomOpenHelper;
import androidx.room.migration.AutoMigrationSpec;
import androidx.room.migration.Migration;
import androidx.room.util.DBUtil;
import androidx.room.util.TableInfo;
import androidx.sqlite.db.SupportSQLiteDatabase;
import androidx.sqlite.db.SupportSQLiteOpenHelper;
import dev.indevs.sunsetzhong.email.data.local.dao.AddressDao;
import dev.indevs.sunsetzhong.email.data.local.dao.AddressDao_Impl;
import dev.indevs.sunsetzhong.email.data.local.dao.EmailDao;
import dev.indevs.sunsetzhong.email.data.local.dao.EmailDao_Impl;
import java.lang.Class;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Generated;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class AppDatabase_Impl extends AppDatabase {
  private volatile EmailDao _emailDao;

  private volatile AddressDao _addressDao;

  @Override
  @NonNull
  protected SupportSQLiteOpenHelper createOpenHelper(@NonNull final DatabaseConfiguration config) {
    final SupportSQLiteOpenHelper.Callback _openCallback = new RoomOpenHelper(config, new RoomOpenHelper.Delegate(1) {
      @Override
      public void createAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS `emails` (`id` TEXT NOT NULL, `source` TEXT, `subject` TEXT, `bodyText` TEXT, `bodyHtml` TEXT, `address` TEXT, `messageId` TEXT, `createdAt` TEXT, `direction` TEXT, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS `addresses` (`id` TEXT NOT NULL, `name` TEXT NOT NULL, `fullAddress` TEXT NOT NULL, `createdAt` TEXT, PRIMARY KEY(`id`))");
        db.execSQL("CREATE TABLE IF NOT EXISTS room_master_table (id INTEGER PRIMARY KEY,identity_hash TEXT)");
        db.execSQL("INSERT OR REPLACE INTO room_master_table (id,identity_hash) VALUES(42, '9dce3fccb4cfa2681bd9aad8feacfcec')");
      }

      @Override
      public void dropAllTables(@NonNull final SupportSQLiteDatabase db) {
        db.execSQL("DROP TABLE IF EXISTS `emails`");
        db.execSQL("DROP TABLE IF EXISTS `addresses`");
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onDestructiveMigration(db);
          }
        }
      }

      @Override
      public void onCreate(@NonNull final SupportSQLiteDatabase db) {
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onCreate(db);
          }
        }
      }

      @Override
      public void onOpen(@NonNull final SupportSQLiteDatabase db) {
        mDatabase = db;
        internalInitInvalidationTracker(db);
        final List<? extends RoomDatabase.Callback> _callbacks = mCallbacks;
        if (_callbacks != null) {
          for (RoomDatabase.Callback _callback : _callbacks) {
            _callback.onOpen(db);
          }
        }
      }

      @Override
      public void onPreMigrate(@NonNull final SupportSQLiteDatabase db) {
        DBUtil.dropFtsSyncTriggers(db);
      }

      @Override
      public void onPostMigrate(@NonNull final SupportSQLiteDatabase db) {
      }

      @Override
      @NonNull
      public RoomOpenHelper.ValidationResult onValidateSchema(
          @NonNull final SupportSQLiteDatabase db) {
        final HashMap<String, TableInfo.Column> _columnsEmails = new HashMap<String, TableInfo.Column>(9);
        _columnsEmails.put("id", new TableInfo.Column("id", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("source", new TableInfo.Column("source", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("subject", new TableInfo.Column("subject", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("bodyText", new TableInfo.Column("bodyText", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("bodyHtml", new TableInfo.Column("bodyHtml", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("address", new TableInfo.Column("address", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("messageId", new TableInfo.Column("messageId", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("createdAt", new TableInfo.Column("createdAt", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsEmails.put("direction", new TableInfo.Column("direction", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysEmails = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesEmails = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoEmails = new TableInfo("emails", _columnsEmails, _foreignKeysEmails, _indicesEmails);
        final TableInfo _existingEmails = TableInfo.read(db, "emails");
        if (!_infoEmails.equals(_existingEmails)) {
          return new RoomOpenHelper.ValidationResult(false, "emails(dev.indevs.sunsetzhong.email.data.local.entity.EmailEntity).\n"
                  + " Expected:\n" + _infoEmails + "\n"
                  + " Found:\n" + _existingEmails);
        }
        final HashMap<String, TableInfo.Column> _columnsAddresses = new HashMap<String, TableInfo.Column>(4);
        _columnsAddresses.put("id", new TableInfo.Column("id", "TEXT", true, 1, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAddresses.put("name", new TableInfo.Column("name", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAddresses.put("fullAddress", new TableInfo.Column("fullAddress", "TEXT", true, 0, null, TableInfo.CREATED_FROM_ENTITY));
        _columnsAddresses.put("createdAt", new TableInfo.Column("createdAt", "TEXT", false, 0, null, TableInfo.CREATED_FROM_ENTITY));
        final HashSet<TableInfo.ForeignKey> _foreignKeysAddresses = new HashSet<TableInfo.ForeignKey>(0);
        final HashSet<TableInfo.Index> _indicesAddresses = new HashSet<TableInfo.Index>(0);
        final TableInfo _infoAddresses = new TableInfo("addresses", _columnsAddresses, _foreignKeysAddresses, _indicesAddresses);
        final TableInfo _existingAddresses = TableInfo.read(db, "addresses");
        if (!_infoAddresses.equals(_existingAddresses)) {
          return new RoomOpenHelper.ValidationResult(false, "addresses(dev.indevs.sunsetzhong.email.data.local.entity.AddressEntity).\n"
                  + " Expected:\n" + _infoAddresses + "\n"
                  + " Found:\n" + _existingAddresses);
        }
        return new RoomOpenHelper.ValidationResult(true, null);
      }
    }, "9dce3fccb4cfa2681bd9aad8feacfcec", "abfec13f23fa20920e181e68c1f6e1e8");
    final SupportSQLiteOpenHelper.Configuration _sqliteConfig = SupportSQLiteOpenHelper.Configuration.builder(config.context).name(config.name).callback(_openCallback).build();
    final SupportSQLiteOpenHelper _helper = config.sqliteOpenHelperFactory.create(_sqliteConfig);
    return _helper;
  }

  @Override
  @NonNull
  protected InvalidationTracker createInvalidationTracker() {
    final HashMap<String, String> _shadowTablesMap = new HashMap<String, String>(0);
    final HashMap<String, Set<String>> _viewTables = new HashMap<String, Set<String>>(0);
    return new InvalidationTracker(this, _shadowTablesMap, _viewTables, "emails","addresses");
  }

  @Override
  public void clearAllTables() {
    super.assertNotMainThread();
    final SupportSQLiteDatabase _db = super.getOpenHelper().getWritableDatabase();
    try {
      super.beginTransaction();
      _db.execSQL("DELETE FROM `emails`");
      _db.execSQL("DELETE FROM `addresses`");
      super.setTransactionSuccessful();
    } finally {
      super.endTransaction();
      _db.query("PRAGMA wal_checkpoint(FULL)").close();
      if (!_db.inTransaction()) {
        _db.execSQL("VACUUM");
      }
    }
  }

  @Override
  @NonNull
  protected Map<Class<?>, List<Class<?>>> getRequiredTypeConverters() {
    final HashMap<Class<?>, List<Class<?>>> _typeConvertersMap = new HashMap<Class<?>, List<Class<?>>>();
    _typeConvertersMap.put(EmailDao.class, EmailDao_Impl.getRequiredConverters());
    _typeConvertersMap.put(AddressDao.class, AddressDao_Impl.getRequiredConverters());
    return _typeConvertersMap;
  }

  @Override
  @NonNull
  public Set<Class<? extends AutoMigrationSpec>> getRequiredAutoMigrationSpecs() {
    final HashSet<Class<? extends AutoMigrationSpec>> _autoMigrationSpecsSet = new HashSet<Class<? extends AutoMigrationSpec>>();
    return _autoMigrationSpecsSet;
  }

  @Override
  @NonNull
  public List<Migration> getAutoMigrations(
      @NonNull final Map<Class<? extends AutoMigrationSpec>, AutoMigrationSpec> autoMigrationSpecs) {
    final List<Migration> _autoMigrations = new ArrayList<Migration>();
    return _autoMigrations;
  }

  @Override
  public EmailDao emailDao() {
    if (_emailDao != null) {
      return _emailDao;
    } else {
      synchronized(this) {
        if(_emailDao == null) {
          _emailDao = new EmailDao_Impl(this);
        }
        return _emailDao;
      }
    }
  }

  @Override
  public AddressDao addressDao() {
    if (_addressDao != null) {
      return _addressDao;
    } else {
      synchronized(this) {
        if(_addressDao == null) {
          _addressDao = new AddressDao_Impl(this);
        }
        return _addressDao;
      }
    }
  }
}
