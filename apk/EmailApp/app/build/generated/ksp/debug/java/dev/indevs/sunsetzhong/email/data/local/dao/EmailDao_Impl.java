package dev.indevs.sunsetzhong.email.data.local.dao;

import android.database.Cursor;
import android.os.CancellationSignal;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.room.CoroutinesRoom;
import androidx.room.EntityDeletionOrUpdateAdapter;
import androidx.room.EntityInsertionAdapter;
import androidx.room.EntityUpsertionAdapter;
import androidx.room.RoomDatabase;
import androidx.room.RoomSQLiteQuery;
import androidx.room.SharedSQLiteStatement;
import androidx.room.util.CursorUtil;
import androidx.room.util.DBUtil;
import androidx.sqlite.db.SupportSQLiteStatement;
import dev.indevs.sunsetzhong.email.data.local.entity.EmailEntity;
import java.lang.Class;
import java.lang.Exception;
import java.lang.Object;
import java.lang.Override;
import java.lang.String;
import java.lang.SuppressWarnings;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import javax.annotation.processing.Generated;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import kotlinx.coroutines.flow.Flow;

@Generated("androidx.room.RoomProcessor")
@SuppressWarnings({"unchecked", "deprecation"})
public final class EmailDao_Impl implements EmailDao {
  private final RoomDatabase __db;

  private final SharedSQLiteStatement __preparedStmtOfDeleteById;

  private final SharedSQLiteStatement __preparedStmtOfDeleteAllByDirection;

  private final EntityUpsertionAdapter<EmailEntity> __upsertionAdapterOfEmailEntity;

  public EmailDao_Impl(@NonNull final RoomDatabase __db) {
    this.__db = __db;
    this.__preparedStmtOfDeleteById = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM emails WHERE id = ?";
        return _query;
      }
    };
    this.__preparedStmtOfDeleteAllByDirection = new SharedSQLiteStatement(__db) {
      @Override
      @NonNull
      public String createQuery() {
        final String _query = "DELETE FROM emails WHERE direction = ?";
        return _query;
      }
    };
    this.__upsertionAdapterOfEmailEntity = new EntityUpsertionAdapter<EmailEntity>(new EntityInsertionAdapter<EmailEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "INSERT INTO `emails` (`id`,`source`,`subject`,`bodyText`,`bodyHtml`,`address`,`messageId`,`createdAt`,`direction`) VALUES (?,?,?,?,?,?,?,?,?)";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final EmailEntity entity) {
        statement.bindString(1, entity.getId());
        if (entity.getSource() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getSource());
        }
        if (entity.getSubject() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getSubject());
        }
        if (entity.getBodyText() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getBodyText());
        }
        if (entity.getBodyHtml() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getBodyHtml());
        }
        if (entity.getAddress() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getAddress());
        }
        if (entity.getMessageId() == null) {
          statement.bindNull(7);
        } else {
          statement.bindString(7, entity.getMessageId());
        }
        if (entity.getCreatedAt() == null) {
          statement.bindNull(8);
        } else {
          statement.bindString(8, entity.getCreatedAt());
        }
        if (entity.getDirection() == null) {
          statement.bindNull(9);
        } else {
          statement.bindString(9, entity.getDirection());
        }
      }
    }, new EntityDeletionOrUpdateAdapter<EmailEntity>(__db) {
      @Override
      @NonNull
      protected String createQuery() {
        return "UPDATE `emails` SET `id` = ?,`source` = ?,`subject` = ?,`bodyText` = ?,`bodyHtml` = ?,`address` = ?,`messageId` = ?,`createdAt` = ?,`direction` = ? WHERE `id` = ?";
      }

      @Override
      protected void bind(@NonNull final SupportSQLiteStatement statement,
          @NonNull final EmailEntity entity) {
        statement.bindString(1, entity.getId());
        if (entity.getSource() == null) {
          statement.bindNull(2);
        } else {
          statement.bindString(2, entity.getSource());
        }
        if (entity.getSubject() == null) {
          statement.bindNull(3);
        } else {
          statement.bindString(3, entity.getSubject());
        }
        if (entity.getBodyText() == null) {
          statement.bindNull(4);
        } else {
          statement.bindString(4, entity.getBodyText());
        }
        if (entity.getBodyHtml() == null) {
          statement.bindNull(5);
        } else {
          statement.bindString(5, entity.getBodyHtml());
        }
        if (entity.getAddress() == null) {
          statement.bindNull(6);
        } else {
          statement.bindString(6, entity.getAddress());
        }
        if (entity.getMessageId() == null) {
          statement.bindNull(7);
        } else {
          statement.bindString(7, entity.getMessageId());
        }
        if (entity.getCreatedAt() == null) {
          statement.bindNull(8);
        } else {
          statement.bindString(8, entity.getCreatedAt());
        }
        if (entity.getDirection() == null) {
          statement.bindNull(9);
        } else {
          statement.bindString(9, entity.getDirection());
        }
        statement.bindString(10, entity.getId());
      }
    });
  }

  @Override
  public Object deleteById(final String id, final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfDeleteById.acquire();
        int _argIndex = 1;
        _stmt.bindString(_argIndex, id);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfDeleteById.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object deleteAllByDirection(final String direction,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        final SupportSQLiteStatement _stmt = __preparedStmtOfDeleteAllByDirection.acquire();
        int _argIndex = 1;
        _stmt.bindString(_argIndex, direction);
        try {
          __db.beginTransaction();
          try {
            _stmt.executeUpdateDelete();
            __db.setTransactionSuccessful();
            return Unit.INSTANCE;
          } finally {
            __db.endTransaction();
          }
        } finally {
          __preparedStmtOfDeleteAllByDirection.release(_stmt);
        }
      }
    }, $completion);
  }

  @Override
  public Object upsertAll(final List<EmailEntity> emails,
      final Continuation<? super Unit> $completion) {
    return CoroutinesRoom.execute(__db, true, new Callable<Unit>() {
      @Override
      @NonNull
      public Unit call() throws Exception {
        __db.beginTransaction();
        try {
          __upsertionAdapterOfEmailEntity.upsert(emails);
          __db.setTransactionSuccessful();
          return Unit.INSTANCE;
        } finally {
          __db.endTransaction();
        }
      }
    }, $completion);
  }

  @Override
  public Flow<List<EmailEntity>> getAllByDirection(final String direction) {
    final String _sql = "SELECT * FROM emails WHERE direction = ? ORDER BY createdAt DESC";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, direction);
    return CoroutinesRoom.createFlow(__db, false, new String[] {"emails"}, new Callable<List<EmailEntity>>() {
      @Override
      @NonNull
      public List<EmailEntity> call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfSource = CursorUtil.getColumnIndexOrThrow(_cursor, "source");
          final int _cursorIndexOfSubject = CursorUtil.getColumnIndexOrThrow(_cursor, "subject");
          final int _cursorIndexOfBodyText = CursorUtil.getColumnIndexOrThrow(_cursor, "bodyText");
          final int _cursorIndexOfBodyHtml = CursorUtil.getColumnIndexOrThrow(_cursor, "bodyHtml");
          final int _cursorIndexOfAddress = CursorUtil.getColumnIndexOrThrow(_cursor, "address");
          final int _cursorIndexOfMessageId = CursorUtil.getColumnIndexOrThrow(_cursor, "messageId");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final int _cursorIndexOfDirection = CursorUtil.getColumnIndexOrThrow(_cursor, "direction");
          final List<EmailEntity> _result = new ArrayList<EmailEntity>(_cursor.getCount());
          while (_cursor.moveToNext()) {
            final EmailEntity _item;
            final String _tmpId;
            _tmpId = _cursor.getString(_cursorIndexOfId);
            final String _tmpSource;
            if (_cursor.isNull(_cursorIndexOfSource)) {
              _tmpSource = null;
            } else {
              _tmpSource = _cursor.getString(_cursorIndexOfSource);
            }
            final String _tmpSubject;
            if (_cursor.isNull(_cursorIndexOfSubject)) {
              _tmpSubject = null;
            } else {
              _tmpSubject = _cursor.getString(_cursorIndexOfSubject);
            }
            final String _tmpBodyText;
            if (_cursor.isNull(_cursorIndexOfBodyText)) {
              _tmpBodyText = null;
            } else {
              _tmpBodyText = _cursor.getString(_cursorIndexOfBodyText);
            }
            final String _tmpBodyHtml;
            if (_cursor.isNull(_cursorIndexOfBodyHtml)) {
              _tmpBodyHtml = null;
            } else {
              _tmpBodyHtml = _cursor.getString(_cursorIndexOfBodyHtml);
            }
            final String _tmpAddress;
            if (_cursor.isNull(_cursorIndexOfAddress)) {
              _tmpAddress = null;
            } else {
              _tmpAddress = _cursor.getString(_cursorIndexOfAddress);
            }
            final String _tmpMessageId;
            if (_cursor.isNull(_cursorIndexOfMessageId)) {
              _tmpMessageId = null;
            } else {
              _tmpMessageId = _cursor.getString(_cursorIndexOfMessageId);
            }
            final String _tmpCreatedAt;
            if (_cursor.isNull(_cursorIndexOfCreatedAt)) {
              _tmpCreatedAt = null;
            } else {
              _tmpCreatedAt = _cursor.getString(_cursorIndexOfCreatedAt);
            }
            final String _tmpDirection;
            if (_cursor.isNull(_cursorIndexOfDirection)) {
              _tmpDirection = null;
            } else {
              _tmpDirection = _cursor.getString(_cursorIndexOfDirection);
            }
            _item = new EmailEntity(_tmpId,_tmpSource,_tmpSubject,_tmpBodyText,_tmpBodyHtml,_tmpAddress,_tmpMessageId,_tmpCreatedAt,_tmpDirection);
            _result.add(_item);
          }
          return _result;
        } finally {
          _cursor.close();
        }
      }

      @Override
      protected void finalize() {
        _statement.release();
      }
    });
  }

  @Override
  public Object getById(final String id, final Continuation<? super EmailEntity> $completion) {
    final String _sql = "SELECT * FROM emails WHERE id = ?";
    final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 1);
    int _argIndex = 1;
    _statement.bindString(_argIndex, id);
    final CancellationSignal _cancellationSignal = DBUtil.createCancellationSignal();
    return CoroutinesRoom.execute(__db, false, _cancellationSignal, new Callable<EmailEntity>() {
      @Override
      @Nullable
      public EmailEntity call() throws Exception {
        final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
        try {
          final int _cursorIndexOfId = CursorUtil.getColumnIndexOrThrow(_cursor, "id");
          final int _cursorIndexOfSource = CursorUtil.getColumnIndexOrThrow(_cursor, "source");
          final int _cursorIndexOfSubject = CursorUtil.getColumnIndexOrThrow(_cursor, "subject");
          final int _cursorIndexOfBodyText = CursorUtil.getColumnIndexOrThrow(_cursor, "bodyText");
          final int _cursorIndexOfBodyHtml = CursorUtil.getColumnIndexOrThrow(_cursor, "bodyHtml");
          final int _cursorIndexOfAddress = CursorUtil.getColumnIndexOrThrow(_cursor, "address");
          final int _cursorIndexOfMessageId = CursorUtil.getColumnIndexOrThrow(_cursor, "messageId");
          final int _cursorIndexOfCreatedAt = CursorUtil.getColumnIndexOrThrow(_cursor, "createdAt");
          final int _cursorIndexOfDirection = CursorUtil.getColumnIndexOrThrow(_cursor, "direction");
          final EmailEntity _result;
          if (_cursor.moveToFirst()) {
            final String _tmpId;
            _tmpId = _cursor.getString(_cursorIndexOfId);
            final String _tmpSource;
            if (_cursor.isNull(_cursorIndexOfSource)) {
              _tmpSource = null;
            } else {
              _tmpSource = _cursor.getString(_cursorIndexOfSource);
            }
            final String _tmpSubject;
            if (_cursor.isNull(_cursorIndexOfSubject)) {
              _tmpSubject = null;
            } else {
              _tmpSubject = _cursor.getString(_cursorIndexOfSubject);
            }
            final String _tmpBodyText;
            if (_cursor.isNull(_cursorIndexOfBodyText)) {
              _tmpBodyText = null;
            } else {
              _tmpBodyText = _cursor.getString(_cursorIndexOfBodyText);
            }
            final String _tmpBodyHtml;
            if (_cursor.isNull(_cursorIndexOfBodyHtml)) {
              _tmpBodyHtml = null;
            } else {
              _tmpBodyHtml = _cursor.getString(_cursorIndexOfBodyHtml);
            }
            final String _tmpAddress;
            if (_cursor.isNull(_cursorIndexOfAddress)) {
              _tmpAddress = null;
            } else {
              _tmpAddress = _cursor.getString(_cursorIndexOfAddress);
            }
            final String _tmpMessageId;
            if (_cursor.isNull(_cursorIndexOfMessageId)) {
              _tmpMessageId = null;
            } else {
              _tmpMessageId = _cursor.getString(_cursorIndexOfMessageId);
            }
            final String _tmpCreatedAt;
            if (_cursor.isNull(_cursorIndexOfCreatedAt)) {
              _tmpCreatedAt = null;
            } else {
              _tmpCreatedAt = _cursor.getString(_cursorIndexOfCreatedAt);
            }
            final String _tmpDirection;
            if (_cursor.isNull(_cursorIndexOfDirection)) {
              _tmpDirection = null;
            } else {
              _tmpDirection = _cursor.getString(_cursorIndexOfDirection);
            }
            _result = new EmailEntity(_tmpId,_tmpSource,_tmpSubject,_tmpBodyText,_tmpBodyHtml,_tmpAddress,_tmpMessageId,_tmpCreatedAt,_tmpDirection);
          } else {
            _result = null;
          }
          return _result;
        } finally {
          _cursor.close();
          _statement.release();
        }
      }
    }, $completion);
  }

  @NonNull
  public static List<Class<?>> getRequiredConverters() {
    return Collections.emptyList();
  }
}
